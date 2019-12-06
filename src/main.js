import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//  导入字体图标
import './assets/fonts/iconfont.css'
//  导入全局样式表
import './assets/css/global.css'
// 导入树形表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import axios from 'axios'
// 导入富文本样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入进度条js和样式
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Loading } from 'element-ui'

//  配置请求的根路径
axios.defaults.baseURL = 'https://renoblog.xyz/api/private/v1/'

//  request请求拦截器
axios.interceptors.request.use(config => {
  // 发送请求时，展示进度条
  NProgress.start()
  startLoading()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// response拦截
axios.interceptors.response.use(config => {
  endLoading()
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
Vue.prototype.apiURL = 'https://renoblog.xyz/'

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dataFormat', function (originVal) {
  const date = new Date(originVal)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDay() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

let loading
//  使用Element loading-start 方法
function startLoading () {
  loading = Loading.service({
    lock: true,
    text: '拼命加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}
//  使用Element loading-close 方法
function endLoading () {
  loading.close()
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
