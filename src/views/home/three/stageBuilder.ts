import * as THREE from 'three'
import {
  createGlowTexture,
  createCorrugatedRoofTexture,
  createLightPoolTexture,
  createWarmWindowTexture
} from './stageTextures'

export interface FlowPulseItem {
  mesh: THREE.Mesh
  curve: THREE.CatmullRomCurve3
  progress: number
  speed: number
}

export interface StageAnimatedRefs {
  pulseRings: THREE.Mesh[]
  bubbleParticles: THREE.Points | null
  blowerFans: THREE.Object3D[]
  flowPulses: FlowPulseItem[]
  highlightGroup: THREE.Group
  highlightRingOuter: THREE.Mesh
  highlightBeam: THREE.Mesh
}

/**
 * 构建方形钢筋混凝土对虾养殖池矩阵（用于后方大棚内部池群与左前主养虾池群）
 */
function createConcreteTankMatrix(options: {
  rows: number
  cols: number
  cellW: number
  cellD: number
  wallH: number
  wallT: number
  hasWater: boolean
  waterOpacity?: number
  waterEmissive?: number
  waterEmissiveIntensity?: number
}): THREE.Group {
  const {
    rows,
    cols,
    cellW,
    cellD,
    wallH,
    wallT,
    hasWater,
    waterOpacity = 0.52,
    waterEmissive = 0x023e68,
    waterEmissiveIntensity = 0.24
  } = options
  const group = new THREE.Group()
  const totalW = cols * cellW
  const totalD = rows * cellD

  // 混凝土池底板
  const floorGeo = new THREE.BoxGeometry(totalW + wallT, 0.25, totalD + wallT)
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x7c8b9c,
    roughness: 0.78,
    metalness: 0.14
  })
  const floorWallMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.68,
    metalness: 0.16
  })
  const floorMesh = new THREE.Mesh(floorGeo, concreteMat)
  floorMesh.position.y = 0.125
  floorMesh.receiveShadow = true
  group.add(floorMesh)

  // 横向池壁 (rows + 1 条)
  const hWallGeo = new THREE.BoxGeometry(totalW + wallT, wallH, wallT)
  for (let r = 0; r <= rows; r++) {
    const wall = new THREE.Mesh(hWallGeo, floorWallMat)
    wall.position.set(0, wallH / 2 + 0.2, -totalD / 2 + r * cellD)
    wall.castShadow = true
    wall.receiveShadow = true
    group.add(wall)
  }

  // 纵向池壁 (cols + 1 条)
  const vWallGeo = new THREE.BoxGeometry(wallT, wallH, totalD + wallT)
  for (let c = 0; c <= cols; c++) {
    const wall = new THREE.Mesh(vWallGeo, floorWallMat)
    wall.position.set(-totalW / 2 + c * cellW, wallH / 2 + 0.2, 0)
    wall.castShadow = true
    wall.receiveShadow = true
    group.add(wall)
  }

  // 每个方池内部细节：中心底排污口、水体
  const drainGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12)
  const drainMat = new THREE.MeshBasicMaterial({ color: 0x0f172a })
  const waterGeo = new THREE.PlaneGeometry(cellW - wallT * 1.1, cellD - wallT * 1.1)
  waterGeo.rotateX(-Math.PI / 2)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: waterEmissive,
    emissiveIntensity: waterEmissiveIntensity,
    roughness: 0.18,
    metalness: 0.55,
    transparent: true,
    opacity: waterOpacity
  })

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = -totalW / 2 + (c + 0.5) * cellW
      const cz = -totalD / 2 + (r + 0.5) * cellD

      const drain = new THREE.Mesh(drainGeo, drainMat)
      drain.position.set(cx, 0.27, cz)
      group.add(drain)

      if (hasWater) {
        const water = new THREE.Mesh(waterGeo, waterMat)
        water.position.set(cx, wallH * 0.68, cz)
        group.add(water)
      }
    }
  }

  return group
}

/**
 * 创建精致纤细的微发光灯线（仅用于局部边缘点缀，不产生刺眼大光斑）
 */
function createAccentLine(
  width: number,
  height: number,
  depth: number,
  colorHex: number,
  intensity = 1.25
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, height, depth)
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: 0.1
  })
  return new THREE.Mesh(geo, mat)
}

/**
 * 构建整座“重安对虾养殖示范基地”实景 3D 孪生场景
 * 严格对齐手绘规划图5大分区：
 * 1. 后方大片主区：【养虾池】（保留钢结构保温大棚屋顶）
 * 2. 左前核心片区：【养虾池】（统一规整的4×9带水钢筋混凝土方池矩阵）
 * 3. 左前外侧凸出区：【设备房】（含原料仓库、增温设备、增氧设备、饲料仓库）
 * 4. 右前片区后部：【管理用房】（含监控中心、实验中心、生活中心）
 * 5. 右前片区前部：【休闲平台】（景观廊架、休闲座椅、绿化花箱与庭院灯）
 */
export function buildChonganShrimpBase(sceneInstance: THREE.Scene): StageAnimatedRefs {
  const warmLightPoolTex = createLightPoolTexture(
    'rgba(255, 232, 185, 0.55)',
    'rgba(255, 185, 95, 0.15)'
  )

  // 1. 山谷暗夜大地基底与低调科技网格
  const groundGeo = new THREE.PlaneGeometry(280, 280)
  groundGeo.rotateX(-Math.PI / 2)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a2138,
    roughness: 0.88,
    metalness: 0.12
  })
  const groundMesh = new THREE.Mesh(groundGeo, groundMat)
  groundMesh.position.y = -0.22
  groundMesh.receiveShadow = true
  sceneInstance.add(groundMesh)

  const gridHelper = new THREE.GridHelper(220, 55, 0x0088cc, 0x072b4d)
  gridHelper.position.y = -0.14
  const gridMat = gridHelper.material as THREE.Material
  gridMat.transparent = true
  gridMat.opacity = 0.22
  sceneInstance.add(gridHelper)

  // 2. 基地硬化混凝土总台基 + 左前【设备房】外凸扩建耳台（还原手绘图外框轮廓）
  const compoundPadMat = new THREE.MeshStandardMaterial({
    color: 0x243242,
    roughness: 0.78,
    metalness: 0.15
  })
  const compoundPadGeo = new THREE.BoxGeometry(66, 0.55, 64)
  const compoundPad = new THREE.Mesh(compoundPadGeo, compoundPadMat)
  compoundPad.position.set(0, 0.05, 0)
  compoundPad.receiveShadow = true
  sceneInstance.add(compoundPad)

  const padEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(compoundPadGeo),
    new THREE.LineBasicMaterial({ color: 0x00a8ff, transparent: true, opacity: 0.42 })
  )
  padEdge.position.copy(compoundPad.position)
  sceneInstance.add(padEdge)

  // 左前外侧凸出耳台（x: -44.5 ~ -31, z: +5.5 ~ +32，承载新增【设备房】）
  const leftWingPadGeo = new THREE.BoxGeometry(13.5, 0.55, 26.5)
  const leftWingPad = new THREE.Mesh(leftWingPadGeo, compoundPadMat)
  leftWingPad.position.set(-37.75, 0.05, 18.75)
  leftWingPad.receiveShadow = true
  sceneInstance.add(leftWingPad)

  const leftWingEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(leftWingPadGeo),
    new THREE.LineBasicMaterial({ color: 0x00a8ff, transparent: true, opacity: 0.45 })
  )
  leftWingEdge.position.copy(leftWingPad.position)
  sceneInstance.add(leftWingEdge)

  // 台基正前缘深海蓝迎宾导光细条（贯通左前耳台与主台基）
  const frontRim = createAccentLine(77.5, 0.08, 0.08, 0x00c6ff, 1.35)
  frontRim.position.set(-5.75, 0.32, 32.02)
  sceneInstance.add(frontRim)

  // 3. 后方大片主区：【养虾池】（保留钢结构保温大棚屋顶，z: -30 ~ +6, x: -30 ~ +30）
  const greenhouseGroup = new THREE.Group()
  greenhouseGroup.position.set(0, 0.3, -12)

  // 3.1 大棚内部对虾养殖方池矩阵 (6排 × 12列 室内循环水虾池)
  const indoorPools = createConcreteTankMatrix({
    rows: 6,
    cols: 12,
    cellW: 4.8,
    cellD: 5.4,
    wallH: 1.65,
    wallT: 0.22,
    hasWater: true,
    waterOpacity: 0.54,
    waterEmissive: 0x023e68,
    waterEmissiveIntensity: 0.24
  })
  greenhouseGroup.add(indoorPools)

  // 3.2 钢结构立柱与轻钢桁架屋面系统
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.6,
    roughness: 0.35
  })
  const darkRoofTex = createCorrugatedRoofTexture('#223042', '#15202e')
  const silverRoofTex = createCorrugatedRoofTexture('#b8c4d0', '#8494a6')

  const darkRoofMat = new THREE.MeshStandardMaterial({
    map: darkRoofTex,
    color: 0x334155,
    roughness: 0.48,
    metalness: 0.5,
    side: THREE.DoubleSide
  })
  const silverRoofMat = new THREE.MeshStandardMaterial({
    map: silverRoofTex,
    color: 0xcbd5e1,
    roughness: 0.4,
    metalness: 0.6,
    side: THREE.DoubleSide
  })

  const bayCols = 9
  const bayRows = 7
  const bayW = 6.4
  const bayD = 4.8
  const ghWidth = bayCols * bayW // 57.6
  const ghDepth = bayRows * bayD // 33.6
  const eaveH = 3.8

  // 钢结构立柱与纵向主梁
  const pillarGeo = new THREE.BoxGeometry(0.22, eaveH, 0.22)
  const longBeamGeo = new THREE.BoxGeometry(0.16, 0.24, ghDepth)
  for (let c = 0; c <= bayCols; c++) {
    const px = -ghWidth / 2 + c * bayW
    const beam = new THREE.Mesh(longBeamGeo, steelMat)
    beam.position.set(px, eaveH, 0)
    greenhouseGroup.add(beam)

    for (let r = 0; r <= bayRows; r++) {
      const pz = -ghDepth / 2 + r * bayD
      const pillar = new THREE.Mesh(pillarGeo, steelMat)
      pillar.position.set(px, eaveH / 2, pz)
      pillar.castShadow = true
      greenhouseGroup.add(pillar)
    }
  }

  // 横向钢桁架与檩条
  const crossBeamGeo = new THREE.BoxGeometry(ghWidth, 0.22, 0.18)
  for (let r = 0; r <= bayRows; r++) {
    const pz = -ghDepth / 2 + r * bayD
    const crossBeam = new THREE.Mesh(crossBeamGeo, steelMat)
    crossBeam.position.set(0, eaveH, pz)
    greenhouseGroup.add(crossBeam)
  }

  // 连排波浪拱形屋顶单元
  for (let r = 0; r < bayRows; r++) {
    const cz = -ghDepth / 2 + (r + 0.5) * bayD
    for (let c = 0; c < bayCols; c++) {
      const cx = -ghWidth / 2 + (c + 0.5) * bayW

      for (let s = -1; s <= 1; s++) {
        const purlin = new THREE.Mesh(new THREE.BoxGeometry(bayW * 0.96, 0.1, 0.1), steelMat)
        purlin.position.set(cx, eaveH + 0.35 - Math.abs(s) * 0.15, cz + s * (bayD * 0.3))
        greenhouseGroup.add(purlin)
      }
      for (let k = -2; k <= 2; k++) {
        const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, bayD * 0.96), steelMat)
        rafter.position.set(cx + k * (bayW * 0.2), eaveH + 0.38 - Math.abs(k) * 0.08, cz)
        greenhouseGroup.add(rafter)
      }

      const isFrontExposed = r === bayRows - 1 && c !== 2 && c !== bayCols - 1
      const isBackRightExposed = c === bayCols - 1 && r < 2

      if (!isFrontExposed && !isBackRightExposed) {
        const archGeo = new THREE.CylinderGeometry(
          bayW * 0.56,
          bayW * 0.56,
          bayD * 0.98,
          16,
          1,
          true,
          -Math.PI * 0.32,
          Math.PI * 0.64
        )
        archGeo.rotateX(Math.PI / 2)
        const useSilver = c === bayCols - 1 || (c === bayCols - 2 && r >= 2 && r <= 4)
        const archMesh = new THREE.Mesh(archGeo, useSilver ? silverRoofMat : darkRoofMat)
        archMesh.position.set(cx, eaveH - bayW * 0.24, cz)
        archMesh.scale.set(1, 0.52, 1)
        archMesh.castShadow = true
        archMesh.receiveShadow = true
        greenhouseGroup.add(archMesh)

        if (r % 2 === 0 && c % 2 === 0) {
          const wire = new THREE.LineSegments(
            new THREE.EdgesGeometry(archGeo),
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.16 })
          )
          wire.position.copy(archMesh.position)
          wire.scale.copy(archMesh.scale)
          greenhouseGroup.add(wire)
        }
      }
    }
  }

  // 大棚正前檐纤细冰青色收边灯线点缀
  const ghFrontAccent = createAccentLine(ghWidth + 0.2, 0.08, 0.08, 0x00e5ff, 1.35)
  ghFrontAccent.position.set(0, eaveH + 0.14, ghDepth / 2 + 0.04)
  greenhouseGroup.add(ghFrontAccent)

  const sideWallGeo = new THREE.BoxGeometry(0.35, eaveH * 0.85, ghDepth)
  const leftWall = new THREE.Mesh(sideWallGeo, steelMat)
  leftWall.position.set(-ghWidth / 2 - 0.2, eaveH * 0.42, 0)
  greenhouseGroup.add(leftWall)

  sceneInstance.add(greenhouseGroup)

  // 4. 左前核心片区：【养虾池】（原循环水处理中心+前区水泥方池群合并为统一的 4排×9列 带水养虾池矩阵）
  const frontTanksGroup = new THREE.Group()
  frontTanksGroup.position.set(-13, 0.3, 18.2)

  const unifiedFrontPools = createConcreteTankMatrix({
    rows: 4,
    cols: 9,
    cellW: 3.45,
    cellD: 5.5,
    wallH: 1.85,
    wallT: 0.26,
    hasWater: true,
    waterOpacity: 0.58,
    waterEmissive: 0x035388,
    waterEmissiveIntensity: 0.28
  })
  frontTanksGroup.add(unifiedFrontPools)

  // 中央十字巡检走道微光导引线
  const poolWalkwayLine = createAccentLine(31.2, 0.06, 0.08, 0x00d8ff, 1.2)
  poolWalkwayLine.position.set(0, 2.08, 0)
  frontTanksGroup.add(poolWalkwayLine)

  sceneInstance.add(frontTanksGroup)

  // 5. 左前外侧新增建筑物：【设备房】（位于左前养虾池左侧 x = -37.5, z = 18.2，含原料仓库/增温设备/增氧设备/饲料仓库）
  const equipmentRoomGroup = new THREE.Group()
  equipmentRoomGroup.position.set(-37.5, 0.3, 18.2)

  const eqW = 10.2
  const eqD = 22.0
  const eqH = 5.0
  const eqWallMat = new THREE.MeshStandardMaterial({
    color: 0x8fa0b3,
    roughness: 0.55,
    metalness: 0.28
  })
  const eqDarkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.48,
    metalness: 0.45
  })
  const eqCyanWindowMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x00b4d8,
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.2
  })

  // 设备房主体封闭厂房箱体
  const eqBody = new THREE.Mesh(new THREE.BoxGeometry(eqW, eqH, eqD), eqWallMat)
  eqBody.position.y = eqH / 2
  eqBody.castShadow = true
  eqBody.receiveShadow = true
  equipmentRoomGroup.add(eqBody)

  // 底部深灰防潮基座与顶部挑檐压顶
  const eqBase = new THREE.Mesh(
    new THREE.BoxGeometry(eqW + 0.3, 0.38, eqD + 0.3),
    eqDarkTrimMat
  )
  eqBase.position.y = 0.19
  equipmentRoomGroup.add(eqBase)

  const eqRoof = new THREE.Mesh(
    new THREE.BoxGeometry(eqW + 0.6, 0.36, eqD + 0.6),
    eqDarkTrimMat
  )
  eqRoof.position.y = eqH + 0.18
  eqRoof.castShadow = true
  equipmentRoomGroup.add(eqRoof)

  // 设备房顶部冰青色科技轮廓细线
  const eqRoofEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(eqW + 0.65, 0.38, eqD + 0.65)),
    new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.55 })
  )
  eqRoofEdge.position.y = eqH + 0.19
  equipmentRoomGroup.add(eqRoofEdge)

  const eqFrontAccent = createAccentLine(0.08, 0.08, eqD + 0.4, 0x00e5ff, 1.3)
  eqFrontAccent.position.set(eqW / 2 + 0.32, eqH + 0.22, 0)
  equipmentRoomGroup.add(eqFrontAccent)

  // 沿纵向划分为 4 个功能仓位（对应：原料仓库、增温设备间、增氧设备间、饲料仓库）
  for (let bay = 0; bay < 4; bay++) {
    const bz = -8.1 + bay * 5.4

    // 仓位分隔钢壁柱
    if (bay > 0) {
      const divider = new THREE.Mesh(new THREE.BoxGeometry(eqW + 0.25, eqH, 0.28), eqDarkTrimMat)
      divider.position.set(0, eqH / 2, bz - 2.7)
      equipmentRoomGroup.add(divider)
    }

    // 东侧立面（朝向养虾池一侧）：工业卷帘门/设备百叶窗 + 上方透光观察窗
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.8, 3.2),
      eqDarkTrimMat
    )
    doorMesh.position.set(eqW / 2 + 0.05, 1.5, bz)
    equipmentRoomGroup.add(doorMesh)

    const upperWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.85, 3.2),
      eqCyanWindowMat
    )
    upperWin.position.set(eqW / 2 + 0.06, 3.85, bz)
    equipmentRoomGroup.add(upperWin)

    // 西侧外立面同步布置采光百叶窗
    const westWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.1, 3.0),
      eqCyanWindowMat
    )
    westWin.position.set(-eqW / 2 - 0.06, 3.5, bz)
    equipmentRoomGroup.add(westWin)
  }

  // 南侧正脸（朝向镜头前方 z = +eqD/2）物流大门与门头灯线
  const southGate = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 0.22), eqDarkTrimMat)
  southGate.position.set(0, 1.7, eqD / 2 + 0.05)
  const southCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.24, 1.4), eqWallMat)
  southCanopy.position.set(0, 3.55, eqD / 2 + 0.65)
  const southAccent = createAccentLine(5.4, 0.07, 0.07, 0x00e5ff, 1.35)
  southAccent.position.set(0, 3.45, eqD / 2 + 1.32)
  equipmentRoomGroup.add(southGate, southCanopy, southAccent)

  // 设备房屋顶：增温空气源热泵机组 + 高压罗茨增氧鼓风机组（带动态旋转叶轮光环）
  const blowerFans: THREE.Object3D[] = []
  for (let u = 0; u < 4; u++) {
    const uz = -7.5 + u * 5.0
    const unitBox = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.35, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x003554,
        emissiveIntensity: 0.35,
        metalness: 0.65,
        roughness: 0.3
      })
    )
    unitBox.position.set(0, eqH + 0.36 + 0.68, uz)
    unitBox.castShadow = true
    equipmentRoomGroup.add(unitBox)

    const fanRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.07, 8, 20),
      new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 1.4
      })
    )
    fanRing.rotation.y = Math.PI / 2
    fanRing.position.set(1.45, eqH + 0.36 + 0.68, uz)
    equipmentRoomGroup.add(fanRing)
    blowerFans.push(fanRing)
  }

  sceneInstance.add(equipmentRoomGroup)

  // 6. 右前片区后部：【管理用房】（监控中心、实验中心、生活中心，x = 17, z = 11.5）
  const officeBuildingGroup = new THREE.Group()
  officeBuildingGroup.position.set(17, 0.3, 11.5)

  const bldgW = 24
  const bldgD = 9.2
  const floor1H = 3.4
  const floor2H = 3.4
  const totalH = floor1H + floor2H

  const concreteBldgMat = new THREE.MeshStandardMaterial({
    color: 0xa8b8c8,
    roughness: 0.58,
    metalness: 0.18
  })
  const trimBldgMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.5,
    metalness: 0.35
  })

  const warmWinTex = createWarmWindowTexture()
  const warmWindowMat = new THREE.MeshStandardMaterial({
    map: warmWinTex,
    color: 0xffd180,
    emissive: 0xff9e2c,
    emissiveMap: warmWinTex,
    emissiveIntensity: 1.25,
    roughness: 0.22,
    metalness: 0.1
  })

  // 完整封闭的一、二层管理用房实心箱体
  const mainBody = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW - 0.3, totalH, bldgD - 0.3),
    concreteBldgMat
  )
  mainBody.position.set(0, totalH / 2, 0)
  mainBody.castShadow = true
  mainBody.receiveShadow = true
  officeBuildingGroup.add(mainBody)

  const basePlinth = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW + 0.2, 0.36, bldgD + 0.2),
    trimBldgMat
  )
  basePlinth.position.y = 0.18
  officeBuildingGroup.add(basePlinth)

  const midSlab = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW + 0.35, 0.32, bldgD + 0.35),
    trimBldgMat
  )
  midSlab.position.y = floor1H
  midSlab.castShadow = true
  officeBuildingGroup.add(midSlab)

  const roofSlab = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW + 0.7, 0.42, bldgD + 0.7),
    concreteBldgMat
  )
  roofSlab.position.y = totalH
  roofSlab.castShadow = true
  officeBuildingGroup.add(roofSlab)

  const parapetEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(bldgW + 0.7, 0.46, bldgD + 0.7)),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
  )
  parapetEdge.position.y = totalH + 0.22
  officeBuildingGroup.add(parapetEdge)

  const colGeo = new THREE.BoxGeometry(0.46, totalH, 0.42)
  for (let i = -3; i <= 3; i++) {
    const frontCol = new THREE.Mesh(colGeo, concreteBldgMat)
    frontCol.position.set(i * 3.8, totalH / 2, bldgD / 2 - 0.1)
    frontCol.castShadow = true
    officeBuildingGroup.add(frontCol)
  }

  const winFrameGeo = new THREE.BoxGeometry(2.35, 1.62, 0.22)
  const winGlassGeo = new THREE.BoxGeometry(2.15, 1.42, 0.26)
  for (let bay = 0; bay < 6; bay++) {
    const wx = (-2.5 + bay) * 3.8
    const wy2 = floor1H + floor2H / 2 + 0.08

    const frame2 = new THREE.Mesh(winFrameGeo, trimBldgMat)
    frame2.position.set(wx, wy2, bldgD / 2 - 0.12)
    const glass2 = new THREE.Mesh(winGlassGeo, warmWindowMat)
    glass2.position.set(wx, wy2, bldgD / 2 - 0.1)
    officeBuildingGroup.add(frame2, glass2)

    if (bay !== 1 && bay !== 2) {
      const wy1 = floor1H / 2 + 0.12
      const frame1 = new THREE.Mesh(winFrameGeo, trimBldgMat)
      frame1.position.set(wx, wy1, bldgD / 2 - 0.12)
      const glass1 = new THREE.Mesh(winGlassGeo, warmWindowMat)
      glass1.position.set(wx, wy1, bldgD / 2 - 0.1)
      officeBuildingGroup.add(frame1, glass1)
    }
  }

  // 一层双开暖光玻璃门厅主入口
  const entranceFrame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.65, 0.26), trimBldgMat)
  entranceFrame.position.set(-3.8, 1.48, bldgD / 2 - 0.1)
  const entranceGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.45, 0.3), warmWindowMat)
  entranceGlass.position.set(-3.8, 1.48, bldgD / 2 - 0.08)
  officeBuildingGroup.add(entranceFrame, entranceGlass)

  // 左右两侧山墙采光暖窗
  const sideFrameGeo = new THREE.BoxGeometry(0.24, 1.55, 2.1)
  const sideGlassGeo = new THREE.BoxGeometry(0.28, 1.35, 1.9)
  for (const sideSign of [-1, 1]) {
    const sx = sideSign * (bldgW / 2 - 0.1)
    for (const sz of [-2.1, 2.1]) {
      for (const sy of [floor1H / 2 + 0.12, floor1H + floor2H / 2 + 0.08]) {
        const sFrame = new THREE.Mesh(sideFrameGeo, trimBldgMat)
        sFrame.position.set(sx, sy, sz)
        const sGlass = new THREE.Mesh(sideGlassGeo, warmWindowMat)
        sGlass.position.set(sx, sy, sz)
        officeBuildingGroup.add(sFrame, sGlass)
      }
    }
  }

  // 一层前伸门廊雨棚与立柱
  const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.32, 2.6), concreteBldgMat)
  porchRoof.position.set(-3.8, floor1H + 0.05, bldgD / 2 + 1.2)
  porchRoof.castShadow = true
  officeBuildingGroup.add(porchRoof)

  const porchAccent = createAccentLine(9.4, 0.07, 0.07, 0xffcc66, 1.3)
  porchAccent.position.set(-3.8, floor1H - 0.08, bldgD / 2 + 2.48)
  officeBuildingGroup.add(porchAccent)

  const porchColGeo = new THREE.BoxGeometry(0.38, floor1H, 0.38)
  ;[-8.2, 0.6].forEach((px) => {
    const pCol = new THREE.Mesh(porchColGeo, concreteBldgMat)
    pCol.position.set(px, floor1H / 2, bldgD / 2 + 2.3)
    pCol.castShadow = true
    officeBuildingGroup.add(pCol)
  })

  sceneInstance.add(officeBuildingGroup)

  // 7. 右前片区前部：【休闲平台】（管理用房正前方 x = 17, z = 23.8，配置木石观景铺装、现代遮阳廊架、休憩桌椅与景观绿植箱）
  const leisurePlatformGroup = new THREE.Group()
  leisurePlatformGroup.position.set(17, 0.3, 23.8)

  const deckW = 25.5
  const deckD = 11.8

  // 休闲平台石材基底与中部温润木塑观景甲板
  const deckBase = new THREE.Mesh(
    new THREE.BoxGeometry(deckW, 0.36, deckD),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.72, metalness: 0.15 })
  )
  deckBase.position.y = 0.18
  deckBase.receiveShadow = true
  leisurePlatformGroup.add(deckBase)

  const woodDeck = new THREE.Mesh(
    new THREE.BoxGeometry(deckW - 2.4, 0.1, deckD - 2.2),
    new THREE.MeshStandardMaterial({ color: 0x6b5344, roughness: 0.68, metalness: 0.12 })
  )
  woodDeck.position.y = 0.38
  woodDeck.receiveShadow = true
  leisurePlatformGroup.add(woodDeck)

  // 休闲平台边缘暖色氛围收边线
  const deckAccentFront = createAccentLine(deckW - 1.6, 0.06, 0.06, 0xffcc66, 1.2)
  deckAccentFront.position.set(0, 0.42, deckD / 2 - 0.2)
  leisurePlatformGroup.add(deckAccentFront)

  // 现代景观遮阳廊架（Pergola）
  const pergolaGroup = new THREE.Group()
  pergolaGroup.position.set(3.5, 0.4, 0.2)
  const pergolaMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.35 })
  const pColPositions = [
    [-4.2, -2.4],
    [4.2, -2.4],
    [-4.2, 2.4],
    [4.2, 2.4]
  ]
  pColPositions.forEach(([px, pz]) => {
    const pCol = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.8, 0.24), pergolaMat)
    pCol.position.set(px, 1.4, pz)
    pCol.castShadow = true
    pergolaGroup.add(pCol)
  })
  const pFrameFront = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.2, 0.24), pergolaMat)
  pFrameFront.position.set(0, 2.8, 2.4)
  const pFrameBack = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.2, 0.24), pergolaMat)
  pFrameBack.position.set(0, 2.8, -2.4)
  pergolaGroup.add(pFrameFront, pFrameBack)

  for (let slat = -3.8; slat <= 3.8; slat += 0.95) {
    const slatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 5.2), concreteBldgMat)
    slatMesh.position.set(slat, 2.92, 0)
    slatMesh.castShadow = true
    pergolaGroup.add(slatMesh)
  }
  const pergolaLightLine = createAccentLine(8.4, 0.06, 0.08, 0xffe099, 1.35)
  pergolaLightLine.position.set(0, 2.72, 0)
  pergolaGroup.add(pergolaLightLine)
  leisurePlatformGroup.add(pergolaGroup)

  // 户外休闲桌椅组合（2组）
  const tableMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.3 })
  for (const tx of [-5.8, 3.5]) {
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.1, 16), tableMat)
    tableTop.position.set(tx, 1.1, 0.2)
    tableTop.castShadow = true
    const tablePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.28, 0.7, 12), pergolaMat)
    tablePedestal.position.set(tx, 0.72, 0.2)
    leisurePlatformGroup.add(tableTop, tablePedestal)

    for (let a = 0; a < 4; a++) {
      const angle = (a * Math.PI) / 2 + Math.PI / 4
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.48, 12), concreteBldgMat)
      seat.position.set(tx + Math.cos(angle) * 1.65, 0.64, 0.2 + Math.sin(angle) * 1.65)
      seat.castShadow = true
      leisurePlatformGroup.add(seat)
    }
  }

  // 休闲平台四周景观绿植花箱
  const shrubMat = new THREE.MeshStandardMaterial({
    color: 0x228b54,
    emissive: 0x0d472a,
    emissiveIntensity: 0.35,
    roughness: 0.8,
    flatShading: true
  })
  for (const bx of [-10.5, 10.5]) {
    const planterBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 7.2), trimBldgMat)
    planterBox.position.set(bx, 0.68, 0.4)
    leisurePlatformGroup.add(planterBox)

    for (let sz = -2.4; sz <= 2.4; sz += 1.6) {
      const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 1), shrubMat)
      shrub.position.set(bx, 1.25, 0.4 + sz)
      leisurePlatformGroup.add(shrub)
    }
  }

  // 门廊与休闲平台柔和地面暖光漫反射
  const porchFloorGlowGeo = new THREE.PlaneGeometry(12, 7.5)
  porchFloorGlowGeo.rotateX(-Math.PI / 2)
  const porchFloorGlow = new THREE.Mesh(
    porchFloorGlowGeo,
    new THREE.MeshBasicMaterial({
      map: warmLightPoolTex,
      transparent: true,
      opacity: 0.32,
      depthWrite: false
    })
  )
  porchFloorGlow.position.set(0, 0.45, -1.2)
  leisurePlatformGroup.add(porchFloorGlow)

  sceneInstance.add(leisurePlatformGroup)

  // 8. 基地前缘铁艺围栏 (贯通左前设备房与主台基前缘 z = +30.6, x: -43 ~ +31)
  const fenceGroup = new THREE.Group()
  fenceGroup.position.set(-6, 0.3, 30.6)
  const fenceRail = new THREE.Mesh(
    new THREE.BoxGeometry(74, 0.1, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, metalness: 0.6 })
  )
  fenceRail.position.y = 1.4
  fenceGroup.add(fenceRail)

  const postGeo = new THREE.BoxGeometry(0.18, 1.5, 0.18)
  const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 })
  for (let fx = -37; fx <= 37; fx += 3.2) {
    const post = new THREE.Mesh(postGeo, postMat)
    post.position.set(fx, 0.75, 0)
    fenceGroup.add(post)
  }
  sceneInstance.add(fenceGroup)

  // 9. 周边真实山谷地貌环境还原 + 右侧道路克制型路灯点缀
  const roadGroup = new THREE.Group()
  roadGroup.position.set(35.5, 0.02, -4)
  roadGroup.rotation.y = 0.08

  const roadGeo = new THREE.PlaneGeometry(7.8, 96)
  roadGeo.rotateX(-Math.PI / 2)
  const roadMesh = new THREE.Mesh(
    roadGeo,
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.12 })
  )
  roadMesh.receiveShadow = true
  roadGroup.add(roadMesh)

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
  const dashGeo = new THREE.PlaneGeometry(0.14, 2.4)
  dashGeo.rotateX(-Math.PI / 2)
  const dashMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 })

  for (let rz = -42; rz <= 42; rz += 6) {
    const dash = new THREE.Mesh(dashGeo, dashMat)
    dash.position.set(0, 0.03, rz)
    roadGroup.add(dash)
  }

  for (let lz = -27; lz <= 27; lz += 18) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 4.6, 8), poleMat)
    pole.position.set(-3.4, 2.3, lz)
    roadGroup.add(pole)

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 0.07), poleMat)
    arm.position.set(-2.9, 4.55, lz)
    roadGroup.add(arm)

    const lampHead = createAccentLine(0.32, 0.08, 0.18, 0xffe8b3, 1.5)
    lampHead.position.set(-2.4, 4.5, lz)
    roadGroup.add(lampHead)

    const roadPoolGeo = new THREE.PlaneGeometry(6.8, 6.8)
    roadPoolGeo.rotateX(-Math.PI / 2)
    const roadPool = new THREE.Mesh(
      roadPoolGeo,
      new THREE.MeshBasicMaterial({
        map: warmLightPoolTex,
        transparent: true,
        opacity: 0.26,
        depthWrite: false
      })
    )
    roadPool.position.set(-0.8, 0.05, lz)
    roadGroup.add(roadPool)
  }

  sceneInstance.add(roadGroup)

  // 重安江支流溪水
  const streamGeo = new THREE.PlaneGeometry(9, 110)
  streamGeo.rotateX(-Math.PI / 2)
  const streamMesh = new THREE.Mesh(
    streamGeo,
    new THREE.MeshStandardMaterial({
      color: 0x082f49,
      emissive: 0x041e30,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.6
    })
  )
  streamMesh.position.set(44.5, -0.05, -4)
  streamMesh.rotation.y = 0.08
  sceneInstance.add(streamMesh)

  // 9.2 后方生态尾水沉淀塘
  const backPondGeo = new THREE.PlaneGeometry(26, 14)
  backPondGeo.rotateX(-Math.PI / 2)
  const backPond = new THREE.Mesh(
    backPondGeo,
    new THREE.MeshStandardMaterial({
      color: 0x075985,
      roughness: 0.22,
      metalness: 0.65
    })
  )
  backPond.position.set(-16, 0.02, -39)
  sceneInstance.add(backPond)

  // 9.3 远景高架桥巨型双柱桥墩
  const pierGroup = new THREE.Group()
  pierGroup.position.set(0, 0, -56)
  const pierGeo = new THREE.BoxGeometry(2.6, 26, 3.2)
  const pierMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.65,
    metalness: 0.2
  })
  for (let p = -2.5; p <= 2.5; p += 1) {
    const pier = new THREE.Mesh(pierGeo, pierMat)
    pier.position.set(p * 18, 13, (Math.abs(p) % 2) * -3)
    pierGroup.add(pier)
  }
  sceneInstance.add(pierGroup)

  // 9.4 右侧山坡与后方林带低多边形绿植群
  const treeMat = new THREE.MeshStandardMaterial({
    color: 0x1b6b45,
    emissive: 0x0a3822,
    emissiveIntensity: 0.42,
    roughness: 0.82,
    flatShading: true
  })
  const treeGeo = new THREE.ConeGeometry(2.2, 5.2, 7)
  for (let tx = -6; tx <= 28; tx += 3.4) {
    for (let tz = -39; tz <= -31; tz += 3.4) {
      const foliage = new THREE.Mesh(treeGeo, treeMat)
      const s = 0.75 + Math.random() * 0.55
      foliage.scale.set(s, s * (0.9 + Math.random() * 0.3), s)
      foliage.position.set(
        tx + (Math.random() - 0.5) * 1.4,
        2.2 * s,
        tz + (Math.random() - 0.5) * 1.4
      )
      sceneInstance.add(foliage)
    }
  }
  for (let tz = -42; tz <= 32; tz += 4.2) {
    for (let layer = 0; layer < 3; layer++) {
      const foliage = new THREE.Mesh(treeGeo, treeMat)
      const s = 1.0 + layer * 0.35 + Math.random() * 0.35
      foliage.scale.set(s, s * 1.1, s)
      foliage.position.set(50 + layer * 4.5, 2.4 * s, tz)
      sceneInstance.add(foliage)
    }
  }

  // 10. 增温/增氧/投喂流光管道系统（从左前新增【设备房】输往两片【养虾池】与【管理用房】）
  const flowPulses: FlowPulseItem[] = []
  const pipeRoutes = [
    // 设备房 -> 后方主养虾池大棚区
    [
      new THREE.Vector3(-32.2, 2.0, 12),
      new THREE.Vector3(-28, 2.0, 5),
      new THREE.Vector3(-12, 1.8, -6),
      new THREE.Vector3(-12, 1.8, -18),
      new THREE.Vector3(8, 1.8, -18)
    ],
    // 设备房 -> 左前养虾池区
    [
      new THREE.Vector3(-32.2, 2.0, 18.2),
      new THREE.Vector3(-22, 1.8, 18.2),
      new THREE.Vector3(-4, 1.8, 18.2)
    ],
    // 管理用房 -> 后方主养虾池与左前养虾池控制干线
    [
      new THREE.Vector3(17, 2.2, 11.5),
      new THREE.Vector3(4, 2.0, 6.2),
      new THREE.Vector3(-12, 1.8, 6.2)
    ]
  ]

  const pulseSphereGeo = new THREE.SphereGeometry(0.32, 12, 12)
  const pulseSphereMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x00e5ff,
    emissiveIntensity: 1.6
  })

  pipeRoutes.forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts)
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, false)
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00a8ff,
      transparent: true,
      opacity: 0.38
    })
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
    sceneInstance.add(tubeMesh)

    for (let k = 0; k < 3; k++) {
      const pulseMesh = new THREE.Mesh(pulseSphereGeo, pulseSphereMat)
      sceneInstance.add(pulseMesh)
      flowPulses.push({
        mesh: pulseMesh,
        curve,
        progress: k / 3,
        speed: 0.16 + Math.random() * 0.05
      })
    }
  })

  // 11. 底部周期扩散脉冲扫描环
  const pulseRings: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const pGeo = new THREE.RingGeometry(1.5, 2.0, 64)
    pGeo.rotateX(-Math.PI / 2)
    const pMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    const pMesh = new THREE.Mesh(pGeo, pMat)
    pMesh.position.set(0, 0.42, 0)
    pMesh.userData = { phase: i / 3 }
    sceneInstance.add(pMesh)
    pulseRings.push(pMesh)
  }

  // 12. 虾池纳米微孔曝气气泡粒子系统（覆盖后方与左前两片养虾池）
  const bubbleCount = 160
  const bubblePositions = new Float32Array(bubbleCount * 3)
  for (let i = 0; i < bubbleCount; i++) {
    if (i < 110) {
      // 后方大棚养虾池区
      bubblePositions[i * 3] = (Math.random() - 0.5) * 52
      bubblePositions[i * 3 + 1] = 0.6 + Math.random() * 2.8
      bubblePositions[i * 3 + 2] = -26 + Math.random() * 28
    } else {
      // 左前养虾池区
      bubblePositions[i * 3] = -27 + Math.random() * 28
      bubblePositions[i * 3 + 1] = 0.6 + Math.random() * 2.2
      bubblePositions[i * 3 + 2] = 8 + Math.random() * 20
    }
  }
  const bubbleGeo = new THREE.BufferGeometry()
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3))
  const bubbleMat = new THREE.PointsMaterial({
    size: 0.55,
    map: createGlowTexture('#00e5ff'),
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const bubbleParticles = new THREE.Points(bubbleGeo, bubbleMat)
  sceneInstance.add(bubbleParticles)

  // 13. 选中点位时的 3D 锁定高亮光环与光柱
  const highlightGroup = new THREE.Group()
  highlightGroup.visible = false

  const hRingGeo = new THREE.RingGeometry(3.8, 4.5, 48)
  hRingGeo.rotateX(-Math.PI / 2)
  const highlightRingOuter = new THREE.Mesh(
    hRingGeo,
    new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  highlightRingOuter.position.y = 0.6
  highlightGroup.add(highlightRingOuter)

  const hBeamGeo = new THREE.CylinderGeometry(2.4, 2.4, 14, 32, 1, true)
  hBeamGeo.translate(0, 7, 0)
  const highlightBeam = new THREE.Mesh(
    hBeamGeo,
    new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  )
  highlightGroup.add(highlightBeam)
  sceneInstance.add(highlightGroup)

  return {
    pulseRings,
    bubbleParticles,
    blowerFans,
    flowPulses,
    highlightGroup,
    highlightRingOuter,
    highlightBeam
  }
}
