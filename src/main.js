import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './utils/axios'
import axios from './utils/axios'
import store from './store'; // 引入我们前面导出的store对象
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 2.装载路由
app.use(router)

app.use(ElementPlus)

app.use(store)

app.mount('#app')

app.config.globalProperties.$axios=axios;  //配置axios的全局引用


for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

app.config.silent = true