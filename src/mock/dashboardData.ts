import dashboardDataJson from '../../public/dashboardData.json'

export interface OverviewItem {
  key: string
  label: string
  value: string | number
  unit?: string
  icon: 'water' | 'cage' | 'species' | 'area' | 'capacity' | 'stock'
}

export interface EnvMetricItem {
  key: string
  label: string
  value: string
  unit: string
  icon: string
  color: string
}

export interface EnvTrendSeries {
  key: string
  label: string
  unit: string
  min: number
  max: number
  data: number[]
}

export interface DeviceStatusData {
  onlineRate: number
  online: number
  offline: number
  warning: number
  total: number
}

export interface StageMarker {
  id: string
  name: string
  type: 'cage' | 'cabin' | 'monitor' | 'warehouse' | 'leisure' | 'aerator' | 'camera' | 'env' | 'feeder'
  x: number
  y: number
  status: '正常' | '运行中' | '待机'
  detail: string
  metrics: { label: string; value: string }[]
}

export interface VideoFeedItem {
  id: string
  name: string
  cover: string
  videoUrl: string
  channel: string
  online: boolean
}

export interface ScaleSliceItem {
  name: string
  count: number
  unit: string
  percent: string
  color: string
}

export interface GrowthStageItem {
  dayLabel: string
  weight: number
  headCount: string
  lengthRange: string
  stageDesc: string
}

export interface GrowthData {
  subtitle: string
  currentDay: string
  currentSpec: string
  uniformity: string
  survivalRate: string
  stages: GrowthStageItem[]
}

export interface FeedingPlanItem {
  time: string
  baseFeed: string
  supplement: string
  amount: number
  status: '已完成' | '待执行'
}

export interface WarningRecordItem {
  time: string
  content: string
  level: '紧急' | '重要' | '一般'
  status: '已处理' | '处理中'
}

export interface BaseIntroData {
  title: string
  location: string
  tags: string[]
  description: string
  highlights: { label: string; value: string }[]
}

export interface FarmDashboardData {
  id: string
  name: string
  overview: OverviewItem[]
  envMetrics: {
    underwater: EnvMetricItem[]
    surface: EnvMetricItem[]
  }
  envTrends: Record<string, EnvTrendSeries>
  deviceStatus: DeviceStatusData
  markers: StageMarker[]
  videos: VideoFeedItem[]
  baseIntro: BaseIntroData
  growth: GrowthData
  feeding: {
    stageTitle: string
    todayTotal: number
    unit: string
    slices: ScaleSliceItem[]
    plans: FeedingPlanItem[]
  }
  warnings: {
    urgent: number
    important: number
    normal: number
    list: WarningRecordItem[]
  }
}

export const FARM_LIST = [
  { id: 'farm-1', name: '重安对虾示范基地' }
]

export const NAV_ITEMS = [
  { path: '/', name: '首页', icon: 'home' },
  { path: '/monitor', name: '养殖监控', icon: 'monitor' },
  { path: '/environment', name: '环境监测', icon: 'env' },
  { path: '/feeding', name: '投喂管理', icon: 'feeding' },
  { path: '/growth', name: '生长分析', icon: 'growth' },
  { path: '/device', name: '设备管理', icon: 'device' },
  { path: '/warning', name: '预警中心', icon: 'warning' },
  { path: '/report', name: '数据报表', icon: 'report' },
  { path: '/system', name: '系统管理', icon: 'system' },
  { path: '/data-manage', name: '数据管理', icon: 'system' }
]

export const DASHBOARD_DATA_MAP: Record<string, FarmDashboardData> = dashboardDataJson as unknown as Record<string, FarmDashboardData>
