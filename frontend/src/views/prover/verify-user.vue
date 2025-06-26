<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { checkUserRegistered } from '@/helpers/utility'

const router = useRouter();
const username = ref('');
const message = ref('');

const handleSubmit = async () => {
 if(username.value) {
  const result = await checkUserRegistered(username.value)
    if (result.registered) {
      router.push(`/prover/${username.value}`)
    } else {
      message.value = result.message
    }
 }
};

const handleRegister = () => {
  router.push('/prover/register');
};
</script>

<template>
  <BaseLayout>
    <template #header>
      <div class="relative w-full">
        <button
          @click="handleRegister"
          class="absolute top-0 right-0 text-lg underline hover:text-gray-700 transition z-10 cursor-pointer"
        >
          Register
        </button>
        <h1 class="text-3xl font-bold text-center pt-8">Are you an existing user?</h1>
      </div>
    </template>

    <template #default>
      <div class="flex flex-col items-center mt-10">
        <div class="flex items-center space-x-3">
          <div>
            <input
            v-model="username"
            type="text"
            placeholder="Enter username"
            class="px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
            @keyup.enter="handleSubmit"
          />
            <div v-if="message" class="text-red-500">{{ message }}</div>
          </div>
          
          <button
            @click="handleSubmit"
            class="p-3 border border-black rounded-full hover:bg-gray-50 transition"
            :class="{ 'self-start': message }"
          >
            →
          </button>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>
