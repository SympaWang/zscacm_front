//axiosInstance.js
//导入axios
import axios from 'axios'

// 重试次数，共请求2次
axios.defaults.retry = 3
 


// 请求的间隙
axios.defaults.retryDelay = 1000
 
axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
    var config = err.config;
    // 如果配置不存在或未设置重试选项，则拒绝
    if (!config || !config.retry) return Promise.reject(err);
 
    // 设置变量以跟踪重试次数
    config.__retryCount = config.__retryCount || 0;
 
    // 判断是否超过总重试次数
    if (config.__retryCount >= config.retry) {
        // 返回错误并退出自动重试
        return Promise.reject(err);
    }
 
    // 增加重试次数
    config.__retryCount += 1;
 
    //打印当前重试次数
    console.log(config.url +' 自动重试第' + config.__retryCount + '次');
 
    // 创建新的Promise
    var backoff = new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, config.retryDelay || 1);
    });
 
    // 返回重试请求
    return backoff.then(function () {
        return axios(config);
    });
});

//使用axios下面的create([config])方法创建axios实例，其中config参数为axios最基本的配置信息。
const API = axios.create({
	baseUrl:'http://localhost:8848', //请求后端数据的基本地址，自定义
	timeout: 15000                   //请求超时设置，单位ms
})



// 请求拦截
API.interceptors.request.use(
    config => {
      config.headers['token'] = localStorage.getItem('userToken');
      
      return config
    },
    error => {
      if(error.response.data.message == "token失效，请重新登陆" || error.response.data.message == "用户未登录") {
        localStorage.removeItem('userToken');
        localStorage.removeItem('vuex');
        this.$store.commit('setLogin', 0);
        this.$store.commit('setUsername', '');
        this.$store.commit('setuid', -1);
        window.location.replace("http://localhost:5173/login");
      }
      return Promise.reject(error)
    }
  )
   
  // 响应拦截
API.interceptors.response.use(
    res => {
      return res
    },
    // 响应错误的代码写这里
    error => {
      console.log(error)
      if(error.response.data.message == "token失效，请重新登陆" || error.response.data.message == "用户未登录") {
        localStorage.removeItem('userToken');
        localStorage.removeItem('vuex');
        this.$store.commit('setLogin', 0);
        this.$store.commit('setUsername', '');
        this.$store.commit('setuid', -1);
        window.location.replace("http://localhost:5173/login");
      }
      return Promise.reject(error)
    }
  )
//导出我们建立的axios实例模块，ES6 export用法
export default API
