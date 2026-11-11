import { ref, reactive, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import type { StageMarker } from '@/mock/dashboardData'
import {
  DEFAULT_CAM_POS,
  DEFAULT_TARGET,
  MARKER_3D_CONFIG,
  type ProjectedMarkerPos
} from './stageConfig'
import { buildChonganShrimpBase, type StageAnimatedRefs } from './stageBuilder'
import {
  MAP_DEFAULT_CAM_POS,
  MAP_DEFAULT_TARGET,
  MAP_HUB_WAREHOUSES,
  type HubId
} from './mapStageData'
import { buildGuizhouRadiationMap, type MapAnimatedRefs } from './mapStageBuilder'

export function useThreeStage(
  containerRef: Ref<HTMLDivElement | null>,
  canvasWrapRef: Ref<HTMLDivElement | null>,
  getMarkers: () => StageMarker[]
) {
  const sceneTab = ref<'farm' | 'map'>('farm')
  const selectedHubId = ref<HubId | 'all'>('all')
  const activeMarker = ref<StageMarker | null>(null)
  const isAutoRotate = ref(false)
  const showPulseEffect = ref(true)

  // 厂区模式下每个点位实时投影后的屏幕像素坐标
  const projectedMarkers = reactive<Record<string, ProjectedMarkerPos>>({})

  let scene: THREE.Scene | null = null
  let farmGroup: THREE.Group | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let css2dRenderer: CSS2DRenderer | null = null
  let css3dRenderer: CSS3DRenderer | null = null
  let composer: EffectComposer | null = null
  let bloomPass: UnrealBloomPass | null = null
  let controls: OrbitControls | null = null
  let animationFrameId = 0
  let resizeObserver: ResizeObserver | null = null
  let animatedRefs: StageAnimatedRefs | null = null
  let mapAnimatedRefs: MapAnimatedRefs | null = null

  // 相机平滑飞行插值状态
  const flyState = {
    active: false,
    targetPos: DEFAULT_CAM_POS.clone(),
    targetLookAt: DEFAULT_TARGET.clone()
  }

  // 更新所有 3D 点位在 2D 容器上的投影坐标
  function updateMarkerProjections() {
    if (!camera || !containerRef.value) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    if (width === 0 || height === 0) return

    const tempVec = new THREE.Vector3()
    const markers = getMarkers()
    for (const marker of markers) {
      const cfg = MARKER_3D_CONFIG[marker.id]
      if (!cfg) continue

      tempVec.copy(cfg.anchor)
      tempVec.project(camera)

      const isBehind = tempVec.z > 1
      const screenX = (tempVec.x * 0.5 + 0.5) * width
      const screenY = (-tempVec.y * 0.5 + 0.5) * height
      const inBounds =
        !isBehind &&
        screenX >= -40 &&
        screenX <= width + 40 &&
        screenY >= -40 &&
        screenY <= height + 40

      projectedMarkers[marker.id] = {
        x: Math.round(screenX),
        y: Math.round(screenY),
        visible: inBounds
      }
    }
  }

  // 配置克制型夜景灯光系统（暗调基底 + 局部小半径点光源真实打光）
  function setupLights(sceneInstance: THREE.Scene) {
    // 1. 适度提亮夜空半岛环境光，让外围山体、林带植被与溪流清晰可见，同时保持暗夜基调
    const hemiLight = new THREE.HemisphereLight(0x72a8e8, 0x102845, 0.95)
    hemiLight.position.set(0, 60, 0)
    sceneInstance.add(hemiLight)

    // 2. 柔和月光主方向光（刻画混凝土池壁与大棚屋面阴影立体感，不造成反光过曝）
    const dirLight = new THREE.DirectionalLight(0xd4e6f8, 0.88)
    dirLight.position.set(42, 76, 48)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.near = 10
    dirLight.shadow.camera.far = 180
    const d = 55
    dirLight.shadow.camera.left = -d
    dirLight.shadow.camera.right = d
    dirLight.shadow.camera.top = d
    dirLight.shadow.camera.bottom = -d
    dirLight.shadow.bias = -0.0005
    sceneInstance.add(dirLight)

    // 3. 背侧冷蓝轮廓补光（照亮后山林带与远景桥墩背光面）
    const rimDirLight = new THREE.DirectionalLight(0x3b82f6, 0.55)
    rimDirLight.position.set(-48, 36, -36)
    sceneInstance.add(rimDirLight)

    // 4. 管理用房与休闲平台：小范围暖黄点光源（照亮门廊与休闲平台廊架）
    const officeWarmLight = new THREE.PointLight(0xffb74d, 2.2, 26, 1.8)
    officeWarmLight.position.set(17, 5.8, 17.5)
    sceneInstance.add(officeWarmLight)

    // 5. 后方养虾池大棚前排透视区：局部冰青色点光源
    const greenhouseFrontLight = new THREE.PointLight(0x00d8ff, 1.8, 28, 1.8)
    greenhouseFrontLight.position.set(-2, 6.2, 2)
    sceneInstance.add(greenhouseFrontLight)

    // 6. 左前养虾池区：柔和深海蓝点光源
    const frontPoolsLight = new THREE.PointLight(0x38bdf8, 1.8, 26, 1.8)
    frontPoolsLight.position.set(-13, 5.5, 18)
    sceneInstance.add(frontPoolsLight)

    // 7. 左前外侧新增【设备房】：冷青色工业点光源点缀
    const equipmentRoomLight = new THREE.PointLight(0x00e5ff, 1.9, 22, 1.8)
    equipmentRoomLight.position.set(-36, 6.5, 18)
    sceneInstance.add(equipmentRoomLight)
  }

  function initThreeScene() {
    const wrap = canvasWrapRef.value
    const container = containerRef.value
    if (!wrap || !container) return

    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x06182c)
    scene.fog = new THREE.FogExp2(0x06182c, 0.0042)

    camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 420)
    camera.position.copy(DEFAULT_CAM_POS)

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.96
    wrap.appendChild(renderer.domElement)

    // 初始化 CSS3DRenderer（用于贴地立体地州市名与总厂/三大枢纽仓 3D 精灵立牌）
    css3dRenderer = new CSS3DRenderer()
    css3dRenderer.setSize(width, height)
    css3dRenderer.domElement.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;display:none;overflow:hidden;'
    wrap.appendChild(css3dRenderer.domElement)

    // 初始化 CSS2DRenderer（用于下辖辐射县市清晰正对屏幕标签）
    css2dRenderer = new CSS2DRenderer()
    css2dRenderer.setSize(width, height)
    css2dRenderer.domElement.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:6;display:none;overflow:hidden;'
    wrap.appendChild(css2dRenderer.domElement)

    // 后期微泛光渲染管线（高阈值、低强度，仅对灯芯与窗格做精致点缀，绝不泛白）
    composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.28, // strength：克制柔和的微泛光强度
      0.25, // radius：紧凑光晕半径，避免大面积雾化
      0.92 // threshold：高阈值，普通建筑墙面与屋顶绝不触发泛光
    )
    composer.addPass(bloomPass)

    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(DEFAULT_TARGET)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.maxPolarAngle = Math.PI / 2 - 0.08
    controls.minDistance = 16
    controls.maxDistance = 145
    controls.autoRotate = isAutoRotate.value
    controls.autoRotateSpeed = 0.4

    controls.addEventListener('start', () => {
      flyState.active = false
    })

    setupLights(scene)

    // 1. 构建 3D 孪生厂房场景组
    farmGroup = new THREE.Group()
    farmGroup.name = 'ChonganFarmGroup'
    scene.add(farmGroup)
    animatedRefs = buildChonganShrimpBase(farmGroup as unknown as THREE.Scene)

    // 2. 构建贵州省及周边产销辐射 3D 点线地图场景组（默认隐藏，通过顶部 Tabs 切换）
    const mapBuilt = buildGuizhouRadiationMap((hubId) => selectMapHub(hubId))
    mapAnimatedRefs = mapBuilt.animatedRefs
    mapAnimatedRefs.rootGroup.visible = false
    mapAnimatedRefs.setLabelsVisible(false)
    scene.add(mapAnimatedRefs.rootGroup)

    const clock = new THREE.Clock()
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()
      const delta = clock.getDelta() || 0.016

      if (sceneTab.value === 'farm' && animatedRefs) {
        // 1. 周期脉冲光环扩散特效
        animatedRefs.pulseRings.forEach((ring) => {
          ring.visible = showPulseEffect.value
          if (!showPulseEffect.value) return
          const phase = (elapsed * 0.2 + ring.userData.phase) % 1
          const scale = 1 + phase * 32
          ring.scale.set(scale, scale, 1)
          const mat = ring.material as THREE.MeshBasicMaterial
          mat.opacity = (1 - phase) * 0.22
        })

        // 2. 循环水管网流光脉冲球移动
        animatedRefs.flowPulses.forEach((item) => {
          item.progress = (item.progress + item.speed * 0.008) % 1
          const pt = item.curve.getPointAt(item.progress)
          item.mesh.position.copy(pt)
          item.mesh.visible = showPulseEffect.value
        })

        // 3. 虾池微孔增氧气泡上浮
        if (animatedRefs.bubbleParticles) {
          animatedRefs.bubbleParticles.visible = showPulseEffect.value
          const bPos = animatedRefs.bubbleParticles.geometry.attributes.position
          for (let i = 0; i < bPos.count; i++) {
            let py = bPos.getY(i) + 0.025
            if (py > 3.2) py = 0.6
            bPos.setY(i, py)
          }
          bPos.needsUpdate = true
        }

        // 4. 罗茨风机叶轮光环旋转
        animatedRefs.blowerFans.forEach((fan) => {
          fan.rotation.x = elapsed * 3.5
        })

        // 5. 选中点位高亮光环呼吸动画
        if (animatedRefs.highlightGroup.visible) {
          const pulseScale = 1 + Math.sin(elapsed * 4) * 0.08
          animatedRefs.highlightRingOuter.scale.set(pulseScale, pulseScale, 1)
          animatedRefs.highlightRingOuter.rotation.z = elapsed * 0.8
        }
      } else if (sceneTab.value === 'map' && mapAnimatedRefs) {
        // 地图模式 1：两级飞线流光粒子沿贝塞尔弧线推进
        mapAnimatedRefs.comets.forEach((comet) => {
          const isHubVisible =
            selectedHubId.value === 'all' || selectedHubId.value === comet.hubId
          comet.mesh.visible = showPulseEffect.value && isHubVisible
          if (!comet.mesh.visible) return
          comet.progress = (comet.progress + comet.speed * 0.011) % 1
          const pt = comet.curve.getPointAt(comet.progress)
          comet.mesh.position.copy(pt)
        })

        // 地图模式 2：总厂与三大枢纽仓底座脉冲波纹扩散
        mapAnimatedRefs.pulseRings.forEach((ring) => {
          const phase = (elapsed * 0.45 + (ring.userData.phase || 0)) % 1
          const maxScale = ring.userData.maxScale || 3.5
          const scale = 1 + phase * maxScale
          ring.scale.set(scale, scale, 1)
          const mat = ring.material as THREE.MeshBasicMaterial
          mat.opacity = (1 - phase) * 0.78
        })

        // 地图模式 3：底部科技刻度环微旋转与光柱呼吸
        mapAnimatedRefs.techRings.forEach((ring, idx) => {
          ring.rotation.y = elapsed * (idx % 2 === 0 ? 0.06 : -0.04)
        })
        mapAnimatedRefs.beaconColumns.forEach((col, idx) => {
          const s = 1 + Math.sin(elapsed * 3.2 + idx) * 0.08
          col.scale.set(s, 1, s)
        })
      }

      // 6. 相机平滑聚焦飞行插值 (Fly-to)
      if (flyState.active && camera && controls) {
        camera.position.lerp(flyState.targetPos, Math.min(1, delta * 4.5 + 0.06))
        controls.target.lerp(flyState.targetLookAt, Math.min(1, delta * 4.5 + 0.06))
        if (
          camera.position.distanceTo(flyState.targetPos) < 0.35 &&
          controls.target.distanceTo(flyState.targetLookAt) < 0.25
        ) {
          flyState.active = false
        }
      }

      if (controls) {
        controls.autoRotate = isAutoRotate.value && !flyState.active
        controls.update()
      }

      if (composer && scene && camera) {
        composer.render()
        if (sceneTab.value === 'farm') {
          updateMarkerProjections()
        } else {
          css3dRenderer?.render(scene, camera)
          css2dRenderer?.render(scene, camera)
        }
      }
    }

    animate()

    resizeObserver = new ResizeObserver(() => {
      if (!containerRef.value || !renderer || !camera || !composer) return
      const w = containerRef.value.clientWidth
      const h = containerRef.value.clientHeight
      if (w > 0 && h > 0) {
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
        composer.setSize(w, h)
        css3dRenderer?.setSize(w, h)
        css2dRenderer?.setSize(w, h)
        bloomPass?.resolution.set(w, h)
        if (sceneTab.value === 'farm') {
          updateMarkerProjections()
        } else if (scene) {
          css3dRenderer?.render(scene, camera)
          css2dRenderer?.render(scene, camera)
        }
      }
    })
    resizeObserver.observe(container)
  }

  const selectMarker = (marker: StageMarker) => {
    if (activeMarker.value?.id === marker.id) {
      clearActiveMarker()
      return
    }

    activeMarker.value = marker
    const cfg = MARKER_3D_CONFIG[marker.id]
    if (cfg) {
      flyState.targetLookAt.copy(cfg.anchor)
      flyState.targetPos.copy(cfg.camOffset)
      flyState.active = true

      if (animatedRefs) {
        animatedRefs.highlightGroup.position.set(cfg.anchor.x, 0, cfg.anchor.z)
        const rScale = cfg.radius / 5
        animatedRefs.highlightBeam.scale.set(rScale, 1, rScale)
        animatedRefs.highlightGroup.visible = true
      }
    }
  }

  const clearActiveMarker = () => {
    activeMarker.value = null
    if (animatedRefs) {
      animatedRefs.highlightGroup.visible = false
    }
  }

  // 切换顶部双场景 Tab（3D 孪生厂区 / 产销辐射地图）
  const switchSceneTab = (tab: 'farm' | 'map') => {
    if (sceneTab.value === tab) return
    sceneTab.value = tab
    clearActiveMarker()

    const isMap = tab === 'map'
    if (farmGroup) {
      farmGroup.visible = !isMap
    }
    if (mapAnimatedRefs) {
      mapAnimatedRefs.rootGroup.visible = isMap
      mapAnimatedRefs.setLabelsVisible(isMap)
    }
    if (css3dRenderer) {
      css3dRenderer.domElement.style.display = isMap ? 'block' : 'none'
    }
    if (css2dRenderer) {
      css2dRenderer.domElement.style.display = isMap ? 'block' : 'none'
    }

    if (tab === 'farm') {
      if (bloomPass) {
        bloomPass.strength = showPulseEffect.value ? 0.28 : 0.1
      }
      flyState.targetPos.copy(DEFAULT_CAM_POS)
      flyState.targetLookAt.copy(DEFAULT_TARGET)
      flyState.active = true
      updateMarkerProjections()
    } else {
      if (bloomPass) {
        bloomPass.strength = showPulseEffect.value ? 0.36 : 0.15
      }
      selectMapHub('all')
    }
  }

  // 产销辐射地图下筛选/聚焦指定枢纽仓
  const selectMapHub = (hubId: HubId | 'all') => {
    selectedHubId.value = hubId
    if (mapAnimatedRefs) {
      ;(Object.keys(mapAnimatedRefs.hubGroups) as HubId[]).forEach((id) => {
        mapAnimatedRefs!.hubGroups[id].visible = hubId === 'all' || hubId === id
      })
      mapAnimatedRefs.updateLabelStyles(hubId)
    }

    if (hubId === 'all') {
      flyState.targetPos.copy(MAP_DEFAULT_CAM_POS)
      flyState.targetLookAt.copy(MAP_DEFAULT_TARGET)
      flyState.active = true
    } else {
      const targetHub = MAP_HUB_WAREHOUSES.find((h) => h.id === hubId)
      if (targetHub) {
        flyState.targetPos.copy(targetHub.camPos)
        flyState.targetLookAt.copy(targetHub.camTarget)
        flyState.active = true
      }
    }
  }

  const resetCameraView = () => {
    if (sceneTab.value === 'farm') {
      clearActiveMarker()
      flyState.targetPos.copy(DEFAULT_CAM_POS)
      flyState.targetLookAt.copy(DEFAULT_TARGET)
      flyState.active = true
    } else {
      selectMapHub('all')
    }
  }

  const toggleAutoRotate = () => {
    isAutoRotate.value = !isAutoRotate.value
  }

  const togglePulseEffect = () => {
    showPulseEffect.value = !showPulseEffect.value
    if (bloomPass) {
      const activeStrength = sceneTab.value === 'map' ? 0.36 : 0.28
      bloomPass.strength = showPulseEffect.value ? activeStrength : 0.1
    }
  }

  watch(getMarkers, (newMarkers) => {
    if (activeMarker.value) {
      const matched = newMarkers.find((m) => m.id === activeMarker.value?.id)
      activeMarker.value = matched ?? null
    }
  })

  onMounted(() => {
    initThreeScene()
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId)
    resizeObserver?.disconnect()
    controls?.dispose()
    if (scene) {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          } else {
            mesh.material.dispose()
          }
        }
      })
    }
    composer?.dispose()
    renderer?.dispose()
    css3dRenderer?.domElement.remove()
    css2dRenderer?.domElement.remove()
  })

  return {
    sceneTab,
    selectedHubId,
    activeMarker,
    isAutoRotate,
    showPulseEffect,
    projectedMarkers,
    selectMarker,
    clearActiveMarker,
    switchSceneTab,
    selectMapHub,
    resetCameraView,
    toggleAutoRotate,
    togglePulseEffect
  }
}
