import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/ayu-dark.css'
import 'codemirror/mode/xml/xml.js'

Vue.use(ElementUI)
Vue.use(VueCodemirror, 'codemirror')
Vue.prototype.$process_state = (obj,message,res) => {
  if (res.status === 0) {
    obj.$notify({
      title: '成功',
      message: message,
      duration: 6000,
      type: 'success',
      iconClass: 'el-icon-check'
    });
  } else {
    obj.$notify({
      title: '失败',
      message: res.info || '失败，请重试',
      duration: 6000,
      type: 'error',
      iconClass: 'el-icon-error'
    });
  }
}

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
