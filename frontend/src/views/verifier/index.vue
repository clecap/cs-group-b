<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';
import socket from '@/helpers/socket';
import { ref, onMounted } from 'vue';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const receivedKeysMessage = ref('Public keys t₁, t₂, t₃ = xxxx, xxxx, xxxx');


const commitment = ref('Waiting for commitment...');
const yValue = ref('Waiting for y...');
const verificationResult = ref(null);
const challengeMode = ref('auto');
const manualChallenge = ref('');


const public_keys_received = ref(false);
const commitment_received = ref(false);
const y_received = ref(false);


onMounted(() => {
  socket.on('public_keys_received', (data) => {
    receivedKeysMessage.value = 'Received public keys: ' + data.public_keys.join(', ');
    public_keys_received.value = true;
  });
  socket.on('commitment_received', (data) => {
    commitment.value = `Commitment, x: ${data.x}`;
    commitment_received.value = true;
  });
  socket.on('y_received', (data) => {
    yValue.value = `Receive y value: ${data.y}`;
    y_received.value = true;
  });
});


const sendChallenge = () => {
  if (challengeMode.value === 'manual' && manualChallenge.value) {
    socket.emit('send_challenge', { challenge: manualChallenge.value });
    manualChallenge.value = ''; // Clear input
  } else if (challengeMode.value === 'auto') {
    const autoChallenge = generateRandomChallenge(); // Implement this function
    socket.emit('send_challenge', { challenge: autoChallenge });
  }
};

// Example: Generate a random challenge
const generateRandomChallenge = () => {
  return BigInt(Math.floor(Math.random() * 1000000)).toString(); // Adjust as needed
};

</script>

<template>
  <BaseLayout>
    <template #header>
      <h1 class="text-3xl font-bold text-center">Verifier</h1>
    </template>

    <template #default>
      <div class="max-w-md mx-auto mt-8 space-y-6">
        <!-- Public Keys Section -->
        <div class="space-y-2">
          <div class="text-gray-700">Waiting for public keys.......</div>
          <div class="font-mono text-sm">
            <p>{{ receivedKeysMessage }}</p>
          </div>
        </div>

        <!-- Commitment Section -->
        <div class="space-y-2">
          <div class="text-gray-700">Waiting for commitment.......</div>
          <div class="font-mono text-sm">
            Commitment, x: xxxx
          </div>
        </div>

        <!-- Challenge Generation Section -->
        <div class="space-y-4">
          <h3 class="font-semibold">Generate challenge</h3>
          
          <!-- <div class="space-y-3">
            <label class="flex items-center space-x-2">
              <input
                type="radio"
                name="challengeMode"
                checked
                class="h-4 w-4 text-gray-900 focus:ring-gray-500"
              />
              <span>Auto-generate challenge</span>
            </label>
             -->

          <div class="space-y-3">
            <label class="flex items-center space-x-2">
              <input
                type="radio"
                v-model="challengeMode"
                value="auto"
                class="h-4 w-4 text-gray-900 focus:ring-gray-500"
              />
              <span>Auto-generate challenge</span>
            </label>
            <label class="flex items-center space-x-2">
              <input
                type="radio"
                v-model="challengeMode"
                value="manual"
                class="h-4 w-4 text-gray-900 focus:ring-gray-500"
              />
              <span>Enter challenge manually</span>
            </label>
          </div>

          <div v-if="challengeMode === 'manual'" class="flex items-center space-x-2">
            <input
              v-model="manualChallenge"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              class="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              @click="sendChallenge"
            >
              →
            </button>
          </div>



            <!-- <label class="flex items-center space-x-2">
              <input
                type="radio"
                name="challengeMode"
                class="h-4 w-4 text-gray-900 focus:ring-gray-500"
              />
              <span>Enter challenge manually</span>
            </label>
          </div> -->

          <!-- Manual Challenge Input -->
          <!-- <div class="flex items-center space-x-2">
            <input
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              class="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              @click="() => {}"
            >
              →
            </button>
          </div> -->
        </div>

        <!-- Waiting for Y -->
        <div class="space-y-2">
          <div class="text-gray-700">Waiting for y......</div>
        </div>

        <!-- Y Value Display -->
        <div class="font-mono text-sm">
          Receive y value: xxxx
        </div>

        <!-- Verification Result -->

        <!-- <div class="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold">Verification</h3>
          <div class="font-mono text-sm space-y-1">
            <div>y² mod n = xxxxxx</div>
            <div>x × t₁^c₁ × ... mod n = xxxxxx</div>
          </div>
          <div class="flex items-center space-x-2 text-green-600">
            <span class="text-xl">✓</span>
            <span class="font-semibold">Verification succeeded!</span>
          </div>
        </div> -->

        <div class="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold">Verification</h3>
          <div v-if="verificationResult" class="font-mono text-sm space-y-1">
            <div>y² mod n = {{ verificationResult.ySquaredModN }}</div>
            <div>x × t₁^c₁ × ... mod n = {{ verificationResult.productModN }}</div>
          </div>
          <div
            v-if="verificationResult"
            class="flex items-center space-x-2"
            :class="verificationResult.success ? 'text-green-600' : 'text-red-600'"
          >
            <span class="text-xl">{{ verificationResult.success ? '✓' : '✗' }}</span>
            <span class="font-semibold">
              {{ verificationResult.success ? 'Verification succeeded!' : 'Verification failed!' }}
            </span>
          </div>
        </div>



        <!-- Close Button -->
        <div class="flex justify-center mt-8">
          <button
            @click="goHome"
            class="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
      
    </template>
  </BaseLayout>
</template>
