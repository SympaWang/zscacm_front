import axios from 'axios'

// 接口基址(还原自 dist 中硬编码的 http://175.178.237.61:8848/)
// 开发环境走 vite proxy('/api' -> 后端),避免浏览器跨域;生产构建仍直连后端
export const BASE_URL = import.meta.env.DEV ? '/api' : 'http://175.178.237.61:8848/'

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
