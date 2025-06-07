<script setup>
import BaseLayout from '../layouts/BaseLayout.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const numberOfSecrets = ref('');
const secretsText = ref('xxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx');

const handleGetBlumInteger = () => {
  console.log('Get Blum Integer clicked');
};

const handleSecretsSubmit = () => {
  console.log('Number of secrets:', numberOfSecrets.value);
};

const copySecrets = () => {
  navigator.clipboard.writeText(secretsText.value).then(() => {
    console.log('Secrets copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};

const handleRegister = () => {
  router.push('/peggy-user');
};
</script>

<template>
  <BaseLayout>
    <template #header>
      <h1 class="text-3xl font-bold text-center">Register as Peggy</h1>
    </template>

    <template #default>
      <div class="max-w-2xl mx-auto mt-8 space-y-6">
        <!-- Username Section -->
        <div class="flex items-center space-x-4">
          <label class="font-medium">Set username:</label>
          <input
            v-model="username"
            type="text"
            class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-xs"
          />
        </div>

        <!-- Blum Integer Section -->
        <div class="flex items-center space-x-4">
          <span class="font-medium">Blum integer received from Trent, n:</span>
          <button
            @click="handleGetBlumInteger"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Get Blum Integer
          </button>
        </div>

        <!-- Choose Secrets Section -->
        <div>
          <p class="font-medium mb-4">
            Choose secrets s₁...sₖ coprime to the Blum integer n
          </p>

          <div class="flex items-center space-x-4">
            <label class="font-medium">Number of secrets:</label>
            <input
              v-model="numberOfSecrets"
              type="text"
              class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
            />
            <button
              @click="handleSecretsSubmit"
              class="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
            >
              →
            </button>
          </div>
        </div>

        <!-- Secrets Display Section -->
        <div class="space-y-2">
          <div class="font-medium">Secrets sᵢ (coprime to n):</div>
          <div class="flex items-start space-x-3">
            <textarea
              v-model="secretsText"
              readonly
              class="flex-1 px-4 py-3 border border-gray-300 rounded bg-gray-50 font-mono text-sm resize-none overflow-y-auto"
              rows="5"
            ></textarea>
            <button
              @click="copySecrets"
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Copy
            </button>
          </div>
        </div>

        <!-- Computed Public Keys Section -->
        <div class="space-y-2">
          <div class="font-medium">Computed Public Keys (tᵢ = sᵢ² mod n):</div>
          <div class="font-mono text-sm space-y-1">
            <div>t₁ = 53² mod n = xxxx</div>
            <div>t₂ = 95² mod n = xxxx</div>
            <div>t₃ = 77² mod n = xxxx</div>
          </div>
        </div>

        <!-- Register Button -->
        <div class="flex justify-center mt-8">
          <button
            @click="handleRegister"
            class="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium"
          >
            Register
          </button>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>
