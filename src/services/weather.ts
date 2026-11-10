import { ref } from 'vue'
import type { EnvMetricItem } from '@/mock/dashboardData'

export interface RealtimeWeatherState {
  locationName: string
  temp: string
  weatherText: string
  humidity: string
  pressure: string
  windSpeed: string
  windDir: string
  precipitation: string
  radiation: string
  updatedAt: string
  surfaceMetrics: EnvMetricItem[]
}

// 贵州省黔东南州黄平县重安镇经纬度
const CHONGAN_LAT = 26.90
const CHONGAN_LON = 107.78

// WMO Weather interpretation codes 映射中文天气描述
function mapWeatherCode(code: number): string {
  if (code === 0) return '晴'
  if (code === 1 || code === 2) return '多云'
  if (code === 3) return '阴'
  if (code >= 45 && code <= 48) return '雾'
  if (code >= 51 && code <= 57) return '细雨'
  if (code >= 61 && code <= 67) return '小到中雨'
  if (code >= 71 && code <= 77) return '小雪'
  if (code >= 80 && code <= 82) return '阵雨'
  if (code >= 95) return '雷阵雨'
  return '多云'
}

// 角度转8方位风向
function mapWindDirection(deg: number): string {
  const dirs = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
  const idx = Math.round(((deg % 360) + 360) % 360 / 45) % 8
  return dirs[idx]
}

function buildSurfaceMetrics(data: {
  temp: string
  weatherText: string
  pressure: string
  humidity: string
  windSpeed: string
  windDir: string
  precipitation: string
  radiation: string
}): EnvMetricItem[] {
  return [
    { key: 'air_temp', label: '实时气温', value: data.temp, unit: '℃', icon: 'temp', color: '#00e5ff' },
    { key: 'weather_desc', label: '天气状况', value: data.weatherText, unit: '', icon: 'wave', color: '#fbbf24' },
    { key: 'humidity', label: '相对湿度', value: data.humidity, unit: '%', icon: 'ph', color: '#22c55e' },
    { key: 'pressure', label: '大气压强', value: data.pressure, unit: 'hPa', icon: 'drop', color: '#38bdf8' },
    { key: 'wind_speed', label: '实时风速', value: data.windSpeed, unit: 'm/s', icon: 'salt', color: '#2dd4bf' },
    { key: 'wind_dir', label: '主导风向', value: data.windDir, unit: '', icon: 'chem', color: '#34d399' },
    { key: 'precip', label: '小时降水', value: data.precipitation, unit: 'mm', icon: 'lab', color: '#60a5fa' },
    { key: 'solar', label: '短波辐射', value: data.radiation, unit: 'W/m²', icon: 'leaf', color: '#4ade80' },
    { key: 'station', label: '气象站点', value: '黄平·重安镇', unit: '', icon: 'wave', color: '#818cf8' }
  ]
}

const defaultBase = {
  temp: '22.5',
  weatherText: '多云',
  humidity: '78',
  pressure: '918.5',
  windSpeed: '2.1',
  windDir: '东南风',
  precipitation: '0.0',
  radiation: '320'
}

const weatherState = ref<RealtimeWeatherState>({
  locationName: '黄平·重安',
  ...defaultBase,
  updatedAt: '实时同步',
  surfaceMetrics: buildSurfaceMetrics(defaultBase)
})

let fetchedOnce = false
let refreshTimer: number | null = null

export async function fetchChonganWeather(): Promise<void> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${CHONGAN_LAT}&longitude=${CHONGAN_LON}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,shortwave_radiation` +
      `&wind_speed_unit=ms&timezone=Asia%2FShanghai`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const cur = json?.current
    if (!cur) return

    const temp = typeof cur.temperature_2m === 'number' ? cur.temperature_2m.toFixed(1) : defaultBase.temp
    const humidity = typeof cur.relative_humidity_2m === 'number' ? String(Math.round(cur.relative_humidity_2m)) : defaultBase.humidity
    const pressure = typeof cur.surface_pressure === 'number' ? cur.surface_pressure.toFixed(1) : defaultBase.pressure
    const windSpeed = typeof cur.wind_speed_10m === 'number' ? cur.wind_speed_10m.toFixed(1) : defaultBase.windSpeed
    const windDir = typeof cur.wind_direction_10m === 'number' ? mapWindDirection(cur.wind_direction_10m) : defaultBase.windDir
    const precipitation = typeof cur.precipitation === 'number' ? cur.precipitation.toFixed(1) : defaultBase.precipitation
    const radiation = typeof cur.shortwave_radiation === 'number' ? String(Math.round(cur.shortwave_radiation)) : defaultBase.radiation
    const weatherText = typeof cur.weather_code === 'number' ? mapWeatherCode(cur.weather_code) : defaultBase.weatherText

    const nextBase = {
      temp,
      weatherText,
      humidity,
      pressure,
      windSpeed,
      windDir,
      precipitation,
      radiation
    }

    weatherState.value = {
      locationName: '黄平·重安',
      ...nextBase,
      updatedAt: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      surfaceMetrics: buildSurfaceMetrics(nextBase)
    }
  } catch {
    // 离线或受限环境下保持黄平县重安镇默认气象数据
  }
}

export function useWeather() {
  if (!fetchedOnce && typeof window !== 'undefined') {
    fetchedOnce = true
    fetchChonganWeather()
    // 每 10 分钟自动刷新一次天气数据
    refreshTimer = window.setInterval(fetchChonganWeather, 10 * 60 * 1000)
  }

  return {
    weatherState,
    refreshWeather: fetchChonganWeather,
    stopWeatherTimer: () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }
  }
}

