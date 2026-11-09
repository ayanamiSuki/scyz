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
  x: number // percentage 0-100
  y: number // percentage 0-100
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

export interface GrowthData {
  dates: string[]
  weights: number[]
  avgWeight: string
  dailyGain: string
  uniformity: string
  survivalRate: string
}

export interface FeedingPlanItem {
  time: string
  cage: string
  feedType: string
  amount: number
  status: '已完成' | '待执行'
}

export interface WarningRecordItem {
  time: string
  content: string
  level: '紧急' | '重要' | '一般'
  status: '已处理' | '处理中'
}

export interface BottomSummaryItem {
  key: string
  label: string
  value: string | number
  unit: string
  icon: 'cage' | 'water' | 'capacity' | 'stock' | 'feed' | 'yield' | 'online'
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
  scaleAnalysis: {
    totalStock: number
    bySpecies: ScaleSliceItem[]
    byCage: ScaleSliceItem[]
  }
  growth: GrowthData
  feeding: {
    todayTotal: number
    slices: ScaleSliceItem[]
    plans: FeedingPlanItem[]
  }
  warnings: {
    urgent: number
    important: number
    normal: number
    list: WarningRecordItem[]
  }
  bottomSummary: BottomSummaryItem[]
}

export const FARM_LIST = [
  { id: 'farm-1', name: '深海1号养殖场' },
  { id: 'farm-2', name: '深海2号养殖场' }
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
  { path: '/system', name: '系统管理', icon: 'system' }
]

export const DASHBOARD_DATA_MAP: Record<string, FarmDashboardData> = {
  'farm-1': {
    id: 'farm-1',
    name: '深海 1 号养殖场',
    overview: [
      { key: 'water', label: '养殖水体', value: 120000, unit: 'm³', icon: 'water' },
      { key: 'cage', label: '养殖网箱', value: 12, unit: '个', icon: 'cage' },
      { key: 'species', label: '养殖品种', value: '大黄鱼、鲈鱼、石斑鱼', unit: '', icon: 'species' },
      { key: 'area', label: '养殖面积', value: 120, unit: '公顷', icon: 'area' },
      { key: 'capacity', label: '设计产能', value: 240000, unit: '尾/批', icon: 'capacity' },
      { key: 'stock', label: '当前存塘', value: 185200, unit: '尾', icon: 'stock' }
    ],
    envMetrics: {
      underwater: [
        { key: 'temp', label: '水温', value: '18.6', unit: '℃', icon: 'temp', color: '#00e5ff' },
        { key: 'do', label: '溶解氧', value: '6.45', unit: 'mg/L', icon: 'drop', color: '#38bdf8' },
        { key: 'ph', label: 'pH', value: '7.86', unit: '', icon: 'ph', color: '#22c55e' },
        { key: 'salinity', label: '盐度', value: '30.2', unit: 'ppt', icon: 'salt', color: '#2dd4bf' },
        { key: 'nh3', label: '氨氮', value: '0.21', unit: 'mg/L', icon: 'chem', color: '#34d399' },
        { key: 'no2', label: '亚硝酸盐', value: '0.02', unit: 'mg/L', icon: 'lab', color: '#60a5fa' },
        { key: 'turbidity', label: '浊度', value: '3.2', unit: 'NTU', icon: 'wave', color: '#818cf8' },
        { key: 'chla', label: '叶绿素a', value: '12.5', unit: 'μg/L', icon: 'leaf', color: '#4ade80' }
      ],
      surface: [
        { key: 'temp', label: '气温', value: '24.2', unit: '℃', icon: 'temp', color: '#00e5ff' },
        { key: 'do', label: '气压', value: '1013', unit: 'hPa', icon: 'drop', color: '#38bdf8' },
        { key: 'ph', label: '湿度', value: '76.5', unit: '%', icon: 'ph', color: '#22c55e' },
        { key: 'salinity', label: '风速', value: '4.6', unit: 'm/s', icon: 'salt', color: '#2dd4bf' },
        { key: 'nh3', label: '风向', value: '东南风', unit: '', icon: 'chem', color: '#34d399' },
        { key: 'no2', label: '降雨量', value: '0.0', unit: 'mm', icon: 'lab', color: '#60a5fa' },
        { key: 'turbidity', label: '光照度', value: '42.8', unit: 'klx', icon: 'wave', color: '#818cf8' },
        { key: 'chla', label: '浪高', value: '0.65', unit: 'm', icon: 'leaf', color: '#4ade80' }
      ]
    },
    envTrends: {
      水温: {
        key: '水温',
        label: '水温',
        unit: '℃',
        min: 10,
        max: 25,
        data: [17.5, 17.0, 17.8, 19.2, 18.8, 18.6]
      },
      溶解氧: {
        key: '溶解氧',
        label: '溶解氧',
        unit: 'mg/L',
        min: 4,
        max: 9,
        data: [6.1, 5.8, 6.3, 6.9, 6.7, 6.45]
      },
      pH: {
        key: 'pH',
        label: 'pH',
        unit: '',
        min: 7.0,
        max: 8.5,
        data: [7.75, 7.72, 7.80, 7.88, 7.85, 7.86]
      },
      盐度: {
        key: '盐度',
        label: '盐度',
        unit: 'ppt',
        min: 28,
        max: 33,
        data: [30.0, 30.1, 30.1, 30.3, 30.2, 30.2]
      }
    },
    deviceStatus: {
      onlineRate: 98.2,
      online: 168,
      offline: 3,
      warning: 2,
      total: 173
    },
    markers: [
      {
        id: 'm-cage-north',
        name: '网箱群',
        type: 'cage',
        x: 51.5,
        y: 34.2,
        status: '正常',
        detail: '北区深水抗风浪网箱群（1#~6#网箱），主养大黄鱼与鲈鱼。',
        metrics: [
          { label: '在养网箱', value: '6 个' },
          { label: '当前存塘', value: '98,400 尾' },
          { label: '水下水温', value: '18.5 ℃' }
        ]
      },
      {
        id: 'm-cage-south',
        name: '网箱群',
        type: 'cage',
        x: 32.2,
        y: 61.5,
        status: '正常',
        detail: '南区高密度智能化网箱群（7#~12#网箱），配备水下双目测重相机。',
        metrics: [
          { label: '在养网箱', value: '6 个' },
          { label: '当前存塘', value: '86,800 尾' },
          { label: '溶解氧', value: '6.48 mg/L' }
        ]
      },
      {
        id: 'm-cabin',
        name: '设备舱',
        type: 'cabin',
        x: 45.8,
        y: 71.2,
        status: '运行中',
        detail: '中央电力与气源控制设备舱，提供全天候风光储微电网供电。',
        metrics: [
          { label: '供电负载', value: '64.2 kW' },
          { label: '储能SOC', value: '92 %' },
          { label: '舱内温度', value: '26.4 ℃' }
        ]
      },
      {
        id: 'm-monitor',
        name: '监控中心',
        type: 'monitor',
        x: 24.8,
        y: 83.2,
        status: '正常',
        detail: '海上数字孪生中控室，汇聚全天候雷达、AIS与水下视频流。',
        metrics: [
          { label: '视频接入', value: '36 路' },
          { label: '网络延迟', value: '14 ms' },
          { label: '值班状态', value: '2人再岗' }
        ]
      },
      {
        id: 'm-warehouse',
        name: '饲料仓库',
        type: 'warehouse',
        x: 35.2,
        y: 92.2,
        status: '正常',
        detail: '恒温防潮智能饲料仓，支持气力输送管网自动配料。',
        metrics: [
          { label: '当前库存', value: '42.5 吨' },
          { label: '仓内湿度', value: '48 %' },
          { label: '预计可用', value: '35 天' }
        ]
      },
      {
        id: 'm-leisure',
        name: '休闲平台',
        type: 'leisure',
        x: 49.8,
        y: 94.8,
        status: '正常',
        detail: '海洋牧场观光与科教综合平台，支持生态海钓与科普研学。',
        metrics: [
          { label: '安全载荷', value: '120 人' },
          { label: '当前登岛', value: '18 人' },
          { label: '救生设施', value: '完好' }
        ]
      },
      {
        id: 'm-aerator',
        name: '增氧机',
        type: 'aerator',
        x: 64.2,
        y: 94.6,
        status: '运行中',
        detail: '纳米微孔底部增氧阵列，根据溶解氧阈值自动变频联动。',
        metrics: [
          { label: '运行台数', value: '24 / 24 台' },
          { label: '输出气压', value: '0.42 MPa' },
          { label: '实时溶氧', value: '6.45 mg/L' }
        ]
      },
      {
        id: 'm-camera',
        name: '摄像头',
        type: 'camera',
        x: 77.2,
        y: 92.0,
        status: '正常',
        detail: '360°高清红外球机与水下双光谱云台，支持鱼群行为AI识别。',
        metrics: [
          { label: '在线相机', value: '48 / 48 路' },
          { label: 'AI识别率', value: '96.8 %' },
          { label: '存储状态', value: '正常' }
        ]
      },
      {
        id: 'm-env',
        name: '环境平台',
        type: 'env',
        x: 89.2,
        y: 82.0,
        status: '正常',
        detail: '多参数水质浮标与海床基观测站，每5分钟回传8项核心水质参数。',
        metrics: [
          { label: '采样频率', value: '5 min/次' },
          { label: '海流流速', value: '0.38 m/s' },
          { label: '传感器状态', value: '全部在线' }
        ]
      },
      {
        id: 'm-feeder',
        name: '投喂平台',
        type: 'feeder',
        x: 91.2,
        y: 55.6,
        status: '运行中',
        detail: '远程精准气力投喂系统，结合鱼群摄食水花视觉算法动态调节投喂速率。',
        metrics: [
          { label: '今日已投', value: '160 kg' },
          { label: '待投计划', value: '160 kg' },
          { label: '管道压力', value: '正常' }
        ]
      }
    ],
    videos: [
      { id: 'v1', name: '1号网箱', cover: '/assets/video-1.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-01 水下高清', online: true },
      { id: 'v2', name: '2号网箱', cover: '/assets/video-2.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-02 水下高清', online: true },
      { id: 'v3', name: '投喂平台', cover: '/assets/video-3.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-03 平台云台', online: true },
      { id: 'v4', name: '增氧机区域', cover: '/assets/video-4.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-04 海面广角', online: true },
      { id: 'v5', name: '环境浮标', cover: '/assets/video-5.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-05 浮标近景', online: true },
      { id: 'v6', name: '休闲平台', cover: '/assets/video-6.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-06 航拍全景', online: true }
    ],
    scaleAnalysis: {
      totalStock: 185200,
      bySpecies: [
        { name: '大黄鱼', count: 85320, unit: '尾', percent: '46.1%', color: '#1e90ff' },
        { name: '鲈鱼', count: 56200, unit: '尾', percent: '30.3%', color: '#00e5ff' },
        { name: '石斑鱼', count: 28900, unit: '尾', percent: '15.6%', color: '#22c55e' },
        { name: '黑鲷', count: 14900, unit: '尾', percent: '8.0%', color: '#f59e0b' }
      ],
      byCage: [
        { name: '1-3号网箱', count: 64800, unit: '尾', percent: '35.0%', color: '#1e90ff' },
        { name: '4-6号网箱', count: 51800, unit: '尾', percent: '28.0%', color: '#00e5ff' },
        { name: '7-9号网箱', count: 40700, unit: '尾', percent: '22.0%', color: '#22c55e' },
        { name: '10-12号网箱', count: 27900, unit: '尾', percent: '15.0%', color: '#f59e0b' }
      ]
    },
    growth: {
      dates: ['04-01', '04-15', '04-30', '05-15', '05-20'],
      weights: [180, 265, 390, 495, 568.2],
      avgWeight: '568.2',
      dailyGain: '12.6',
      uniformity: '85.3%',
      survivalRate: '98.9%'
    },
    feeding: {
      todayTotal: 320,
      slices: [
        { name: '配合饲料', count: 180, unit: 'kg', percent: '56.3%', color: '#1e90ff' },
        { name: '鱼粉', count: 80, unit: 'kg', percent: '25.0%', color: '#22c55e' },
        { name: '虾粉', count: 40, unit: 'kg', percent: '12.5%', color: '#f59e0b' },
        { name: '其他', count: 20, unit: 'kg', percent: '6.2%', color: '#6366f1' }
      ],
      plans: [
        { time: '08:00', cage: '1号网箱', feedType: '配合饲料', amount: 40, status: '已完成' },
        { time: '10:00', cage: '1号网箱', feedType: '配合饲料', amount: 40, status: '已完成' },
        { time: '14:00', cage: '1号网箱', feedType: '配合饲料', amount: 40, status: '待执行' },
        { time: '16:00', cage: '1号网箱', feedType: '配合饲料', amount: 40, status: '待执行' }
      ]
    },
    warnings: {
      urgent: 0,
      important: 1,
      normal: 2,
      list: [
        { time: '05-20 10:20', content: '溶解氧过低', level: '重要', status: '已处理' },
        { time: '05-20 10:15', content: '1号网箱投喂机故障', level: '一般', status: '处理中' },
        { time: '05-20 09:40', content: '水温异常', level: '一般', status: '处理中' }
      ]
    },
    bottomSummary: [
      { key: 'cage', label: '养殖网箱', value: 12, unit: '个', icon: 'cage' },
      { key: 'water', label: '养殖水体', value: 120000, unit: 'm³', icon: 'water' },
      { key: 'capacity', label: '设计产能', value: 240000, unit: '尾/批', icon: 'capacity' },
      { key: 'stock', label: '当前存塘', value: 185200, unit: '尾', icon: 'stock' },
      { key: 'feed', label: '今日投喂量', value: 320, unit: 'kg', icon: 'feed' },
      { key: 'yield', label: '累计产量', value: 18520, unit: 'kg', icon: 'yield' },
      { key: 'online', label: '设备在线率', value: 98.2, unit: '%', icon: 'online' }
    ]
  },

  'farm-2': {
    id: 'farm-2',
    name: '深海 2 号养殖场',
    overview: [
      { key: 'water', label: '养殖水体', value: 160000, unit: 'm³', icon: 'water' },
      { key: 'cage', label: '养殖网箱', value: 16, unit: '个', icon: 'cage' },
      { key: 'species', label: '养殖品种', value: '金鲳鱼、石斑鱼、真鲷', unit: '', icon: 'species' },
      { key: 'area', label: '养殖面积', value: 155, unit: '公顷', icon: 'area' },
      { key: 'capacity', label: '设计产能', value: 300000, unit: '尾/批', icon: 'capacity' },
      { key: 'stock', label: '当前存塘', value: 246800, unit: '尾', icon: 'stock' }
    ],
    envMetrics: {
      underwater: [
        { key: 'temp', label: '水温', value: '19.2', unit: '℃', icon: 'temp', color: '#00e5ff' },
        { key: 'do', label: '溶解氧', value: '6.82', unit: 'mg/L', icon: 'drop', color: '#38bdf8' },
        { key: 'ph', label: 'pH', value: '7.92', unit: '', icon: 'ph', color: '#22c55e' },
        { key: 'salinity', label: '盐度', value: '30.8', unit: 'ppt', icon: 'salt', color: '#2dd4bf' },
        { key: 'nh3', label: '氨氮', value: '0.18', unit: 'mg/L', icon: 'chem', color: '#34d399' },
        { key: 'no2', label: '亚硝酸盐', value: '0.01', unit: 'mg/L', icon: 'lab', color: '#60a5fa' },
        { key: 'turbidity', label: '浊度', value: '2.8', unit: 'NTU', icon: 'wave', color: '#818cf8' },
        { key: 'chla', label: '叶绿素a', value: '11.2', unit: 'μg/L', icon: 'leaf', color: '#4ade80' }
      ],
      surface: [
        { key: 'temp', label: '气温', value: '24.8', unit: '℃', icon: 'temp', color: '#00e5ff' },
        { key: 'do', label: '气压', value: '1015', unit: 'hPa', icon: 'drop', color: '#38bdf8' },
        { key: 'ph', label: '湿度', value: '74.0', unit: '%', icon: 'ph', color: '#22c55e' },
        { key: 'salinity', label: '风速', value: '3.9', unit: 'm/s', icon: 'salt', color: '#2dd4bf' },
        { key: 'nh3', label: '风向', value: '东风', unit: '', icon: 'chem', color: '#34d399' },
        { key: 'no2', label: '降雨量', value: '0.0', unit: 'mm', icon: 'lab', color: '#60a5fa' },
        { key: 'turbidity', label: '光照度', value: '45.2', unit: 'klx', icon: 'wave', color: '#818cf8' },
        { key: 'chla', label: '浪高', value: '0.52', unit: 'm', icon: 'leaf', color: '#4ade80' }
      ]
    },
    envTrends: {
      水温: {
        key: '水温',
        label: '水温',
        unit: '℃',
        min: 10,
        max: 25,
        data: [18.1, 17.9, 18.5, 19.6, 19.4, 19.2]
      },
      溶解氧: {
        key: '溶解氧',
        label: '溶解氧',
        unit: 'mg/L',
        min: 4,
        max: 9,
        data: [6.4, 6.2, 6.6, 7.1, 6.9, 6.82]
      },
      pH: {
        key: 'pH',
        label: 'pH',
        unit: '',
        min: 7.0,
        max: 8.5,
        data: [7.82, 7.80, 7.86, 7.95, 7.91, 7.92]
      },
      盐度: {
        key: '盐度',
        label: '盐度',
        unit: 'ppt',
        min: 28,
        max: 33,
        data: [30.5, 30.6, 30.7, 30.9, 30.8, 30.8]
      }
    },
    deviceStatus: {
      onlineRate: 99.1,
      online: 218,
      offline: 1,
      warning: 1,
      total: 220
    },
    markers: [
      {
        id: 'm-cage-north',
        name: '网箱群',
        type: 'cage',
        x: 51.5,
        y: 34.2,
        status: '正常',
        detail: '2号场北区网箱群（1#~8#网箱），主养金鲳鱼。',
        metrics: [
          { label: '在养网箱', value: '8 个' },
          { label: '当前存塘', value: '132,000 尾' },
          { label: '水下水温', value: '19.2 ℃' }
        ]
      },
      {
        id: 'm-cage-south',
        name: '网箱群',
        type: 'cage',
        x: 32.2,
        y: 61.5,
        status: '正常',
        detail: '2号场南区网箱群（9#~16#网箱），主养石斑鱼与真鲷。',
        metrics: [
          { label: '在养网箱', value: '8 个' },
          { label: '当前存塘', value: '114,800 尾' },
          { label: '溶解氧', value: '6.82 mg/L' }
        ]
      },
      {
        id: 'm-cabin',
        name: '设备舱',
        type: 'cabin',
        x: 45.8,
        y: 71.2,
        status: '运行中',
        detail: '2号场中央能源控制舱。',
        metrics: [
          { label: '供电负载', value: '78.5 kW' },
          { label: '储能SOC', value: '95 %' },
          { label: '舱内温度', value: '25.8 ℃' }
        ]
      },
      {
        id: 'm-monitor',
        name: '监控中心',
        type: 'monitor',
        x: 24.8,
        y: 83.2,
        status: '正常',
        detail: '2号场海上数字孪生中控室。',
        metrics: [
          { label: '视频接入', value: '48 路' },
          { label: '网络延迟', value: '11 ms' },
          { label: '值班状态', value: '正常' }
        ]
      },
      {
        id: 'm-warehouse',
        name: '饲料仓库',
        type: 'warehouse',
        x: 35.2,
        y: 92.2,
        status: '正常',
        detail: '2号场智能恒温饲料仓。',
        metrics: [
          { label: '当前库存', value: '56.0 吨' },
          { label: '仓内湿度', value: '46 %' },
          { label: '预计可用', value: '40 天' }
        ]
      },
      {
        id: 'm-leisure',
        name: '休闲平台',
        type: 'leisure',
        x: 49.8,
        y: 94.8,
        status: '正常',
        detail: '2号场海钓与观光平台。',
        metrics: [
          { label: '安全载荷', value: '150 人' },
          { label: '当前登岛', value: '24 人' },
          { label: '救生设施', value: '完好' }
        ]
      },
      {
        id: 'm-aerator',
        name: '增氧机',
        type: 'aerator',
        x: 64.2,
        y: 94.6,
        status: '运行中',
        detail: '2号场智能变频增氧系统。',
        metrics: [
          { label: '运行台数', value: '32 / 32 台' },
          { label: '输出气压', value: '0.45 MPa' },
          { label: '实时溶氧', value: '6.82 mg/L' }
        ]
      },
      {
        id: 'm-camera',
        name: '摄像头',
        type: 'camera',
        x: 77.2,
        y: 92.0,
        status: '正常',
        detail: '2号场全域光电雷达球机。',
        metrics: [
          { label: '在线相机', value: '64 / 64 路' },
          { label: 'AI识别率', value: '97.4 %' },
          { label: '存储状态', value: '正常' }
        ]
      },
      {
        id: 'm-env',
        name: '环境平台',
        type: 'env',
        x: 89.2,
        y: 82.0,
        status: '正常',
        detail: '2号场多参数水质监测站。',
        metrics: [
          { label: '采样频率', value: '5 min/次' },
          { label: '海流流速', value: '0.41 m/s' },
          { label: '传感器状态', value: '全部在线' }
        ]
      },
      {
        id: 'm-feeder',
        name: '投喂平台',
        type: 'feeder',
        x: 91.2,
        y: 55.6,
        status: '运行中',
        detail: '2号场自动精准投喂平台。',
        metrics: [
          { label: '今日已投', value: '240 kg' },
          { label: '待投计划', value: '180 kg' },
          { label: '管道压力', value: '正常' }
        ]
      }
    ],
    videos: [
      { id: 'v1', name: '1号网箱', cover: '/assets/video-1.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-01 水下高清', online: true },
      { id: 'v2', name: '2号网箱', cover: '/assets/video-2.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-02 水下高清', online: true },
      { id: 'v3', name: '投喂平台', cover: '/assets/video-3.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-03 平台云台', online: true },
      { id: 'v4', name: '增氧机区域', cover: '/assets/video-4.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-04 海面广角', online: true },
      { id: 'v5', name: '环境浮标', cover: '/assets/video-5.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-05 浮标近景', online: true },
      { id: 'v6', name: '休闲平台', cover: '/assets/video-6.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-06 航拍全景', online: true }
    ],
    scaleAnalysis: {
      totalStock: 246800,
      bySpecies: [
        { name: '金鲳鱼', count: 118460, unit: '尾', percent: '48.0%', color: '#1e90ff' },
        { name: '石斑鱼', count: 69100, unit: '尾', percent: '28.0%', color: '#00e5ff' },
        { name: '真鲷', count: 39490, unit: '尾', percent: '16.0%', color: '#22c55e' },
        { name: '海鲈', count: 19750, unit: '尾', percent: '8.0%', color: '#f59e0b' }
      ],
      byCage: [
        { name: '1-4号网箱', count: 88850, unit: '尾', percent: '36.0%', color: '#1e90ff' },
        { name: '5-8号网箱', count: 66640, unit: '尾', percent: '27.0%', color: '#00e5ff' },
        { name: '9-12号网箱', count: 54300, unit: '尾', percent: '22.0%', color: '#22c55e' },
        { name: '13-16号网箱', count: 37010, unit: '尾', percent: '15.0%', color: '#f59e0b' }
      ]
    },
    growth: {
      dates: ['04-01', '04-15', '04-30', '05-15', '05-20'],
      weights: [210, 310, 435, 540, 612.5],
      avgWeight: '612.5',
      dailyGain: '13.8',
      uniformity: '87.6%',
      survivalRate: '99.2%'
    },
    feeding: {
      todayTotal: 420,
      slices: [
        { name: '配合饲料', count: 240, unit: 'kg', percent: '57.1%', color: '#1e90ff' },
        { name: '鱼粉', count: 105, unit: 'kg', percent: '25.0%', color: '#22c55e' },
        { name: '虾粉', count: 50, unit: 'kg', percent: '11.9%', color: '#f59e0b' },
        { name: '其他', count: 25, unit: 'kg', percent: '6.0%', color: '#6366f1' }
      ],
      plans: [
        { time: '07:30', cage: '2号网箱', feedType: '配合饲料', amount: 60, status: '已完成' },
        { time: '10:30', cage: '2号网箱', feedType: '鱼粉', amount: 50, status: '已完成' },
        { time: '14:30', cage: '3号网箱', feedType: '配合饲料', amount: 60, status: '待执行' },
        { time: '17:00', cage: '4号网箱', feedType: '配合饲料', amount: 50, status: '待执行' }
      ]
    },
    warnings: {
      urgent: 0,
      important: 0,
      normal: 1,
      list: [
        { time: '05-20 09:15', content: '3号浮标通信抖动', level: '一般', status: '已处理' },
        { time: '05-19 18:40', content: '2号网箱滤网清洗提醒', level: '一般', status: '已处理' },
        { time: '05-19 14:10', content: '盐度轻微波动', level: '一般', status: '已处理' }
      ]
    },
    bottomSummary: [
      { key: 'cage', label: '养殖网箱', value: 16, unit: '个', icon: 'cage' },
      { key: 'water', label: '养殖水体', value: 160000, unit: 'm³', icon: 'water' },
      { key: 'capacity', label: '设计产能', value: 300000, unit: '尾/批', icon: 'capacity' },
      { key: 'stock', label: '当前存塘', value: 246800, unit: '尾', icon: 'stock' },
      { key: 'feed', label: '今日投喂量', value: 420, unit: 'kg', icon: 'feed' },
      { key: 'yield', label: '累计产量', value: 24600, unit: 'kg', icon: 'yield' },
      { key: 'online', label: '设备在线率', value: 99.1, unit: '%', icon: 'online' }
    ]
  }
}

