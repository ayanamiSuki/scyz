import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import {
  GUIZHOU_CITY_REGIONS,
  HUAIHUA_DISTRICT_REGIONS,
  CROSS_BORDER_ADJACENT_REGIONS,
  GUIZHOU_INNER_COUNTY_LINES,
  HQ_ORIGIN_NODE,
  MAP_HUB_WAREHOUSES,
  lngLatToWorldXZ,
  lngLatToVector3,
  type HubId,
  type GeoRegionData,
  type MapHubWarehouse,
  type MapTargetCity
} from './mapStageData'
import { createGlowTexture } from './stageTextures'

export interface MapFlowComet {
  mesh: THREE.Mesh
  curve: THREE.QuadraticBezierCurve3
  progress: number
  speed: number
  hubId: HubId
  tier: 1 | 2
}

export interface MapAnimatedRefs {
  rootGroup: THREE.Group
  comets: MapFlowComet[]
  pulseRings: THREE.Mesh[]
  techRings: THREE.Object3D[]
  beaconColumns: THREE.Mesh[]
  hubGroups: Record<HubId, THREE.Group>
  /** 根据当前选中的枢纽仓，联动更新 CSS3D / CSS2D 标签的高亮与显隐状态 */
  updateLabelStyles: (selectedHubId: HubId | 'all') => void
  /** 切换场景 Tab 时统一控制所有 CSS2D / CSS3D 标签的可见性 */
  setLabelsVisible: (visible: boolean) => void
}

const GUIZHOU_EXTRUDE_HEIGHT = 2.35
const ADJACENT_EXTRUDE_HEIGHT = 1.85

/**
 * 程序化生成贵州喀斯特山脉浮雕纹理（颜色贴图 + 凹凸高度贴图）
 * 还原参考图中灰蓝冷峻山脊褶皱肌理
 */
function createKarstReliefTextures(): {
  colorMap: THREE.CanvasTexture
  bumpMap: THREE.CanvasTexture
} {
  const size = 512
  const colorCanvas = document.createElement('canvas')
  colorCanvas.width = size
  colorCanvas.height = size
  const cCtx = colorCanvas.getContext('2d')!

  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = size
  bumpCanvas.height = size
  const bCtx = bumpCanvas.getContext('2d')!

  const cImg = cCtx.createImageData(size, size)
  const bImg = bCtx.createImageData(size, size)

  // 多重山脊噪声叠加（Ridged Multifractal 近似）
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size
      const ny = y / size

      const w1 = Math.sin(nx * 22 + Math.cos(ny * 18) * 1.6)
      const w2 = Math.cos(ny * 26 - Math.sin(nx * 24) * 1.4)
      const w3 = Math.sin((nx + ny) * 48 + Math.sin(nx * 35 - ny * 31))
      const w4 = Math.cos((nx - ny) * 85 + w3 * 1.2)

      // 形成尖锐山脊线条感
      const ridge1 = 1 - Math.abs(w1 * 0.55 + w2 * 0.45)
      const ridge2 = 1 - Math.abs(w3)
      const ridge3 = 1 - Math.abs(w4)
      const height = Math.min(1, Math.max(0, ridge1 * 0.52 + ridge2 * 0.32 + ridge3 * 0.16))

      const idx = (y * size + x) * 4

      // 颜色：深灰蓝山谷 (#1b334b) -> 岩石灰蓝坡面 (#355878) -> 冷白蓝山脊高光 (#6e95b5)
      cImg.data[idx] = Math.round(26 + height * 78)
      cImg.data[idx + 1] = Math.round(52 + height * 96)
      cImg.data[idx + 2] = Math.round(78 + height * 108)
      cImg.data[idx + 3] = 255

      const bVal = Math.round(height * 255)
      bImg.data[idx] = bVal
      bImg.data[idx + 1] = bVal
      bImg.data[idx + 2] = bVal
      bImg.data[idx + 3] = 255
    }
  }

  cCtx.putImageData(cImg, 0, 0)
  bCtx.putImageData(bImg, 0, 0)

  const colorMap = new THREE.CanvasTexture(colorCanvas)
  colorMap.wrapS = THREE.RepeatWrapping
  colorMap.wrapT = THREE.RepeatWrapping
  colorMap.repeat.set(0.032, 0.032)

  const bumpMap = new THREE.CanvasTexture(bumpCanvas)
  bumpMap.wrapS = THREE.RepeatWrapping
  bumpMap.wrapT = THREE.RepeatWrapping
  bumpMap.repeat.set(0.032, 0.032)

  return { colorMap, bumpMap }
}

/**
 * 创建边缘垂直向上渐隐的科技光幕贴图（还原参考图省界四周向上升腾的冰蓝光晕）
 */
function createVerticalCurtainTexture(colorStr = '0, 198, 255'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 128, 0, 0)
  grad.addColorStop(0, `rgba(${colorStr}, 0.72)`)
  grad.addColorStop(0.35, `rgba(${colorStr}, 0.26)`)
  grad.addColorStop(1, `rgba(${colorStr}, 0.0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 32, 128)
  return new THREE.CanvasTexture(canvas)
}

/**
 * 构建底部深海科技光环与刻度盘底座（对应参考图底部同心圆环与虚线刻度）
 */
function createMapTechBase(techRings: THREE.Object3D[]): THREE.Group {
  const baseGroup = new THREE.Group()

  // 1. 底部暗夜径向渐变镜面圆盘
  const floorGeo = new THREE.CircleGeometry(78, 96)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x031126,
    roughness: 0.35,
    metalness: 0.45,
    transparent: true,
    opacity: 0.92
  })
  const floorMesh = new THREE.Mesh(floorGeo, floorMat)
  floorMesh.rotation.x = -Math.PI / 2
  floorMesh.position.y = -0.15
  baseGroup.add(floorMesh)

  // 2. 外圈科技细实线环
  const outerRingGeo = new THREE.RingGeometry(56.5, 56.9, 128)
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.42
  })
  const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat)
  outerRing.rotation.x = -Math.PI / 2
  outerRing.position.y = -0.08
  baseGroup.add(outerRing)

  // 3. 外圈旋转虚线刻度光环
  const dashedPts: THREE.Vector3[] = []
  const radius = 53.5
  for (let i = 0; i <= 180; i++) {
    const angle = (i / 180) * Math.PI * 2
    dashedPts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
  }
  const dashedGeo = new THREE.BufferGeometry().setFromPoints(dashedPts)
  const dashedMat = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    dashSize: 1.2,
    gapSize: 0.9,
    transparent: true,
    opacity: 0.55
  })
  const dashedLine = new THREE.Line(dashedGeo, dashedMat)
  dashedLine.computeLineDistances()
  dashedLine.position.y = -0.05
  baseGroup.add(dashedLine)
  techRings.push(dashedLine)

  // 4. 内圈柔光环
  const innerRingGeo = new THREE.RingGeometry(43.2, 44.1, 128)
  const innerRingMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.22
  })
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat)
  innerRing.rotation.x = -Math.PI / 2
  innerRing.position.y = -0.06
  baseGroup.add(innerRing)
  techRings.push(innerRing)

  return baseGroup
}

/**
 * 沿板块边界生成垂直发光光幕（还原参考图边缘向上散射的蓝色光晕）
 */
function createBoundaryLightCurtain(
  worldPts: [number, number][],
  baseY: number,
  curtainHeight: number,
  texture: THREE.CanvasTexture
): THREE.Mesh {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  // 避免过多顶点，进行微小步长抽样
  const step = worldPts.length > 250 ? 2 : 1
  const sampledPts: [number, number][] = []
  for (let i = 0; i < worldPts.length; i += step) {
    sampledPts.push(worldPts[i])
  }

  for (let i = 0; i < sampledPts.length; i++) {
    const [x1, z1] = sampledPts[i]
    const [x2, z2] = sampledPts[(i + 1) % sampledPts.length]

    const vIdx = i * 4
    positions.push(
      x1, baseY, z1,
      x2, baseY, z2,
      x2, baseY + curtainHeight, z2,
      x1, baseY + curtainHeight, z1
    )
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1)
    indices.push(vIdx, vIdx + 1, vIdx + 2, vIdx, vIdx + 2, vIdx + 3)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  return new THREE.Mesh(geo, mat)
}

/**
 * 第一层（CSS3DObject）：创建平铺贴合在 3D 地形表面的地州市立体名称标签
 * 注意：CSS3DRenderer 会覆盖根元素的 transform，因此样式与动画写在内部 inner 子节点上
 */
function createRegionSurfaceCss3DLabel(
  labelText: string,
  worldPos: THREE.Vector3
): { obj: CSS3DObject; innerEl: HTMLDivElement } {
  const rootEl = document.createElement('div')
  rootEl.style.pointerEvents = 'none'
  rootEl.style.userSelect = 'none'

  const innerEl = document.createElement('div')
  innerEl.textContent = labelText
  innerEl.style.cssText = `
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #e6f4ff;
    white-space: nowrap;
    text-shadow: 0 2px 6px rgba(0, 8, 22, 0.98), 0 0 12px rgba(0, 180, 255, 0.55);
    transition: opacity 0.3s ease;
    opacity: 0.88;
  `
  rootEl.appendChild(innerEl)

  const css3dObj = new CSS3DObject(rootEl)
  css3dObj.position.copy(worldPos)
  // 平铺在 XZ 地形表面（绕 X 轴旋转 -90°）
  css3dObj.rotation.x = -Math.PI / 2
  css3dObj.scale.set(0.115, 0.115, 0.115)

  return { obj: css3dObj, innerEl }
}

/**
 * 第二层（CSS2DObject）：创建黄平重安镇总厂核心立牌（置顶最高优先级 z-index:35，绝不被区县标签遮挡）
 */
function createHqCss2DLabel(
  name: string,
  worldPos: THREE.Vector3,
  onSelectHub?: (hubId: HubId | 'all') => void
): CSS2DObject {
  const rootEl = document.createElement('div')
  rootEl.style.cssText = 'position:relative; pointer-events:none; user-select:none; z-index:35;'

  const innerEl = document.createElement('div')
  innerEl.style.cssText = `
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(8, 38, 77, 0.96) 0%, rgba(13, 63, 122, 0.96) 50%, rgba(8, 38, 77, 0.96) 100%);
    border: 1.5px solid #ffe066;
    color: #fffbeb;
    box-shadow: 0 0 22px rgba(255, 224, 102, 0.72), 0 4px 14px rgba(0, 0, 0, 0.6);
    cursor: pointer;
    pointer-events: auto;
    white-space: nowrap;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
  `
  innerEl.innerHTML = `
    <span style="width: 10px; height: 10px; border-radius: 9999px; background: #ffe066; box-shadow: 0 0 10px #ffe066; display: inline-block;"></span>
    <span style="font-size: 14px; font-weight: 700; letter-spacing: 1px; text-shadow: 0 1px 3px rgba(0,0,0,0.85);">★ ${name}</span>
  `
  innerEl.addEventListener('mouseenter', () => {
    innerEl.style.transform = 'scale(1.08)'
    innerEl.style.boxShadow = '0 0 28px rgba(255, 224, 102, 0.9), 0 6px 18px rgba(0, 0, 0, 0.65)'
  })
  innerEl.addEventListener('mouseleave', () => {
    innerEl.style.transform = 'scale(1)'
    innerEl.style.boxShadow = '0 0 22px rgba(255, 224, 102, 0.72), 0 4px 14px rgba(0, 0, 0, 0.6)'
  })
  innerEl.addEventListener('click', (e) => {
    e.stopPropagation()
    onSelectHub?.('all')
  })

  rootEl.appendChild(innerEl)

  const obj = new CSS2DObject(rootEl)
  obj.position.copy(worldPos)
  return obj
}

/**
 * 第二层（CSS2DObject）：创建三大枢纽仓核心交互立牌（次高优先级 z-index:25，高于所有区县标签）
 */
function createHubCss2DLabel(
  hub: MapHubWarehouse,
  worldPos: THREE.Vector3,
  onSelectHub?: (hubId: HubId | 'all') => void
): { obj: CSS2DObject; updateActive: (selectedHubId: HubId | 'all') => void } {
  const rootEl = document.createElement('div')
  rootEl.style.cssText = 'position:relative; pointer-events:none; user-select:none; z-index:25;'

  const innerEl = document.createElement('div')
  const isPlanned = hub.status === 'planned'
  const dotColor = isPlanned ? '#fbbf24' : '#00e5ff'
  const badgeBg = isPlanned ? 'rgba(251, 191, 36, 0.28)' : 'rgba(0, 229, 255, 0.25)'
  const badgeText = isPlanned ? '#fef08a' : '#7dd3fc'

  innerEl.innerHTML = `
    <span style="width: 8px; height: 8px; border-radius: 9999px; background: ${dotColor}; box-shadow: 0 0 8px ${dotColor}; display: inline-block;"></span>
    <span style="font-size: 13.5px; font-weight: 700; letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(0,0,0,0.85);">${hub.name}</span>
    <span style="font-size: 11px; padding: 1.5px 7px; border-radius: 9999px; background: ${badgeBg}; color: ${badgeText}; font-weight: 500;">
      ${isPlanned ? '2027规划' : '已合作'}
    </span>
  `

  const applyStyle = (isSelected: boolean, isHovered = false) => {
    const scaleVal = isSelected ? 1.12 : isHovered ? 1.06 : 1
    if (isPlanned) {
      innerEl.style.cssText = `
        transform: scale(${scaleVal});
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 9999px;
        background: ${isSelected ? 'rgba(66, 40, 6, 0.98)' : 'rgba(46, 28, 5, 0.92)'};
        border: 1.5px solid ${isSelected ? '#fbbf24' : 'rgba(251, 191, 36, 0.85)'};
        color: ${isSelected ? '#fef08a' : '#fde68a'};
        box-shadow: ${isSelected ? '0 0 20px rgba(251, 191, 36, 0.75)' : '0 4px 12px rgba(0, 0, 0, 0.55)'};
        cursor: pointer;
        pointer-events: auto;
        white-space: nowrap;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background 0.25s ease;
      `
    } else {
      innerEl.style.cssText = `
        transform: scale(${scaleVal});
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 9999px;
        background: ${isSelected ? 'rgba(3, 57, 108, 0.98)' : 'rgba(5, 35, 71, 0.92)'};
        border: 1.5px solid ${isSelected ? '#00e5ff' : 'rgba(0, 229, 255, 0.85)'};
        color: ${isSelected ? '#ffffff' : '#e0f7ff'};
        box-shadow: ${isSelected ? '0 0 20px rgba(0, 229, 255, 0.75)' : '0 4px 12px rgba(0, 0, 0, 0.55)'};
        cursor: pointer;
        pointer-events: auto;
        white-space: nowrap;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background 0.25s ease;
      `
    }
  }

  let currentSelected = false
  applyStyle(false)

  innerEl.addEventListener('mouseenter', () => applyStyle(currentSelected, true))
  innerEl.addEventListener('mouseleave', () => applyStyle(currentSelected, false))
  innerEl.addEventListener('click', (e) => {
    e.stopPropagation()
    onSelectHub?.(hub.id)
  })

  rootEl.appendChild(innerEl)

  const obj = new CSS2DObject(rootEl)
  obj.position.copy(worldPos)

  return {
    obj,
    updateActive: (selectedHubId: HubId | 'all') => {
      currentSelected = selectedHubId === hub.id
      applyStyle(currentSelected, false)
    }
  }
}

/**
 * 第三层（CSS2DObject）：创建下辖辐射区县标签
 * 基础层级 z-index:10，绝对低于总厂与各枢纽仓，pointer-events:none 绝不干扰点击与交互
 */
function createCityCss2DLabel(
  city: MapTargetCity,
  worldPos: THREE.Vector3
): { obj: CSS2DObject; updateState: (selectedHubId: HubId | 'all') => void } {
  const rootEl = document.createElement('div')
  rootEl.style.cssText = 'position:relative; pointer-events:none; user-select:none; z-index:10;'

  const innerEl = document.createElement('span')
  innerEl.textContent = city.name
  rootEl.appendChild(innerEl)

  const isPlanned = city.status === 'planned'
  const applyCityStyle = (isFocusedHub: boolean) => {
    if (isPlanned) {
      innerEl.style.cssText = `
        display: inline-block;
        padding: 1.5px 6px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        background: rgba(42, 28, 5, 0.82);
        border: 1px solid rgba(251, 191, 36, 0.5);
        color: #fde68a;
        transition: all 0.25s ease;
        pointer-events: none;
      `
    } else if (isFocusedHub) {
      innerEl.style.cssText = `
        display: inline-block;
        padding: 2px 7px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        background: rgba(4, 36, 74, 0.90);
        border: 1px solid rgba(0, 229, 255, 0.8);
        color: #ffffff;
        box-shadow: 0 0 8px rgba(0, 229, 255, 0.35);
        transition: all 0.25s ease;
        pointer-events: none;
      `
    } else {
      innerEl.style.cssText = `
        display: inline-block;
        padding: 1.5px 5.5px;
        border-radius: 4px;
        font-size: 10.5px;
        white-space: nowrap;
        background: rgba(4, 24, 52, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: rgba(186, 230, 253, 0.9);
        transition: all 0.25s ease;
        pointer-events: none;
      `
    }
  }

  applyCityStyle(false)

  const css2dObj = new CSS2DObject(rootEl)
  css2dObj.position.copy(worldPos)

  return {
    obj: css2dObj,
    updateState: (selectedHubId: HubId | 'all') => {
      const visible = selectedHubId === 'all' || selectedHubId === city.hubId
      css2dObj.visible = visible
      rootEl.style.display = visible ? 'block' : 'none'
      if (visible) {
        applyCityStyle(selectedHubId === city.hubId)
      }
    }
  }
}

/**
 * 构建贵州省 9 地州市 + 东侧跨省协同区 3D 挤压浮雕地图与两级产销飞线场景
 */
export function buildGuizhouRadiationMap(onSelectHub?: (hubId: HubId | 'all') => void): {
  animatedRefs: MapAnimatedRefs
} {
  const rootGroup = new THREE.Group()
  rootGroup.name = 'GuizhouRadiationMapGroup'

  const comets: MapFlowComet[] = []
  const pulseRings: THREE.Mesh[] = []
  const techRings: THREE.Object3D[] = []
  const beaconColumns: THREE.Mesh[] = []

  const regionLabelInners: HTMLDivElement[] = []
  const hubLabelControllers: Array<{ updateActive: (selectedHubId: HubId | 'all') => void }> = []
  const cityLabelControllers: Array<{ updateState: (selectedHubId: HubId | 'all') => void }> = []
  const allCssObjects: THREE.Object3D[] = []

  const hubGroups: Record<HubId, THREE.Group> = {
    'hub-kaili': new THREE.Group(),
    'hub-huaihua': new THREE.Group(),
    'hub-guiyang': new THREE.Group()
  }
  rootGroup.add(hubGroups['hub-kaili'], hubGroups['hub-huaihua'], hubGroups['hub-guiyang'])

  // 1. 底部科技圆环底座
  rootGroup.add(createMapTechBase(techRings))

  // 2. 材质准备（顶面喀斯特浮雕 + 侧面科技冰蓝阶梯发光壁）
  const { colorMap, bumpMap } = createKarstReliefTextures()
  const curtainTex = createVerticalCurtainTexture('0, 195, 255')

  const guizhouTopMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    bumpMap,
    bumpScale: 0.42,
    roughness: 0.62,
    metalness: 0.22,
    emissive: 0x0b2540,
    emissiveIntensity: 0.35
  })

  const guizhouSideMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.85,
    roughness: 0.3,
    metalness: 0.5
  })

  const adjacentTopMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    bumpMap,
    bumpScale: 0.28,
    color: 0x7094b8,
    roughness: 0.68,
    metalness: 0.18,
    emissive: 0x071a30,
    emissiveIntensity: 0.25
  })

  const adjacentSideMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    emissive: 0x075985,
    emissiveIntensity: 0.55,
    roughness: 0.4,
    metalness: 0.4
  })

  // 3. 构建 3D 浮雕板块（贵州 9 地州 + 怀化 12 区县 + 湘西/秀山承接区）
  const allRegions: GeoRegionData[] = [
    ...GUIZHOU_CITY_REGIONS,
    ...HUAIHUA_DISTRICT_REGIONS,
    ...CROSS_BORDER_ADJACENT_REGIONS
  ]

  for (const region of allRegions) {
    const isGuizhou = region.province === 'guizhou'
    const extrudeDepth = isGuizhou ? GUIZHOU_EXTRUDE_HEIGHT : ADJACENT_EXTRUDE_HEIGHT

    for (const poly of region.polygons) {
      const outerRing = poly[0]
      if (!outerRing || outerRing.length < 4) continue

      const shape = new THREE.Shape()
      const worldPts: [number, number][] = []

      outerRing.forEach(([lng, lat], idx) => {
        const [x, z] = lngLatToWorldXZ(lng, lat)
        worldPts.push([x, z])
        if (idx === 0) shape.moveTo(x, -z)
        else shape.lineTo(x, -z)
      })
      shape.closePath()

      // 添加内孔（洞）
      for (let h = 1; h < poly.length; h++) {
        const holeRing = poly[h]
        if (!holeRing || holeRing.length < 4) continue
        const holePath = new THREE.Path()
        holeRing.forEach(([lng, lat], idx) => {
          const [x, z] = lngLatToWorldXZ(lng, lat)
          if (idx === 0) holePath.moveTo(x, -z)
          else holePath.lineTo(x, -z)
        })
        holePath.closePath()
        shape.holes.push(holePath)
      }

      // 挤压生成立体板块
      const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
        depth: extrudeDepth,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.06,
        bevelSegments: 1
      })
      extrudeGeo.rotateX(-Math.PI / 2)

      const regionMesh = new THREE.Mesh(
        extrudeGeo,
        isGuizhou ? [guizhouTopMat, guizhouSideMat] : [adjacentTopMat, adjacentSideMat]
      )
      regionMesh.receiveShadow = true
      regionMesh.castShadow = true
      rootGroup.add(regionMesh)

      // 顶面边界高亮线
      const topBorderPts = worldPts.map(([x, z]) => new THREE.Vector3(x, extrudeDepth + 0.12, z))
      topBorderPts.push(topBorderPts[0].clone())
      const topLineGeo = new THREE.BufferGeometry().setFromPoints(topBorderPts)
      const topLineMat = new THREE.LineBasicMaterial({
        color: isGuizhou ? 0xd8f3ff : 0x38bdf8,
        transparent: true,
        opacity: isGuizhou ? 0.88 : 0.55
      })
      rootGroup.add(new THREE.Line(topLineGeo, topLineMat))

      // 底部霓虹发光边线
      const bottomBorderPts = worldPts.map(([x, z]) => new THREE.Vector3(x, 0.08, z))
      bottomBorderPts.push(bottomBorderPts[0].clone())
      const bottomLineGeo = new THREE.BufferGeometry().setFromPoints(bottomBorderPts)
      const bottomLineMat = new THREE.LineBasicMaterial({
        color: isGuizhou ? 0x00e5ff : 0x0284c7,
        transparent: true,
        opacity: isGuizhou ? 0.92 : 0.55
      })
      rootGroup.add(new THREE.Line(bottomLineGeo, bottomLineMat))

      // 仅对主多边形（点数 > 50）生成升腾科技光幕
      if (isGuizhou && worldPts.length > 50) {
        const curtain = createBoundaryLightCurtain(worldPts, extrudeDepth, 3.8, curtainTex)
        rootGroup.add(curtain)
      }
    }

    // 第一层（CSS3DObject）：平铺贴合在 3D 地形表面的地州市名称
    if (region.centerLngLat && region.centerLngLat[0]) {
      const [cx, cz] = lngLatToWorldXZ(region.centerLngLat[0], region.centerLngLat[1])
      if (isGuizhou) {
        const displayName = region.name.replace(/(布依族苗族|苗族侗族)自治州$/, '州')
        const { obj, innerEl } = createRegionSurfaceCss3DLabel(
          displayName,
          new THREE.Vector3(cx, extrudeDepth + 0.22, cz)
        )
        rootGroup.add(obj)
        regionLabelInners.push(innerEl)
        allCssObjects.push(obj)
      }
    }
  }

  // 4. 贵州 88 区县内部网格细线（呈现参考图中高密度地理网格纹理）
  const countyLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28
  })
  for (const ring of GUIZHOU_INNER_COUNTY_LINES) {
    const pts = ring.map(([lng, lat]) => {
      const [x, z] = lngLatToWorldXZ(lng, lat)
      return new THREE.Vector3(x, GUIZHOU_EXTRUDE_HEIGHT + 0.06, z)
    })
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    rootGroup.add(new THREE.Line(geo, countyLineMat))
  }

  // 5. 构建核心源点：【黄平重安镇（中心厂区）】
  const hqSurfaceY = GUIZHOU_EXTRUDE_HEIGHT + 0.15
  const hqPos = lngLatToVector3(HQ_ORIGIN_NODE.lngLat[0], HQ_ORIGIN_NODE.lngLat[1], hqSurfaceY)

  // 总厂高耸金色核心光柱
  const hqBeamGeo = new THREE.CylinderGeometry(0.18, 0.52, 8.5, 16)
  const hqBeamMat = new THREE.MeshBasicMaterial({
    color: 0xffe066,
    transparent: true,
    opacity: 0.92
  })
  const hqBeam = new THREE.Mesh(hqBeamGeo, hqBeamMat)
  hqBeam.position.set(hqPos.x, hqSurfaceY + 4.25, hqPos.z)
  rootGroup.add(hqBeam)
  beaconColumns.push(hqBeam)

  // 总厂外层柔光罩
  const hqHaloGeo = new THREE.CylinderGeometry(0.55, 1.15, 8.2, 16)
  const hqHaloMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const hqHalo = new THREE.Mesh(hqHaloGeo, hqHaloMat)
  hqHalo.position.set(hqPos.x, hqSurfaceY + 4.1, hqPos.z)
  rootGroup.add(hqHalo)

  // 总厂底部双层脉冲扩散波纹环
  for (let i = 0; i < 2; i++) {
    const ringGeo = new THREE.RingGeometry(0.5, 0.85, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0xffd166 : 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = -Math.PI / 2
    ringMesh.position.set(hqPos.x, hqSurfaceY + 0.08, hqPos.z)
    ringMesh.userData = { phase: i * 0.5, maxScale: 4.5, basePos: hqPos.clone() }
    rootGroup.add(ringMesh)
    pulseRings.push(ringMesh)
  }

  // 第二层（CSS2DObject）：总厂核心立牌（置顶 z-index:35）
  const hqLabel = createHqCss2DLabel(
    HQ_ORIGIN_NODE.shortName,
    new THREE.Vector3(hqPos.x, hqSurfaceY + 9.2, hqPos.z),
    onSelectHub
  )
  rootGroup.add(hqLabel)
  allCssObjects.push(hqLabel)

  // 发光流光球共享贴图材质
  const glowSpriteTex = createGlowTexture('#ffffff')

  // 6. 构建三大中心仓（凯里仓、怀化仓、贵阳仓）及两级飞线网络
  for (const hub of MAP_HUB_WAREHOUSES) {
    const hubGroup = hubGroups[hub.id]
    const isHubInAdjacent = hub.id === 'hub-huaihua'
    const hubBaseY = (isHubInAdjacent ? ADJACENT_EXTRUDE_HEIGHT : GUIZHOU_EXTRUDE_HEIGHT) + 0.15
    const hubPos = lngLatToVector3(hub.lngLat[0], hub.lngLat[1], hubBaseY)
    const isPlanned = hub.status === 'planned'

    // 6.1 中心仓立体发光棱柱与底座波纹
    const hubPylonGeo = new THREE.CylinderGeometry(0.14, 0.38, 5.2, 6)
    const hubPylonMat = new THREE.MeshBasicMaterial({
      color: hub.colorHex,
      transparent: true,
      opacity: 0.9
    })
    const hubPylon = new THREE.Mesh(hubPylonGeo, hubPylonMat)
    hubPylon.position.set(hubPos.x, hubBaseY + 2.6, hubPos.z)
    hubGroup.add(hubPylon)
    beaconColumns.push(hubPylon)

    const hubRingGeo = new THREE.RingGeometry(0.4, 0.68, 32)
    const hubRingMat = new THREE.MeshBasicMaterial({
      color: hub.colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    })
    const hubRing = new THREE.Mesh(hubRingGeo, hubRingMat)
    hubRing.rotation.x = -Math.PI / 2
    hubRing.position.set(hubPos.x, hubBaseY + 0.06, hubPos.z)
    hubRing.userData = { phase: 0.25, maxScale: 3.4 }
    hubGroup.add(hubRing)
    pulseRings.push(hubRing)

    // 第二层（CSS2DObject）：三大枢纽仓交互立牌（次高优先级 z-index:25，高于所有区县）
    const hubLabelCtrl = createHubCss2DLabel(
      hub,
      new THREE.Vector3(hubPos.x, hubBaseY + 5.8, hubPos.z),
      onSelectHub
    )
    rootGroup.add(hubLabelCtrl.obj)
    hubLabelControllers.push(hubLabelCtrl)
    allCssObjects.push(hubLabelCtrl.obj)

    // 6.2 第一级主干飞线：黄平重安镇（中心厂区） ➔ 当前枢纽仓
    const tier1Mid = new THREE.Vector3()
      .addVectors(hqPos, hubPos)
      .multiplyScalar(0.5)
    const tier1Dist = hqPos.distanceTo(hubPos)
    tier1Mid.y = Math.max(hqSurfaceY, hubBaseY) + Math.max(7.5, tier1Dist * 0.42)

    const tier1Curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(hqPos.x, hqSurfaceY + 0.4, hqPos.z),
      tier1Mid,
      new THREE.Vector3(hubPos.x, hubBaseY + 0.35, hubPos.z)
    )

    if (isPlanned) {
      // 2027 规划意向仓：琥珀色高拱虚线主干飞线
      const pts = tier1Curve.getPoints(64)
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
      const lineMat = new THREE.LineDashedMaterial({
        color: hub.colorHex,
        dashSize: 0.85,
        gapSize: 0.45,
        transparent: true,
        opacity: 0.9
      })
      const dashedArc = new THREE.Line(lineGeo, lineMat)
      dashedArc.computeLineDistances()
      hubGroup.add(dashedArc)
    } else {
      // 已合作中心仓：高亮实心流光管主干飞线
      const tubeGeo = new THREE.TubeGeometry(tier1Curve, 48, 0.11, 8, false)
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85
      })
      hubGroup.add(new THREE.Mesh(tubeGeo, tubeMat))

      const outerTubeGeo = new THREE.TubeGeometry(tier1Curve, 48, 0.24, 8, false)
      const outerTubeMat = new THREE.MeshBasicMaterial({
        color: hub.colorHex,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
      hubGroup.add(new THREE.Mesh(outerTubeGeo, outerTubeMat))
    }

    // 第一级主干飞线上的双流光脉冲彗星
    for (let c = 0; c < 2; c++) {
      const cometGeo = new THREE.SphereGeometry(0.32, 12, 12)
      const cometMat = new THREE.MeshBasicMaterial({
        color: isPlanned ? 0xffe066 : 0xffffff
      })
      const cometMesh = new THREE.Mesh(cometGeo, cometMat)

      const spriteMat = new THREE.SpriteMaterial({
        map: glowSpriteTex,
        color: hub.colorHex,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(2.2, 2.2, 1)
      cometMesh.add(sprite)

      hubGroup.add(cometMesh)
      comets.push({
        mesh: cometMesh,
        curve: tier1Curve,
        progress: c * 0.5,
        speed: 0.45,
        hubId: hub.id,
        tier: 1
      })
    }

    // 6.3 第二级支线飞线：当前枢纽仓 ➔ 下辖所有供应/规划城市
    hub.cities.forEach((city, idx) => {
      const isCityAdjacent = city.province !== '贵州'
      const cityBaseY =
        (isCityAdjacent ? ADJACENT_EXTRUDE_HEIGHT : GUIZHOU_EXTRUDE_HEIGHT) + 0.15
      const cityPos = lngLatToVector3(city.lngLat[0], city.lngLat[1], cityBaseY)
      const dist = hubPos.distanceTo(cityPos)

      // 邻近与同名节点去重：若区县与枢纽仓坐标完全重叠（如凯里仓与凯里市），跳过冗余区县标签与 0 长飞线
      if (dist < 0.2) {
        return
      }

      // 城市末端光柱与底座圆点
      const cityPinGeo = new THREE.CylinderGeometry(0.06, 0.14, 1.8, 8)
      const cityPinMat = new THREE.MeshBasicMaterial({
        color: hub.colorHex,
        transparent: true,
        opacity: 0.82
      })
      const cityPin = new THREE.Mesh(cityPinGeo, cityPinMat)
      cityPin.position.set(cityPos.x, cityBaseY + 0.9, cityPos.z)
      hubGroup.add(cityPin)

      const dotGeo = new THREE.CircleGeometry(0.28, 16)
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      })
      const dotMesh = new THREE.Mesh(dotGeo, dotMat)
      dotMesh.rotation.x = -Math.PI / 2
      dotMesh.position.set(cityPos.x, cityBaseY + 0.04, cityPos.z)
      hubGroup.add(dotMesh)

      // 二级贝塞尔飞线弧（从中心仓飞向目标区县）
      const mid = new THREE.Vector3().addVectors(hubPos, cityPos).multiplyScalar(0.5)
      mid.y = Math.max(hubBaseY, cityBaseY) + Math.max(3.2, dist * 0.36)

      const tier2Curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(hubPos.x, hubBaseY + 0.25, hubPos.z),
        mid,
        new THREE.Vector3(cityPos.x, cityBaseY + 0.15, cityPos.z)
      )

      const curvePts = tier2Curve.getPoints(44)
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePts)

      if (isPlanned) {
        const dashedMat = new THREE.LineDashedMaterial({
          color: hub.colorHex,
          dashSize: 0.55,
          gapSize: 0.35,
          transparent: true,
          opacity: 0.72
        })
        const arcLine = new THREE.Line(arcGeo, dashedMat)
        arcLine.computeLineDistances()
        hubGroup.add(arcLine)
      } else {
        const solidMat = new THREE.LineBasicMaterial({
          color: hub.colorHex,
          transparent: true,
          opacity: 0.62
        })
        hubGroup.add(new THREE.Line(arcGeo, solidMat))
      }

      // 每条支线配置一颗流光脉冲粒子（还原参考图密集向上喷涌飞散的亮白流光弧）
      const cityCometGeo = new THREE.SphereGeometry(0.16, 8, 8)
      const cityCometMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const cityComet = new THREE.Mesh(cityCometGeo, cityCometMat)

      const glowSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowSpriteTex,
          color: hub.colorHex,
          transparent: true,
          opacity: 0.88,
          blending: THREE.AdditiveBlending
        })
      )
      glowSprite.scale.set(1.25, 1.25, 1)
      cityComet.add(glowSprite)

      hubGroup.add(cityComet)
      comets.push({
        mesh: cityComet,
        curve: tier2Curve,
        progress: (idx * 0.17) % 1,
        speed: 0.32 + (idx % 5) * 0.04,
        hubId: hub.id,
        tier: 2
      })

      // 第三层（CSS2DObject）：区县级清晰正对屏幕标签（基础层级 z-index:10，贴合柱顶）
      const cityLabelCtrl = createCityCss2DLabel(
        city,
        new THREE.Vector3(cityPos.x, cityBaseY + 1.85, cityPos.z)
      )
      hubGroup.add(cityLabelCtrl.obj)
      cityLabelControllers.push(cityLabelCtrl)
      allCssObjects.push(cityLabelCtrl.obj)
    })
  }

  const updateLabelStyles = (selectedHubId: HubId | 'all') => {
    const regionOpacity = selectedHubId === 'all' ? '0.88' : '0.38'
    for (const innerEl of regionLabelInners) {
      innerEl.style.opacity = regionOpacity
    }
    for (const ctrl of hubLabelControllers) {
      ctrl.updateActive(selectedHubId)
    }
    for (const ctrl of cityLabelControllers) {
      ctrl.updateState(selectedHubId)
    }
  }

  const setLabelsVisible = (visible: boolean) => {
    for (const obj of allCssObjects) {
      obj.visible = visible
      const el = (obj as any).element as HTMLElement | undefined
      if (el) {
        el.style.display = visible ? 'block' : 'none'
      }
    }
  }

  return {
    animatedRefs: {
      rootGroup,
      comets,
      pulseRings,
      techRings,
      beaconColumns,
      hubGroups,
      updateLabelStyles,
      setLabelsVisible
    }
  }
}
