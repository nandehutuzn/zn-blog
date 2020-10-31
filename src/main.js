import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

window.onerror = (msg, url, lineNo, columnNo, error) => {
  console.log('window.error')
  console.log(msg, url, lineNo, columnNo, error)
}

// var a = {}
// a.bb.cc = '12'
// console.log(a)

Vue.config.errorHandler = (error, vm, info) => {
  console.log('Vue.config.errorHandler')
  console.log(error, vm, info)
}
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
