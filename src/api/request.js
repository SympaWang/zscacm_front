import axios from 'axios'

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

export default request
