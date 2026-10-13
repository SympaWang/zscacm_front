import axios from 'axios'
import { ElMessage } from 'element-plus'

// 接口基址:开发与生产都走同源 /api
// 开发环境由 vite proxy 转发到后端;生产环境由 Nginx 反向代理到 127.0.0.1:8848
// 这样 HTTPS 页面不会因请求 http://...:8848 被判为混合内容而拦截
export const BASE_URL = '/api/'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 30000
})

// 请求拦截:附带 token(还原自 login 页 localStorage.setItem('userToken', token))
request.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken')
  if (token) {
    config.headers['token'] = token
  }
  return config
})

// ---- 登录态失效处理 ----
// 后端在 token 过期/会话失效时返回 401。此前后端抛异常变成 500,
// 前端无法识别,导致"某台设备 token 过期后所有请求报错、页面永久打不开"。
// 这里统一拦截 401:清除本地登录信息并跳回登录页。
const AUTH_KEYS = ['userToken', 'userUid', 'userName', 'userType', 'userLgPrivacy']
let handling401 = false

function handleUnauthorized() {
  AUTH_KEYS.forEach(k => localStorage.removeItem(k))
  if (handling401) return
  // 已经在登录页就不跳转,避免循环
  if (location.pathname.startsWith('/login')) return
  handling401 = true
  ElMessage.warning('登录已过期，请重新登录')
  setTimeout(() => {
    location.replace('/login')
  }, 800)
}

request.interceptors.response.use(
  res => res,
  err => {
    const status = err.response && err.response.status
    const data = err.response && err.response.data
    if (status === 401 || (data && data.code === 401)) {
      handleUnauthorized()
    }
    return Promise.reject(err)
  }
)

export default request
