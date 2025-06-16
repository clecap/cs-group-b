<script setup>
import BaseLayout from '../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToProver = () => {
  router.push('/prover/verify-user');
};

const navigateToVerifier = () => {
  router.push('/verifier');
};
</script>

<template>
  <BaseLayout>
    <template #header>
      <h1 class="text-2xl font-bold text-center">Feige-Fiat-Shamir Demo</h1>
      <h4 class="text-lg font-medium text-center mt-10">Select a role to begin</h4>
    </template>

    <template #default>
      <div class="flex flex-col items-center mt-10 space-y-6">
        <!-- Prover button -->
        <button
          @click="navigateToProver"
          class="border border-black rounded-xl p-3 flex items-center hover:bg-gray-100 transition cursor-pointer w-48 justify-center"
        >
          <span>Register as Prover</span>
        </button>

        <!-- Verifier button -->
        <button
          @click="navigateToVerifier"
          class="border border-black rounded-xl p-3 flex items-center hover:bg-gray-100 transition cursor-pointer w-48 justify-center"
        >
          <span>Verify as Verifier</span>
        </button>
      </div>
    </template>
  </BaseLayout>
</template>
