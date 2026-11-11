import * as THREE from 'three'
import guizhouCityGeoJson from '@/assets/geojson/520000_full.json'
import guizhouDistrictGeoJson from '@/assets/geojson/520000_full_district.json'
import huaihuaDistrictGeoJson from '@/assets/geojson/431200_full.json'

export type HubId = 'hub-kaili' | 'hub-huaihua' | 'hub-guiyang'
export type CooperationStatus = 'cooperated' | 'planned'

export interface GeoRegionData {
  id: string
  name: string
  shortName: string
  province: 'guizhou' | 'adjacent'
  centerLngLat: [number, number]
  /** 每个 region 包含的全部 Polygon，每个 Polygon 为 [外环, ...内孔]，环由经纬度点列 [lng, lat][] 组成 */
  polygons: [number, number][][][]
}

export interface MapTargetCity {
  id: string
  name: string
  hubId: HubId
  status: CooperationStatus
  lngLat: [number, number]
  province: '贵州' | '湖南' | '重庆'
}

export interface MapHubWarehouse {
  id: HubId
  name: string
  badge: string
  status: CooperationStatus
  statusText: string
  lngLat: [number, number]
  color: string
  colorHex: number
  description: string
  coverageNote: string
  cities: MapTargetCity[]
  /** 点击该仓时相机的最佳观察位置与焦点 */
  camPos: THREE.Vector3
  camTarget: THREE.Vector3
}

/** 地图模式全局默认鸟瞰相机参数（呈现如参考图般的 3D 倾斜浮雕全景） */
export const MAP_DEFAULT_CAM_POS = new THREE.Vector3(2, 68, 78)
export const MAP_DEFAULT_TARGET = new THREE.Vector3(4, 0, -2)

/** 墨卡托等比平面映射：将经纬度 [lng, lat] 转换为 Three.js 场景 [x, z] 坐标 */
export const MAP_CENTER_LNG = 107.45
export const MAP_CENTER_LAT = 26.85
export const MAP_SCALE_X = 14.2
export const MAP_SCALE_Z = 15.8

export function lngLatToWorldXZ(lng: number, lat: number): [number, number] {
  const x = (lng - MAP_CENTER_LNG) * MAP_SCALE_X
  const z = -(lat - MAP_CENTER_LAT) * MAP_SCALE_Z
  return [Number(x.toFixed(3)), Number(z.toFixed(3))]
}

export function lngLatToVector3(lng: number, lat: number, y = 0): THREE.Vector3 {
  const [x, z] = lngLatToWorldXZ(lng, lat)
  return new THREE.Vector3(x, y, z)
}

/** 核心源点：黄平重安镇（我们厂区） */
export const HQ_ORIGIN_NODE = {
  id: 'hq-chongan',
  name: '黄平重安镇（中心厂区）',
  shortName: '黄平重安镇·总厂',
  lngLat: [107.98, 26.83] as [number, number],
  detail: '贵州省黔东南州黄平县重安镇陆基循环水养殖总基地，作为核心苗种与成品虾供应源头，辐射凯里仓、怀化仓及贵阳规划仓。'
}

/**
 * 严格对应 doc/点线辐射地区.md 的三大仓与下辖辐射城市数据
 * 坐标全部对齐 520000_full_district.json 与 431200_full.json 官方行政中心
 */
export const MAP_HUB_WAREHOUSES: MapHubWarehouse[] = [
  {
    id: 'hub-kaili',
    name: '凯里仓',
    badge: '已合作 · 黔东南核心枢纽',
    status: 'cooperated',
    statusText: '已投运供货',
    lngLat: [107.9775, 26.583],
    color: '#00f2fe',
    colorHex: 0x00f2fe,
    description: '立足凯里市区，全面覆盖黔东南州及湘黔交界 16 个核心县市的高密度鲜活水产冷链直配网络。',
    coverageNote: '直供 16 个县市（黔东南全境及周边）',
    camPos: new THREE.Vector3(14, 42, 46),
    camTarget: new THREE.Vector3(14, 1.5, 8),
    cities: [
      { id: 'kl-kaili', name: '凯里市', hubId: 'hub-kaili', status: 'cooperated', lngLat: [107.9775, 26.583], province: '贵州' },
      { id: 'kl-huangping', name: '黄平县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [107.9013, 26.897], province: '贵州' },
      { id: 'kl-shibing', name: '施秉县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [108.1268, 27.0347], province: '贵州' },
      { id: 'kl-zhenyuan', name: '镇远县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [108.4237, 27.0502], province: '贵州' },
      { id: 'kl-sansui', name: '三穗县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [108.6811, 26.9599], province: '贵州' },
      { id: 'kl-tianzhu', name: '天柱县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [109.2128, 26.9097], province: '贵州' },
      { id: 'kl-jinping', name: '锦屏县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [109.2025, 26.6806], province: '贵州' },
      { id: 'kl-jingzhou', name: '靖州县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [109.6912, 26.5735], province: '湖南' },
      { id: 'kl-liping', name: '黎平县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [109.1365, 26.2306], province: '贵州' },
      { id: 'kl-congjiang', name: '从江县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [108.9126, 25.7471], province: '贵州' },
      { id: 'kl-rongjiang', name: '榕江县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [108.521, 25.9311], province: '贵州' },
      { id: 'kl-leishan', name: '雷山县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [108.0796, 26.381], province: '贵州' },
      { id: 'kl-jianhe', name: '剑河县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [108.4405, 26.7273], province: '贵州' },
      { id: 'kl-danzhai', name: '丹寨县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [107.7948, 26.1995], province: '贵州' },
      { id: 'kl-sandu', name: '三都县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [107.8775, 25.9852], province: '贵州' },
      { id: 'kl-majiang', name: '麻江县', hubId: 'hub-kaili', status: 'cooperated', lngLat: [107.5932, 26.4948], province: '贵州' }
    ]
  },
  {
    id: 'hub-huaihua',
    name: '怀化仓',
    badge: '已合作 · 湘黔渝跨省枢纽',
    status: 'cooperated',
    statusText: '已投运供货',
    lngLat: [109.9822, 27.5485],
    color: '#38bdf8',
    colorHex: 0x38bdf8,
    description: '辐射铜仁全境、遵义余庆以及湖南怀化/湘西、重庆秀山等 18 个跨省市县的东向骨干集散仓。',
    coverageNote: '直供 18 个县市（横跨黔、湘、渝三省市）',
    camPos: new THREE.Vector3(30, 44, 32),
    camTarget: new THREE.Vector3(26, 1.5, -14),
    cities: [
      { id: 'hh-xupu', name: '溆浦县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [110.5934, 27.9038], province: '湖南' },
      { id: 'hh-chenxi', name: '辰溪县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [110.197, 28.0055], province: '湖南' },
      { id: 'hh-luxi', name: '泸溪县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [110.217, 28.219], province: '湖南' },
      { id: 'hh-yuanling', name: '沅陵县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [110.3992, 28.4556], province: '湖南' },
      { id: 'hh-mayang', name: '麻阳县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [109.8028, 27.866], province: '湖南' },
      { id: 'hh-fenghuang', name: '凤凰县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [109.598, 27.948], province: '湖南' },
      { id: 'hh-songtao', name: '松桃县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [109.2026, 28.1654], province: '贵州' },
      { id: 'hh-xiushan', name: '秀山县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [108.996, 28.447], province: '重庆' },
      { id: 'hh-tongren', name: '铜仁市区', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [109.1916, 27.7183], province: '贵州' },
      { id: 'hh-jiangkou', name: '江口县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [108.8484, 27.6919], province: '贵州' },
      { id: 'hh-zhijiang', name: '芷江县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [109.6878, 27.438], province: '湖南' },
      { id: 'hh-zhongfang', name: '中方县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [109.9481, 27.4374], province: '湖南' },
      { id: 'hh-xinhuang', name: '新晃县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [109.1744, 27.3599], province: '湖南' },
      { id: 'hh-yuping', name: '玉屏县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [108.9179, 27.238], province: '贵州' },
      { id: 'hh-cengong', name: '岑巩县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [108.8165, 27.1732], province: '贵州' },
      { id: 'hh-yinjiang', name: '印江县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [108.4055, 27.998], province: '贵州' },
      { id: 'hh-shiqian', name: '石阡县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [108.2299, 27.5194], province: '贵州' },
      { id: 'hh-yuqing', name: '余庆县', hubId: 'hub-huaihua', status: 'cooperated', lngLat: [107.8926, 27.2216], province: '贵州' }
    ]
  },
  {
    id: 'hub-guiyang',
    name: '贵阳仓',
    badge: '2027 规划 · 合作意向枢纽',
    status: 'planned',
    statusText: '2027年规划进入',
    lngLat: [106.63, 26.6477],
    color: '#fbbf24',
    colorHex: 0xfbbf24,
    description: '2027 年战略规划入驻省会贵阳枢纽，打通黔中城市群及黔北、黔西干线，预计贵州省内全部覆盖率达到 70%。',
    coverageNote: '2027年规划进入，预计贵州省内全部覆盖达到 70%',
    camPos: new THREE.Vector3(-14, 48, 52),
    camTarget: new THREE.Vector3(-14, 1.5, 4),
    cities: [
      { id: 'gy-guiyang', name: '贵阳市区', hubId: 'hub-guiyang', status: 'planned', lngLat: [106.7135, 26.5783], province: '贵州' },
      { id: 'gy-zunyi', name: '遵义市', hubId: 'hub-guiyang', status: 'planned', lngLat: [106.9373, 27.7066], province: '贵州' },
      { id: 'gy-bijie', name: '毕节市', hubId: 'hub-guiyang', status: 'planned', lngLat: [105.285, 27.3017], province: '贵州' },
      { id: 'gy-liupanshui', name: '六盘水市', hubId: 'hub-guiyang', status: 'planned', lngLat: [104.8467, 26.5846], province: '贵州' },
      { id: 'gy-anshun', name: '安顺市', hubId: 'hub-guiyang', status: 'planned', lngLat: [105.9322, 26.2455], province: '贵州' },
      { id: 'gy-qiannan', name: '黔南州(都匀)', hubId: 'hub-guiyang', status: 'planned', lngLat: [107.5172, 26.2582], province: '贵州' },
      { id: 'gy-qianxinan', name: '黔西南州(兴义)', hubId: 'hub-guiyang', status: 'planned', lngLat: [104.898, 25.0881], province: '贵州' }
    ]
  }
]

/**
 * 辅助：从 GeoJSON Feature 解析 Polygon / MultiPolygon 经纬度环
 */
function parseGeoJsonFeaturePolygons(feature: any): [number, number][][][] {
  const geom = feature.geometry
  if (!geom || !geom.coordinates) return []
  if (geom.type === 'Polygon') {
    return [geom.coordinates as [number, number][][]]
  } else if (geom.type === 'MultiPolygon') {
    return geom.coordinates as [number, number][][][]
  }
  return []
}

/**
 * 贵州 9 地州真实边界与中心（解析自 doc/json/520000_full.json）
 */
export const GUIZHOU_CITY_REGIONS: GeoRegionData[] = (guizhouCityGeoJson as any).features.map(
  (f: any): GeoRegionData => {
    const rawPolys = parseGeoJsonFeaturePolygons(f)
    // 过滤退化小碎片（保留点数 >= 4 的有效多边形）
    const validPolys = rawPolys.filter(p => p[0] && p[0].length >= 4)
    const name = f.properties.name || ''
    const shortName = name
      .replace(/(布依族苗族|苗族侗族)?自治州$/, '州')
      .replace(/市$/, '')

    return {
      id: `gz-reg-${f.properties.adcode || name}`,
      name,
      shortName,
      province: 'guizhou',
      centerLngLat: (f.properties.center || f.properties.centroid) as [number, number],
      polygons: validPolys
    }
  }
)

/**
 * 怀化市 12 区县真实边界与中心（解析自 doc/json/431200_full.json）
 */
export const HUAIHUA_DISTRICT_REGIONS: GeoRegionData[] = (huaihuaDistrictGeoJson as any).features.map(
  (f: any): GeoRegionData => {
    const rawPolys = parseGeoJsonFeaturePolygons(f)
    const validPolys = rawPolys.filter(p => p[0] && p[0].length >= 4)
    const name = f.properties.name || ''
    const shortName = name
      .replace(/(侗族|苗族|苗族侗族)?自治县$/, '县')
      .replace(/市$/, '')

    return {
      id: `hh-reg-${f.properties.adcode || name}`,
      name,
      shortName,
      province: 'adjacent',
      centerLngLat: (f.properties.center || f.properties.centroid) as [number, number],
      polygons: validPolys
    }
  }
)

/**
 * 怀化仓下辖跨省三县（湘西凤凰县/泸溪县、重庆秀山县）缝合承接区板块
 * 紧密接壤铜仁松桃东缘与怀化麻阳/辰溪/沅陵西缘，使 18 县全部坐落于 3D 浮雕板块之上
 */
export const CROSS_BORDER_ADJACENT_REGIONS: GeoRegionData[] = [
  {
    id: 'adj-fenghuang-luxi-xiushan',
    name: '湘西·秀山协同区',
    shortName: '湘西·秀山',
    province: 'adjacent',
    centerLngLat: [109.65, 28.25],
    polygons: [
      [
        [
          [108.75, 28.50],
          [109.05, 28.68],
          [109.42, 28.58],
          [109.82, 28.45],
          [110.35, 28.38],
          [110.20, 28.12],
          [109.82, 27.90],
          [109.43, 27.84],
          [109.38, 28.08],
          [109.28, 28.36],
          [108.88, 28.48],
          [108.75, 28.50]
        ]
      ]
    ]
  }
]

/**
 * 贵州 88 区县真实内部边界线（解析自 doc/json/520000_full_district.json）
 * 用于在 3D 贵州地表绘制细腻的半透明青蓝区县网格线，100% 还原参考图细密行政线质感
 */
export const GUIZHOU_INNER_COUNTY_LINES: [number, number][][] = []
for (const f of (guizhouDistrictGeoJson as any).features) {
  const polys = parseGeoJsonFeaturePolygons(f)
  for (const poly of polys) {
    if (poly[0] && poly[0].length >= 4) {
      GUIZHOU_INNER_COUNTY_LINES.push(poly[0])
    }
  }
}
