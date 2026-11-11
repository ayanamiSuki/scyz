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
  { path: '/system', name: '系统管理', icon: 'system' }
]

export const DASHBOARD_DATA_MAP: Record<string, FarmDashboardData> = {
  'farm-1': {
    id: 'farm-1',
    name: '重安对虾养殖示范基地',
    overview: [
      { key: 'water', label: '养殖总水体', value: 9600, unit: 'm³', icon: 'water' },
      { key: 'cage', label: '养殖池', value: 258, unit: '个', icon: 'cage' },
      { key: 'species', label: '养殖品种', value: '南美白对虾', unit: '', icon: 'species' },
      { key: 'area', label: '养殖面积', value: 12000, unit: 'm²', icon: 'area' },
      { key: 'capacity', label: '设计产能', value: 500000, unit: '斤/年', icon: 'capacity' },
      { key: 'stock', label: '当前批次', value: 28000, unit: '斤/批', icon: 'stock' }
    ],
    envMetrics: {
      underwater: [
        { key: 'temp', label: '水温', value: '28~30', unit: '℃', icon: 'temp', color: '#00e5ff' },
        { key: 'do', label: '溶解氧', value: '8.1~8.8', unit: 'mg/L', icon: 'drop', color: '#38bdf8' },
        { key: 'ph', label: 'PH', value: '8.1~8.4', unit: '', icon: 'ph', color: '#22c55e' },
        { key: 'salinity', label: '盐度', value: '10~12', unit: '‰', icon: 'salt', color: '#2dd4bf' },
        { key: 'nh3', label: '氨氮', value: '0~0.5', unit: 'mg/L', icon: 'chem', color: '#34d399' },
        { key: 'no2', label: '亚硝酸盐', value: '0.001~0.1', unit: 'mg/L', icon: 'lab', color: '#60a5fa' },
        { key: 'ca', label: '钙硬度', value: '180~240', unit: 'mg/L', icon: 'wave', color: '#818cf8' },
        { key: 'mg', label: '镁浓度', value: '550~750', unit: 'mg/L', icon: 'leaf', color: '#4ade80' },
        { key: 'k', label: '钾浓度', value: '180~240', unit: 'mg/L', icon: 'chem', color: '#fbbf24' }
      ],
      surface: [
        { key: 'air_temp', label: '实时气温', value: '22.5', unit: '℃', icon: 'temp', color: '#00e5ff' },
        { key: 'weather_desc', label: '天气状况', value: '多云', unit: '', icon: 'wave', color: '#fbbf24' },
        { key: 'humidity', label: '相对湿度', value: '78', unit: '%', icon: 'ph', color: '#22c55e' },
        { key: 'pressure', label: '大气压强', value: '918.5', unit: 'hPa', icon: 'drop', color: '#38bdf8' },
        { key: 'wind_speed', label: '实时风速', value: '2.1', unit: 'm/s', icon: 'salt', color: '#2dd4bf' },
        { key: 'wind_dir', label: '主导风向', value: '东南风', unit: '', icon: 'chem', color: '#34d399' },
        { key: 'precip', label: '小时降水', value: '0.0', unit: 'mm', icon: 'lab', color: '#60a5fa' },
        { key: 'solar', label: '短波辐射', value: '320', unit: 'W/m²', icon: 'leaf', color: '#4ade80' },
        { key: 'station', label: '气象站点', value: '黄平·重安镇', unit: '', icon: 'wave', color: '#818cf8' }
      ]
    },
    envTrends: {
      水温: {
        key: '水温',
        label: '水温',
        unit: '℃',
        min: 26,
        max: 32,
        data: [28.4, 28.2, 28.6, 29.3, 29.1, 28.9]
      },
      溶解氧: {
        key: '溶解氧',
        label: '溶解氧',
        unit: 'mg/L',
        min: 7.5,
        max: 9.5,
        data: [8.3, 8.1, 8.4, 8.7, 8.6, 8.5]
      },
      pH: {
        key: 'pH',
        label: 'PH',
        unit: '',
        min: 7.8,
        max: 8.6,
        data: [8.15, 8.12, 8.22, 8.35, 8.28, 8.25]
      },
      盐度: {
        key: '盐度',
        label: '盐度',
        unit: '‰',
        min: 8,
        max: 14,
        data: [10.8, 10.9, 11.0, 11.2, 11.1, 11.0]
      }
    },
    deviceStatus: {
      onlineRate: 65,
      online: 65,
      offline: 2,
      warning: 0,
      total: 100
    },
    markers: [
      {
        id: 'm-shrimp-main',
        name: '养虾池',
        type: 'cage',
        x: 52,
        y: 36,
        status: '运行中',
        detail: '主区大跨度保温循环水养虾池群，集成水质在线监测、精准自动投喂与底部微孔纳米曝气系统。',
        metrics: [
          { label: '在养虾池', value: '204 个' },
          { label: '池水均温', value: '28.9 ℃' },
          { label: '溶解氧', value: '8.5 mg/L' }
        ]
      },
      {
        id: 'm-shrimp-front',
        name: '养虾池',
        type: 'cage',
        x: 34,
        y: 66,
        status: '运行中',
        detail: '前区高标准钢筋混凝土方形养虾池矩阵，配备独立中央底排污、恒温水循环与高密度轮养系统。',
        metrics: [
          { label: '在养虾池', value: '54 个' },
          { label: '当前阶段', value: 'PL12标粗' },
          { label: '水体盐度', value: '11.0 ‰' }
        ]
      },
      {
        id: 'm-equipment-room',
        name: '设备房',
        type: 'warehouse',
        x: 16,
        y: 62,
        status: '运行中',
        detail: '基地综合动力与物资保障中心，内设原料仓库、恒温增温设备间、高压罗茨增氧设备间及标准饲料仓库。',
        metrics: [
          { label: '增温/增氧', value: '全负荷运行' },
          { label: '原料仓库', value: '库存充足' },
          { label: '饲料仓库', value: '恒温除湿' }
        ]
      },
      {
        id: 'm-management-bldg',
        name: '管理用房',
        type: 'monitor',
        x: 72,
        y: 58,
        status: '正常',
        detail: '双层现代化综合管理大楼，集成全厂数字孪生监控中心、水质与病害检测实验中心及员工生活中心。',
        metrics: [
          { label: '监控中心', value: '36路在线' },
          { label: '实验中心', value: '每日3检' },
          { label: '生活中心', value: '正常保障' }
        ]
      },
      {
        id: 'm-leisure-deck',
        name: '休闲平台',
        type: 'leisure',
        x: 72,
        y: 78,
        status: '正常',
        detail: '管理用房前庭生态景观休闲平台，配置现代遮阳廊架、户外休憩区与绿化花箱，兼顾日常休憩与访客接待。',
        metrics: [
          { label: '功能定位', value: '休憩/接待' },
          { label: '景观照明', value: '已开启' },
          { label: '环境指数', value: '优' }
        ]
      }
    ],
    videos: [
      { id: 'v1', name: '1号保温车间', cover: '/assets/video-1.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-01 车间内景', online: true },
      { id: 'v2', name: '2号标粗虾池', cover: '/assets/video-2.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-02 水下微距', online: true },
      { id: 'v3', name: '精准拌料投喂区', cover: '/assets/video-3.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-03 投喂监控', online: true },
      { id: 'v4', name: '循环水微滤机房', cover: '/assets/video-4.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-04 水处理区', online: true },
      { id: 'v5', name: '前区方形水泥池', cover: '/assets/video-5.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-05 室外池群', online: true },
      { id: 'v6', name: '基地航拍全景', cover: '/assets/video-6.jpg', videoUrl: '/assets/test-feed.mp4', channel: 'CH-06 高空鸟瞰', online: true }
    ],
    baseIntro: {
      title: '重安对虾养殖示范基地',
      location: '贵州省黄平县重安镇',
      tags: ['黄平县重点项目', '工厂化循环水', '全年多批次连续生产'],
      description:
        `  裕宸水产是黄平县重安镇党委镇府大力关心支持的一家以构建生态养殖全产业链为目标，主攻工厂化循环水高密度健康养殖，业务覆盖技术迭代优化、水产动保方案、供应链配套、生鲜终端销售及生态农业等板块，打造集产供销一体化的现代化工厂化循环水产养殖全产业链。
     自公司成立以来，秉承以“以安全为基、以健康为本，供优质水产”为宗旨，充分发挥 “不选地、不选水” 的差异化技术优势迅速扩大。`,
      highlights: [
        { label: '独立养殖池', value: '258 个' },
        { label: '总水体规模', value: '9600 m³' },
        { label: '规划年产能', value: '50万斤' }
      ]
    },
    growth: {
      subtitle: '南美白对虾（PL10/PL12放苗 · 适宜水温24–28℃ · 无EHP）',
      currentDay: '第13天',
      currentSpec: '≈5000 头/斤',
      uniformity: '85%',
      survivalRate: '86%',
      stages: [
        {
          dayLabel: '0天',
          weight: 0.003,
          headCount: '≈166000头/斤',
          lengthRange: '0.7–0.8cm',
          stageDesc: 'PL12仔虾，刚入塘'
        },
        {
          dayLabel: '15天',
          weight: 0.1,
          headCount: '≈5000头/斤',
          lengthRange: '2.5–3cm',
          stageDesc: '标粗后期，转底关键期'
        },
        {
          dayLabel: '30天',
          weight: 1.0,
          headCount: '≈500头/斤',
          lengthRange: '3.5–4cm',
          stageDesc: '幼虾期，日增重最快'
        },
        {
          dayLabel: '45天',
          weight: 3.0,
          headCount: '≈160头/斤',
          lengthRange: '6–6.5cm',
          stageDesc: '中小虾，肝脏压力上升'
        },
        {
          dayLabel: '60天',
          weight: 7.5,
          headCount: '≈67头/斤',
          lengthRange: '8–9cm',
          stageDesc: '中虾，开始出现白便风险'
        },
        {
          dayLabel: '75天',
          weight: 12.0,
          headCount: '≈40头/斤',
          lengthRange: '9–12cm',
          stageDesc: '接近商品规格'
        },
        {
          dayLabel: '95天',
          weight: 20.0,
          headCount: '≈26头/斤',
          lengthRange: '14–18cm',
          stageDesc: '商品大虾出塘规格'
        }
      ]
    },
    feeding: {
      stageTitle: '虾苗喂料 · 11月10日第13天',
      todayTotal: 2580,
      unit: 'g',
      slices: [
        { name: '2号料', count: 1500, unit: 'g', percent: '58.1%', color: '#1e90ff' },
        { name: '1号料', count: 600, unit: 'g', percent: '23.3%', color: '#00e5ff' },
        { name: '3号料', count: 300, unit: 'g', percent: '11.6%', color: '#22c55e' },
        { name: '保健添加', count: 180, unit: 'g', percent: '7.0%', color: '#f59e0b' }
      ],
      plans: [
        {
          time: '02:00',
          baseFeed: '1号100g+2号250g+3号50g',
          supplement: '速补20g、诱食促长酶10g',
          amount: 430,
          status: '已完成'
        },
        {
          time: '06:00',
          baseFeed: '1号100g+2号250g+3号50g',
          supplement: '黄芪多糖10g、多维20g、拜激灵10g',
          amount: 440,
          status: '已完成'
        },
        {
          time: '10:00',
          baseFeed: '1号100g+2号250g+3号50g',
          supplement: '诱食促长酶10g、速补20g',
          amount: 430,
          status: '已完成'
        },
        {
          time: '14:00',
          baseFeed: '1号100g+2号250g+3号50g',
          supplement: '肝肠肽5g、多维20g、拜激灵10g',
          amount: 435,
          status: '已完成'
        },
        {
          time: '18:00',
          baseFeed: '1号100g+2号250g+3号50g',
          supplement: '大蒜素10g、速补20g',
          amount: 430,
          status: '待执行'
        },
        {
          time: '22:00',
          baseFeed: '1号100g+2号250g+3号50g',
          supplement: '肝肠孢清5g、拜激灵10g',
          amount: 415,
          status: '待执行'
        }
      ]
    },
    warnings: {
      urgent: 0,
      important: 0,
      normal: 3,
      list: [
        { time: '11-10 14:20', content: 'A区标粗池第13天转底期巡检提醒', level: '一般', status: '已处理' },
        { time: '11-10 11:05', content: '2号循环水微滤机自动反冲洗完成', level: '一般', status: '已处理' },
        { time: '11-10 08:30', content: 'B区虾池镁离子浓度补充例行提醒', level: '一般', status: '已处理' }
      ]
    }
  }
}
