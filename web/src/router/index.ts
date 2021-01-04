import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Load from '../views/Load.vue'
import Curate from '../views/Curate.vue'
import Tweets from '../views/Tweets.vue'
import Schedule from '../views/Schedule.vue'
import store from '@/store'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'CurateBot' }
  },
  {
    path: '/load',
    name: 'Load',
    component: Load,
    meta: {
      title: 'CurateBot Load Tweets',
      requiresAuth: true,
    }
  },
  {
    path: '/curate',
    name: 'Curate',
    component: Curate,
    meta: {
      title: 'CurateBot Curate Tweets',
      requiresAuth: true,
    }
  },
  {
    path: '/tweets',
    name: 'Tweets',
    component: Tweets,
    meta: {
      title: 'CurateBot Queued Tweets',
      requiresAuth: true,
    }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule,
    meta: {
      title: 'CurateBot Schedule Tweets',
      requiresAuth: true,
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


// navigation guard, deal with setting title also
router.beforeEach((to, from, next) => {
  document.title = to.meta.title

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !store.getters['auth/isAuthenticated']) {
    store.commit('alert/showError', 'Please log in');
    next('/');
  } else {
    next();
  }
})


export default router
