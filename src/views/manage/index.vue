<template>
  <div class="h-full flex flex-col bg-[#020b18] text-[#d8f0ff] overflow-hidden select-text">
    <!-- 顶部状态栏与操作栏 -->
    <header class="h-[60px] px-6 bg-[#06152b] border-b border-[#00e5ff]/20 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-[#00e5ff]/15 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
          <el-icon :size="18"><Setting /></el-icon>
        </div>
        <div>
          <h2 class="text-base font-bold text-white tracking-wide m-0">养殖数字化看板 · 数据配置中心</h2>
          <p class="text-[11px] text-[#7da8d6] m-0">直接读取与修改 mock/dashboardData.json，保存后大屏数据实时同步</p>
        </div>
      </div>

      <!-- 后端连接状态指示与操作按钮 -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1 rounded text-xs border"
          :class="backendConnected ? 'bg-[#22c55e]/10 border-[#22c55e]/40 text-[#4ade80]' : 'bg-[#eab308]/10 border-[#eab308]/40 text-[#facc15]'">
          <span class="w-2 h-2 rounded-full animate-pulse" :class="backendConnected ? 'bg-[#22c55e]' : 'bg-[#eab308]'"></span>
          <span>{{ backendConnected ? '后端服务已就绪 (端口 3001)' : '未连接 Node 后端 (请执行 npm run server)' }}</span>
        </div>

        <el-button size="small" :icon="Refresh" @click="fetchData" :loading="loading">
          重新加载
        </el-button>
        <el-button type="primary" size="small" :icon="Check" @click="saveData" :loading="saving">
          保存全部配置
        </el-button>
        <router-link to="/">
          <el-button type="info" size="small" :icon="House" plain>
            返回大屏首页
          </el-button>
        </router-link>
      </div>
    </header>

    <!-- 中间主体表单区域 -->
    <main class="flex-1 min-h-0 p-6 overflow-y-auto">
      <div class="max-w-6xl mx-auto cockpit-panel p-6">
        <el-tabs v-model="activeTab" class="manage-tabs">
          <!-- 1. 基础概况 (Overview) -->
          <el-tab-pane label="1. 基础概况指标" name="overview">
            <div class="py-2">
              <div class="text-xs text-[#8ab4dc] mb-4">
                对应大屏左上方「核心养殖概况」6 大指标卡片，修改后即时呈现在主看板。
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="currentFarm.overview">
                <div
                  v-for="(item, index) in currentFarm.overview"
                  :key="item.key || index"
                  class="p-4 rounded bg-[#091e3a]/70 border border-[#00a8ff]/20 flex flex-col gap-2"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-[#00e5ff] font-semibold">{{ item.label }}</span>
                    <span class="text-[10px] text-[#7da8d6]">标识: {{ item.key }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-input v-model="item.value" placeholder="数值" size="default" />
                    <el-input v-model="item.unit" placeholder="单位" class="!w-24 shrink-0" size="default" />
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 2. 基地简介 (Base Intro) -->
          <el-tab-pane label="2. 基地简介与亮点" name="intro">
            <div class="py-2" v-if="currentFarm.baseIntro">
              <div class="text-xs text-[#8ab4dc] mb-4">
                对应大屏右侧「基地概况」面板，展示园区介绍与核心规模亮点。
              </div>

              <el-form label-position="top" class="max-w-3xl">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <el-form-item label="基地名称">
                    <el-input v-model="currentFarm.baseIntro.title" placeholder="例如：重安对虾养殖示范基地" />
                  </el-form-item>
                  <el-form-item label="地理位置">
                    <el-input v-model="currentFarm.baseIntro.location" placeholder="例如：贵州省黄平县重安镇" />
                  </el-form-item>
                </div>

                <el-form-item label="特色标签 (英文逗号分隔)">
                  <el-input
                    :model-value="tagsText"
                    @update:model-value="(val: string) => updateTags(val)"
                    placeholder="例如：黄平县重点项目, 工厂化循环水, 全年多批次"
                  />
                </el-form-item>

                <el-form-item label="基地详细介绍">
                  <el-input
                    v-model="currentFarm.baseIntro.description"
                    type="textarea"
                    :rows="4"
                    placeholder="基地企业愿景、工艺特色与发展目标"
                  />
                </el-form-item>

                <el-divider content-position="left">核心亮点数据 (3 项)</el-divider>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    v-for="(hl, idx) in currentFarm.baseIntro.highlights"
                    :key="idx"
                    class="p-3 rounded bg-[#091e3a]/70 border border-[#00a8ff]/20 flex flex-col gap-2"
                  >
                    <el-input v-model="hl.label" placeholder="亮点标签" size="small" />
                    <el-input v-model="hl.value" placeholder="数值及单位" size="small" />
                  </div>
                </div>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 3. 环境指标 (Env Metrics) -->
          <el-tab-pane label="3. 环境水质与气象" name="env">
            <div class="py-2" v-if="currentFarm.envMetrics">
              <el-divider content-position="left">水下 9 大在线理化指标</el-divider>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div
                  v-for="(item, idx) in currentFarm.envMetrics.underwater"
                  :key="item.key || idx"
                  class="p-3 rounded bg-[#091e3a]/70 border border-[#00a8ff]/20"
                >
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs text-[#00e5ff] font-semibold">{{ item.label }}</span>
                    <span class="text-[11px] text-[#7da8d6]">{{ item.unit || '无单位' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-input v-model="item.value" placeholder="指标值 (如: 8.1~8.4)" size="small" />
                    <el-input v-model="item.unit" placeholder="单位" class="!w-20 shrink-0" size="small" />
                  </div>
                </div>
              </div>

              <el-divider content-position="left">水上气象实时指标</el-divider>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  v-for="(item, idx) in currentFarm.envMetrics.surface"
                  :key="item.key || idx"
                  class="p-3 rounded bg-[#091e3a]/70 border border-[#00a8ff]/20"
                >
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs text-[#38bdf8] font-semibold">{{ item.label }}</span>
                    <span class="text-[11px] text-[#7da8d6]">{{ item.unit || '无单位' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-input v-model="item.value" placeholder="数值" size="small" />
                    <el-input v-model="item.unit" placeholder="单位" class="!w-20 shrink-0" size="small" />
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 4. 投喂与生长 (Feeding & Growth) -->
          <el-tab-pane label="4. 投喂与生长" name="feeding">
            <div class="py-2">
              <div v-if="currentFarm.feeding" class="mb-6">
                <el-divider content-position="left">投喂总体状态</el-divider>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <el-form-item label="投喂阶段说明">
                    <el-input v-model="currentFarm.feeding.stageTitle" placeholder="阶段说明" />
                  </el-form-item>
                  <el-form-item label="今日投喂总量">
                    <el-input-number v-model="currentFarm.feeding.todayTotal" :min="0" class="!w-full" />
                  </el-form-item>
                  <el-form-item label="计量单位">
                    <el-input v-model="currentFarm.feeding.unit" placeholder="单位 (如 g 或 kg)" />
                  </el-form-item>
                </div>

                <div class="flex items-center justify-between mb-2">
                  <div class="text-xs text-[#00e5ff] font-semibold">投喂计划时间表明细</div>
                  <el-button type="primary" size="small" :icon="Plus" @click="addFeedingPlan">
                    新增计划行
                  </el-button>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr class="bg-[#0e274c] text-[#8ab4dc]">
                        <th class="p-2 border border-[#00a8ff]/20 w-24">时间点</th>
                        <th class="p-2 border border-[#00a8ff]/20">基础配合料</th>
                        <th class="p-2 border border-[#00a8ff]/20">动保添加剂</th>
                        <th class="p-2 border border-[#00a8ff]/20 w-32">计划量 (g)</th>
                        <th class="p-2 border border-[#00a8ff]/20 w-28">状态</th>
                        <th class="p-2 border border-[#00a8ff]/20 w-20 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(plan, pIdx) in currentFarm.feeding.plans" :key="pIdx" class="hover:bg-[#0f305c]/50">
                        <td class="p-1 border border-[#00a8ff]/20"><el-input v-model="plan.time" size="small" /></td>
                        <td class="p-1 border border-[#00a8ff]/20"><el-input v-model="plan.baseFeed" size="small" /></td>
                        <td class="p-1 border border-[#00a8ff]/20"><el-input v-model="plan.supplement" size="small" /></td>
                        <td class="p-1 border border-[#00a8ff]/20"><el-input-number v-model="plan.amount" size="small" class="!w-full" /></td>
                        <td class="p-1 border border-[#00a8ff]/20">
                          <el-select v-model="plan.status" size="small">
                            <el-option label="已完成" value="已完成" />
                            <el-option label="待执行" value="待执行" />
                          </el-select>
                        </td>
                        <td class="p-1 border border-[#00a8ff]/20 text-center">
                          <el-button
                            type="danger"
                            size="small"
                            :icon="Delete"
                            circle
                            plain
                            @click="removeFeedingPlan(pIdx)"
                            title="删除此计划"
                          />
                        </td>
                      </tr>
                      <tr v-if="!currentFarm.feeding.plans || currentFarm.feeding.plans.length === 0">
                        <td colspan="6" class="p-4 text-center text-gray-400">暂无计划，可点击上方「新增计划行」添加</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="currentFarm.growth">
                <el-divider content-position="left">生长核心参数</el-divider>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <el-form-item label="当前天数">
                    <el-input v-model="currentFarm.growth.currentDay" />
                  </el-form-item>
                  <el-form-item label="当前规格">
                    <el-input v-model="currentFarm.growth.currentSpec" />
                  </el-form-item>
                  <el-form-item label="整齐度">
                    <el-input v-model="currentFarm.growth.uniformity" />
                  </el-form-item>
                  <el-form-item label="成活率">
                    <el-input v-model="currentFarm.growth.survivalRate" />
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 5. 预警中心配置 (Warnings) -->
          <el-tab-pane label="5. 预警中心配置" name="warnings">
            <div class="py-2" v-if="currentFarm.warnings">
              <div class="text-xs text-[#8ab4dc] mb-4">
                对应大屏右下方「预警动态」模块，展示各级别告警数及最近预警事件列表。
              </div>

              <el-divider content-position="left">预警统计数值</el-divider>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="p-4 rounded bg-[#3b1219]/40 border border-[#f43f5e]/30 flex flex-col gap-1">
                  <span class="text-xs text-[#fb7185] font-semibold">紧急预警数 (urgent)</span>
                  <el-input-number v-model="currentFarm.warnings.urgent" :min="0" class="!w-full mt-1" />
                </div>
                <div class="p-4 rounded bg-[#3b2a12]/40 border border-[#f59e0b]/30 flex flex-col gap-1">
                  <span class="text-xs text-[#fcd34d] font-semibold">重要预警数 (important)</span>
                  <el-input-number v-model="currentFarm.warnings.important" :min="0" class="!w-full mt-1" />
                </div>
                <div class="p-4 rounded bg-[#12283b]/40 border border-[#0ea5e9]/30 flex flex-col gap-1">
                  <span class="text-xs text-[#7dd3fc] font-semibold">一般预警数 (normal)</span>
                  <el-input-number v-model="currentFarm.warnings.normal" :min="0" class="!w-full mt-1" />
                </div>
              </div>

              <div class="flex items-center justify-between mb-2">
                <div class="text-xs text-[#00e5ff] font-semibold">预警记录清单</div>
                <el-button type="primary" size="small" :icon="Plus" @click="addWarningRecord">
                  新增预警行
                </el-button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr class="bg-[#0e274c] text-[#8ab4dc]">
                      <th class="p-2 border border-[#00a8ff]/20 w-36">发生时间</th>
                      <th class="p-2 border border-[#00a8ff]/20">预警内容</th>
                      <th class="p-2 border border-[#00a8ff]/20 w-28">告警等级</th>
                      <th class="p-2 border border-[#00a8ff]/20 w-28">处理状态</th>
                      <th class="p-2 border border-[#00a8ff]/20 w-20 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, wIdx) in currentFarm.warnings.list" :key="wIdx" class="hover:bg-[#0f305c]/50">
                      <td class="p-1 border border-[#00a8ff]/20"><el-input v-model="item.time" size="small" placeholder="如 11-12 14:00" /></td>
                      <td class="p-1 border border-[#00a8ff]/20"><el-input v-model="item.content" size="small" placeholder="预警描述信息" /></td>
                      <td class="p-1 border border-[#00a8ff]/20">
                        <el-select v-model="item.level" size="small">
                          <el-option label="紧急" value="紧急" />
                          <el-option label="重要" value="重要" />
                          <el-option label="一般" value="一般" />
                        </el-select>
                      </td>
                      <td class="p-1 border border-[#00a8ff]/20">
                        <el-select v-model="item.status" size="small">
                          <el-option label="已处理" value="已处理" />
                          <el-option label="处理中" value="处理中" />
                        </el-select>
                      </td>
                      <td class="p-1 border border-[#00a8ff]/20 text-center">
                        <el-button
                          type="danger"
                          size="small"
                          :icon="Delete"
                          circle
                          plain
                          @click="removeWarningRecord(wIdx)"
                          title="删除此记录"
                        />
                      </td>
                    </tr>
                    <tr v-if="!currentFarm.warnings.list || currentFarm.warnings.list.length === 0">
                      <td colspan="5" class="p-4 text-center text-gray-400">暂无预警记录，可点击上方「新增预警行」添加</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </el-tab-pane>

          <!-- 6. 全量 JSON 极速编辑 -->
          <el-tab-pane label="6. 全量原始 JSON 编辑" name="raw">
            <div class="py-2">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs text-[#8ab4dc]">
                  支持直接编辑包括 3D标记 (markers)、视频流 (videos)、环境趋势 (envTrends) 在内的全部底层数据。
                </span>
                <el-button size="small" @click="syncRawFromJson">从表单同步到 JSON</el-button>
              </div>
              <el-input
                v-model="rawJsonText"
                type="textarea"
                :rows="18"
                class="font-mono text-xs"
                placeholder="全量 JSON 数据..."
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Refresh, Check, House, Plus, Delete } from '@element-plus/icons-vue'
import defaultDataMap from '../../../public/dashboardData.json'

const activeTab = ref('overview')
const loading = ref(false)
const saving = ref(false)
const backendConnected = ref(false)

// 响应式数据源
const allData = reactive<Record<string, any>>({ ...defaultDataMap })
const currentFarmId = ref('farm-1')
const rawJsonText = ref('')

const currentFarm = computed(() => {
  if (!allData[currentFarmId.value]) {
    allData[currentFarmId.value] = { overview: [], envMetrics: {}, feeding: {}, baseIntro: {}, growth: {}, warnings: {} }
  }
  return allData[currentFarmId.value]
})

const tagsText = computed(() => {
  return (currentFarm.value?.baseIntro?.tags || []).join(', ')
})

function updateTags(val: string) {
  if (!currentFarm.value.baseIntro) return
  currentFarm.value.baseIntro.tags = val.split(',').map(s => s.trim()).filter(Boolean)
}

function syncRawFromJson() {
  rawJsonText.value = JSON.stringify(allData, null, 2)
}

// 投喂时间表增删行
function addFeedingPlan() {
  if (!currentFarm.value.feeding) {
    currentFarm.value.feeding = { stageTitle: '', todayTotal: 0, unit: 'g', slices: [], plans: [] }
  }
  if (!currentFarm.value.feeding.plans) {
    currentFarm.value.feeding.plans = []
  }
  currentFarm.value.feeding.plans.push({
    time: '12:00',
    baseFeed: '1号100g+2号250g+3号50g',
    supplement: '多维20g',
    amount: 400,
    status: '待执行'
  })
}

function removeFeedingPlan(index: number) {
  currentFarm.value.feeding?.plans?.splice(index, 1)
}

// 预警记录增删行
function addWarningRecord() {
  if (!currentFarm.value.warnings) {
    currentFarm.value.warnings = { urgent: 0, important: 0, normal: 0, list: [] }
  }
  if (!currentFarm.value.warnings.list) {
    currentFarm.value.warnings.list = []
  }
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${month}-${date} ${hours}:${minutes}`

  currentFarm.value.warnings.list.unshift({
    time: timeStr,
    content: '新增预警事件提醒',
    level: '一般',
    status: '处理中'
  })
}

function removeWarningRecord(index: number) {
  currentFarm.value.warnings?.list?.splice(index, 1)
}

// 从后端获取最新数据
async function fetchData() {
  loading.value = true
  try {
    const res = await fetch('/api/dashboard')
    if (res.ok) {
      const data = await res.json()
      Object.assign(allData, data)
      backendConnected.value = true
      syncRawFromJson()
      ElMessage.success('成功从后端获取最新数据')
    } else {
      backendConnected.value = false
      ElMessage.warning('未能连接到后端接口，使用本地静态数据')
    }
  } catch (err: any) {
    backendConnected.value = false
    console.warn('后端连接失败:', err.message)
    ElMessage.info('未检测到运行中的后端服务 (可运行 npm run server 启动)')
    syncRawFromJson()
  } finally {
    loading.value = false
  }
}

// 保存修改到后端
async function saveData() {
  saving.value = true
  try {
    // 如果在 raw 标签页编辑过，优先解析 rawJson
    if (activeTab.value === 'raw' && rawJsonText.value.trim()) {
      try {
        const parsed = JSON.parse(rawJsonText.value)
        Object.assign(allData, parsed)
      } catch (e: any) {
        ElMessage.error('JSON 语法错误，请检查后再保存: ' + e.message)
        saving.value = false
        return
      }
    }

    const res = await fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(allData, null, 2)
    })

    if (res.ok) {
      backendConnected.value = true
      syncRawFromJson()
      ElMessage.success('配置已成功保存并持久化到本地文件！')
    } else {
      const errRes = await res.json().catch(() => ({}))
      ElMessage.error('保存失败: ' + (errRes.message || res.statusText))
    }
  } catch (err: any) {
    ElMessage.error('网络请求失败，请确认后端已运行: ' + err.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  syncRawFromJson()
  fetchData()
})
</script>

<style scoped>
:deep(.manage-tabs .el-tabs__item) {
  color: #8ab4dc;
  font-size: 13px;
}
:deep(.manage-tabs .el-tabs__item.is-active) {
  color: #00e5ff;
  font-weight: 600;
}
:deep(.manage-tabs .el-tabs__nav-wrap::after) {
  background-color: rgba(0, 168, 255, 0.2);
}
:deep(.el-form-item__label) {
  color: #8ab4dc !important;
  font-size: 12px;
}
:deep(.el-divider__text) {
  background-color: #051a36 !important;
  color: #00e5ff;
  font-weight: bold;
  font-size: 12px;
}
</style>
