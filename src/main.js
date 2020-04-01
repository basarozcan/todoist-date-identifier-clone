import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import VueMomentLib from "vue-moment-lib";

// Install this library
Vue.use(VueMomentLib);

new Vue({
  render: h => h(App)
}).$mount("#app");
