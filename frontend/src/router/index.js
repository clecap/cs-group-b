import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home.vue'

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
      component: () => import('../views/victor/index.vue'),
    },
    {
      path: '/peggy/existing',
      name: 'PeggyExisting',
      component: () => import('../views/peggy/existing-user.vue'),
    },
    {
      path: '/peggy/register',
      name: 'PeggyRegister',
      component: () => import('../views/peggy/register.vue')
    },
    {
      path: '/peggy',
      name: 'PeggyUser',
      component: () => import('../views/peggy/index.vue')
    }
  ],
})

export default router
