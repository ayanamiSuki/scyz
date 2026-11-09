# 水产养殖数字孪生驾驶舱 - 开发与架构参考手册

## 1. 项目简介

本项目是基于 **Vue 3 + TypeScript + Vite + Tailwind CSS + Element Plus + ECharts** 构建的“水产养殖数字孪生驾驶舱”可视化大屏项目。
针对现场 **100 寸 `3840 × 2160` (4K)** 大屏展示环境，采用标准 `1920 × 1080` 画布开发并通过 CSS `transform: scale()` 整体等比缩放（4K 屏幕下恰好为 `2x` 整数倍放大），兼顾开发调试效率与大屏渲染清晰度。

---

## 2. 环境与启动命令

- **Node.js**：推荐 `>= 20.x`（当前环境 `v24.14.1`）
- **包管理器**：`pnpm`（已在 `pnpm-workspace.yaml` 中配置 `allowBuilds.esbuild: true`）

```bash
# 1. 安装依赖
pnpm install

# 2. 启动本地开发服务器 (默认 http://localhost:5173/)
pnpm dev

# 3. 类型检查与生产环境打包 (输出至 dist/)
pnpm build

# 4. 预览生产包
pnpm preview
```

---

## 3. 目录结构说明

```text
j:\private\水产\demo
├── doc/
│   ├── 说明.md                   # 原始需求说明
│   └── image.png                 # 原始设计原型图
├── public/
│   └── assets/                   # 静态媒体资源
│       ├── sea-main-clean.jpg    # 去除了静态标签重影的中心海景全景底图
│       ├── sea-main.mp4          # 中心海景 1 秒循环测试视频素材 (H.264)
│       ├── test-feed.mp4         # 底部监控窗口复用的 1 秒测试视频流 (H.264)
│       └── video-1~6.jpg         # 6 路实时监控窗口封面图
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── index.css         # Tailwind 入口 + 驾驶舱公共面板/胶囊按钮/呼吸动画样式
│   │       └── element-dark.css  # Element Plus 深海蓝暗黑主题覆盖样式（表格、下拉框、搜索框）
│   ├── components/               # 全局复用公共组件
│   │   ├── ScaleBox.vue          # 1920x1080 -> 3840x2160 等比缩放自适应容器
│   │   ├── PanelCard.vue         # 驾驶舱通用模块外壳卡片（标题装饰、右上角插槽/箭头）
│   │   ├── BaseChart.vue         # ECharts 通用封装（高分屏 DPR 渲染、自动 resize、按需刷新）
│   │   ├── TechIcon.vue          # 矢量科技图标组件（水体、网箱、品种、产能、存塘、投喂等）
│   │   └── TopHeader.vue         # 顶部大屏主标题与 9 大路由导航栏
│   ├── mock/
│   │   └── dashboardData.ts      # 强类型假数据配置（包含深海1号/2号养殖场完整联动数据）
│   ├── router/
│   │   └── index.ts              # 路由定义（首页完整实现，其余 8 个导航指向空占位页）
│   ├── views/
│   │   ├── home/                 # 首页驾驶舱业务子模块
│   │   │   ├── index.vue         # 首页三列（左-中-右）+ 底部汇总栏主布局
│   │   │   ├── LeftOverview.vue  # 左上：园区总览（6 项核心指标）
│   │   │   ├── LeftEnvMonitor.vue# 左中：环境监测（水下/水上切换 + 8 项指标 + 趋势折线图）
│   │   │   ├── LeftDevice.vue    # 左下：设备状态（在线率环形图 + 状态统计）
│   │   │   ├── CenterStage.vue   # 中上：深海养殖场主视图（全景视频切换 + 10 个呼吸灯交互点位）
│   │   │   ├── CenterVideos.vue  # 中下：实时视频（6 路监控缩略图与 1 秒视频流切换播放）
│   │   │   ├── RightScale.vue    # 右上：养殖规模分析（按品种/按网箱切换 + 环形图）
│   │   │   ├── RightGrowth.vue   # 右中1：生长分析（平均体重面积图 + 4 项生长指标）
│   │   │   ├── RightFeeding.vue  # 右中2：投喂管理（今日投喂环形图 + Element Plus 投喂计划表）
│   │   │   ├── RightWarning.vue  # 右下：预警概览（三级告警统计卡 + Element Plus 预警列表表）
│   │   │   └── BottomSummary.vue # 底部：7 项全局关键指标卡片横栏
│   │   └── PlaceholderView.vue   # 其余 8 个导航菜单的预留空页面
│   ├── App.vue                   # 根组件（维护当前选中的园区 ID 并向下分发）
│   └── main.ts                   # 应用入口
├── package.json
├── pnpm-workspace.yaml
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. 核心设计模式与复用参考

### 4.1 4K 大屏等比缩放与图表防模糊方案
1. **画布容器 (`ScaleBox.vue`)**：
   - 内部固定 `1920px × 1080px`，所有子模块可直接使用直观的像素（如 `w-[330px]`、`h-[224px]`）布局，无需换算复杂的 `vw/vh` 或 `rem`。
   - 当投屏到 `3840 × 2160` (4K) 电视/大屏时，`scaleX` 与 `scaleY` 自动计算为 `2`，满屏无黑边。
2. **ECharts 高清渲染 (`BaseChart.vue`)**：
   - 初始化 ECharts 时显式传入 `devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2)`，使 Canvas 底层按至少 2 倍物理像素光栅化，解决普通 `scale(2)` 放大后 Canvas 边缘发虚的问题。

### 4.2 公共面板卡片 (`PanelCard.vue`)
新增任何业务卡片时，直接包裹 `<PanelCard>` 即可获得统一的深海科技风边框与标题栏：

```vue
<PanelCard title="模块标题" custom-class="h-[220px]" @more="handleMore">
  <!-- 右上角需要放胶囊切换按钮时使用 #extra 插槽，不传则默认显示 > 箭头 -->
  <template #extra>
    <div class="cockpit-switch-group">
      <span class="cockpit-switch-btn is-active">选项A</span>
      <span class="cockpit-switch-btn">选项B</span>
    </div>
  </template>

  <!-- 卡片主体内容 -->
  <div>...</div>
</PanelCard>
```

### 4.3 Element Plus 暗色表格复用 (`cockpit-table`)
项目中所有表格直接使用 `<el-table class="cockpit-table">`，已在 `src/assets/styles/element-dark.css` 中统一覆写了透明背景、亮青色表头、紧凑行高与悬浮高亮效果。

---

## 5. 后续业务扩展指南

1. **接入真实后端 API**：
   - 所有数据结构接口均已定义在 `src/mock/dashboardData.ts`（如 `FarmDashboardData`、`OverviewItem`、`StageMarker` 等）。
   - 对接真实接口时，只需在 `src/views/home/index.vue` 中将读取 `DASHBOARD_DATA_MAP[props.farmId]` 替换为 `axios / fetch` 异步请求，各子组件的 `props` 类型完全兼容，无需改动 UI 组件。
2. **接入真实监控视频流（RTSP / HLS / WebRTC / FLV）**：
   - 中心全景视频位于 `src/views/home/CenterStage.vue` 的 `<video>` 标签。
   - 底部 6 路监控位于 `src/views/home/CenterVideos.vue`，修改 `dashboardData.ts` 中 `videos` 数组的 `videoUrl`（或集成 `hls.js` / `mpegts.js`）即可平滑替换为真实摄像头流。
3. **开发其余 8 个子路由页面**：
   - 在 `src/views/` 下新建对应目录（如 `src/views/monitor/index.vue`），并在 `src/router/index.ts` 中将 `PlaceholderView` 替换为新组件即可，顶部导航栏与外层 4K 缩放容器会自动保持共用。

