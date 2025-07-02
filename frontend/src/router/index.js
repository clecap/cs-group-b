import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home.vue'
import { checkUserRegistered } from '@/helpers/utility'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/api-docs',
      name: 'apidocs',
      component: () => import('../views/docs/api.vue'),
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
    },
    {
      path: '/verifier/select-partner',
      name: 'VerifierSelectPartner',
      component: () => import('../views/verifier/select-partner.vue')
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.name === 'ProverUser') {

    const username = to.params.user
    const {registered} = await checkUserRegistered(username)

    if (!registered) {
      next({ name: 'ProverVerify' })
    } else {
      next()
    }
  } else {
    next()
  }
})


export default router
