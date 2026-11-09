import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/home/index.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' }
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: PlaceholderView,
      meta: { title: '养殖监控' }
    },
    {
      path: '/environment',
      name: 'environment',
      component: PlaceholderView,
      meta: { title: '环境监测' }
    },
    {
      path: '/feeding',
      name: 'feeding',
      component: PlaceholderView,
      meta: { title: '投喂管理' }
    },
    {
      path: '/growth',
      name: 'growth',
      component: PlaceholderView,
      meta: { title: '生长分析' }
    },
    {
      path: '/device',
      name: 'device',
      component: PlaceholderView,
      meta: { title: '设备管理' }
    },
    {
      path: '/warning',
      name: 'warning',
      component: PlaceholderView,
      meta: { title: '预警中心' }
    },
    {
      path: '/report',
      name: 'report',
      component: PlaceholderView,
      meta: { title: '数据报表' }
    },
    {
      path: '/system',
      name: 'system',
      component: PlaceholderView,
      meta: { title: '系统管理' }
    }
  ]
})

export default router

