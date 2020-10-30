import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

window.onerror = (msg, url, lineNo, columnNo, error) => {
  console.log('window.error')
  console.log(msg, url, lineNo, columnNo, error)
  return true
}
console.log(window.onerror)
window.addEventListener('error', evt => {
  console.log('window addlistener error', evt)
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
