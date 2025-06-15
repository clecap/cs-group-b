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
      path: '/prover/verify-user',
      name: 'ProverVerify',
      component: () => import('../views/prover/verify-user.vue'),
    },
    {
      path: '/prover/register',
      name: 'ProverRegister',
      component: () => import('../views/prover/register.vue')
    },
    {
      path: '/prover/:user',
      name: 'ProverUser',
      component: () => import('../views/prover/user.vue')
    }
  ],
})

export default router
