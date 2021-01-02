import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import { auth, firebase } from './plugins/firebase'

Vue.config.productionTip = false


const unsubscribe = auth.onAuthStateChanged(() => {
  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
    created () {
      auth.onAuthStateChanged((firebaseUser: firebase.User | null) => {
        if (firebaseUser && !store.getters['auth/isAuthenticated']) {
          store.dispatch('auth/autoLogin', firebaseUser)
        }
      })
    }
  }).$mount('#app');
  unsubscribe()
})