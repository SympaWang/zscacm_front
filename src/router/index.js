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
        path:'/',component:()=>import('../pages/index.vue'), children: [
            {
                path: '/', component:()=>import('../components/index.vue')
            },
            {
                path: '/problems', name: 'problems', component:()=>import('../components/problems.vue'),
                meta: {
                    keepAlive: true // 需要缓存页面
                  }
            },
            {
                path: '/login', component:()=>import('../components/login.vue')
            },

            {
                path: '/ac/cf', component:()=>import('../components/solve/cf.vue')
            },
            {
                path: '/ac/vj', component:()=>import('../components/solve/vj.vue')
            },
            {
                path: '/ac/luogu', component:()=>import('../components/solve/luogu.vue')
            },
            {
                path: '/rating/user', component:()=>import('../components/rating/userRating.vue')
            },
            {
                path: '/rating/contest', component:()=>import('../components/rating/contestRating.vue')
            },
            {
                path: '/discuss', component:()=>import('../components/discuss.vue')
            },
            {
                path: '/discuss/detail', name: 'discussDetail', component:()=>import('../components/discuss/detail.vue')
            },
            {
                path: '/clockIn', component:()=>import('../components/clockIn.vue')
            },
            {
                path: '/center/message', component:()=>import('../components/center/message.vue')
            },
            {
                path: '/center/center', component:()=>import('../components/center/center.vue')
            },
            {
                path: '/manage/user', component:()=>import('../components/manage/user.vue')
            },

        ]
    },
]

// 3.创建路由实例
const router = createRouter({
    history: createWebHistory(), //使用history模式，hash模式使用 createWebHashHistory() 方法
    routes
  })

// 4.声明,为路由提供外部引用的入口
export default router
