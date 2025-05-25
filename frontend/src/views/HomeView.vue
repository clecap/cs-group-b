<script setup>
import BaseLayout from '../layouts/BaseLayout.vue';
</script>

<template>
  <BaseLayout>
    <template #header>
      <h1 class="text-2xl font-bold text-center">Faige-Fiat-Shamir Demo</h1>
      <h4 class="text-lg font-medium text-center mt-10">Select a role to begin</h4>
    </template>

   <template #default>
      <div class="flex flex-col items-center mt-10 space-y-6 h-100">
        <RouterLink
          to="/register"
          class="border border-black rounded-xl p-3 flex items-center  hover:bg-gray-100 transition"
        >
          <span>Register as Peggy</span>
        </RouterLink>

        <RouterLink
          to="/victor"
          class="border border-black rounded-xl p-3 flex items-center  hover:bg-gray-100 transition"
        >
          <span>Verify as Victor</span>
        </RouterLink>
      </div>
    </template>
  </BaseLayout>
</template>
