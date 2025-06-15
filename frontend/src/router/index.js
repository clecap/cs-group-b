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
      path: '/verifier',
      name: 'verifier',
      component: () => import('../views/verifier/index.vue'),
    },
    {
      path: '/prover/existing',
      name: 'ProverExisting',
      component: () => import('../views/prover/existing-user.vue'),
    },
    {
      path: '/prover/register',
      name: 'ProverRegister',
      component: () => import('../views/prover/register.vue')
    },
    {
      path: '/prover',
      name: 'ProverUser',
      component: () => import('../views/prover/index.vue')
    }
  ],
})

export default router
