// 1.引入创建路由需要的组件
import { createRouter, createWebHistory} from 'vue-router'

// 2.配置系统所有路由页面
const routes = [
    {
        path:'/dashboard/info',component:()=>import('../pages/dashboard/info.vue')
    },
    {
        path:'/dashboard/index',component:()=>import('../pages/dashboard/index.vue')
    },
    {
        path:'/index',component:()=>import('../pages/index.vue')
    },
]

// 3.创建路由实例
const router = createRouter({
    history: createWebHistory(), //使用history模式，hash模式使用 createWebHashHistory() 方法
    routes
  })

// 4.声明,为路由提供外部引用的入口
export default router
