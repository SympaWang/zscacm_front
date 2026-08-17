import { createRouter, createWebHistory } from 'vue-router'

// 路由结构还原自 dist 主包路由表(17 个路由)
const routes = [
  { path: '/', redirect: '/dashboard/index' },
  { path: '/dashboard/index', component: () => import('../views/DashboardIndex.vue'), meta: { title: '首页' } },
  { path: '/dashboard/info', component: () => import('../views/DashboardInfo.vue'), meta: { title: '平台信息' } },
  { path: '/login', component: () => import('../views/Login.vue'), meta: { title: '登录' } },
  { path: '/forgetPassword', component: () => import('../views/ForgetPassword.vue'), meta: { title: '忘记密码' } },
  { path: '/problems', component: () => import('../views/Problems.vue'), meta: { title: '题目' } },
  { path: '/solve', component: () => import('../views/Solve.vue'), meta: { title: '解题记录' } },
  { path: '/rating/user', component: () => import('../views/UserRating.vue'), meta: { title: '用户Rating' } },
  { path: '/rating/contest', component: () => import('../views/ContestRating.vue'), meta: { title: '比赛Rating' } },
  { path: '/discuss', component: () => import('../views/Discuss.vue'), meta: { title: '论坛' } },
  { path: '/discuss/detail', name: 'discussDetail', component: () => import('../views/DiscussDetail.vue'), meta: { title: '帖子详情' } },
  { path: '/feedback', component: () => import('../views/Feedback.vue'), meta: { title: '意见反馈' } },
  { path: '/center/center', component: () => import('../views/UserCenter.vue'), meta: { title: '个人中心' } },
  { path: '/center/home', component: () => import('../views/PersonalHome.vue'), meta: { title: '个人首页' } },
  { path: '/center/message', component: () => import('../views/Message.vue'), meta: { title: '消息' } },
  { path: '/center/changePassword', component: () => import('../views/ChangePassword.vue'), meta: { title: '修改密码' } },
  { path: '/manage/user', component: () => import('../views/ManageUser.vue'), meta: { title: '用户管理' } },
  { path: '/manage/discuss', component: () => import('../views/ManageDiscuss.vue'), meta: { title: '帖子管理' } },
  { path: '/about', component: () => import('../views/About.vue'), meta: { title: '关于' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
