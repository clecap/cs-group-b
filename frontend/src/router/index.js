import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/victor',
      name: 'victor',
      component: () => import('../views/VictorView.vue'),
    },
    {
      path: '/peggy-existing',
      name: 'PeggyExisting',
      component: () => import('../views/PeggyView_ExistingUser.vue'),
    },
    {
      path: '/peggy-register',
      name: 'PeggyRegister',
      component: () => import('../views/PeggyView_RegisterAsPeggy.vue')
    },
    {
      path: '/peggy-user',
      name: 'PeggyUser',
      component: () => import('../views/PeggyView_User.vue')
    }
  ],
})

export default router
