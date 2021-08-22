import Vue from 'vue'
import App from '@/App.vue'
import VueEvents from 'vue-events'

Vue.config.productionTip = false
Vue.use(VueEvents)

import "@/assets/css/global.css"

new Vue({
  render: h => h(App),
}).$mount('#app')
