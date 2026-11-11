import * as THREE from 'three'

export interface Marker3DConfigItem {
  anchor: THREE.Vector3
  camOffset: THREE.Vector3
  radius: number
}

export interface ProjectedMarkerPos {
  x: number
  y: number
  visible: boolean
}

// 默认全局鸟瞰视角（微调视角中心以完整呈现左侧新增【设备房】与5大分区）
export const DEFAULT_CAM_POS = new THREE.Vector3(-3, 46, 72)
export const DEFAULT_TARGET = new THREE.Vector3(-3, 1, 3)

// 5大核心分区对应的 3D 世界坐标与最佳聚焦相机位置（严格对齐手绘规划图）
export const MARKER_3D_CONFIG: Record<string, Marker3DConfigItem> = {
  // 1. 后方主区：养虾池（保留钢结构保温大棚屋顶）
  'm-shrimp-main': {
    anchor: new THREE.Vector3(0, 7.2, -12),
    camOffset: new THREE.Vector3(0, 34, 28),
    radius: 16
  },
  // 2. 左前核心区：养虾池（原循环水处理中心+前区水泥方池群合并）
  'm-shrimp-front': {
    anchor: new THREE.Vector3(-13, 3.2, 18),
    camOffset: new THREE.Vector3(-13, 24, 48),
    radius: 12
  },
  // 3. 左前外侧扩建区：设备房（原料仓库/增温设备/增氧设备/饲料仓库）
  'm-equipment-room': {
    anchor: new THREE.Vector3(-37.5, 6.8, 18),
    camOffset: new THREE.Vector3(-52, 22, 44),
    radius: 9
  },
  // 4. 右前片区后部：管理用房（监控中心/实验中心/生活中心）
  'm-management-bldg': {
    anchor: new THREE.Vector3(17, 7.8, 11.5),
    camOffset: new THREE.Vector3(32, 22, 38),
    radius: 9
  },
  // 5. 右前片区前部：休闲平台
  'm-leisure-deck': {
    anchor: new THREE.Vector3(17, 3.2, 23.8),
    camOffset: new THREE.Vector3(28, 18, 46),
    radius: 7
  }
}
