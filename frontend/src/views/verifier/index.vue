<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';
import socket from '@/helpers/socket';
import { ref, onMounted } from 'vue';

const router = useRouter();

const goHome = () => {
  router.push('/');
};


// placeholders..
const receivedKeysMessage = ref('Public keys t₁, t₂, t₃ = xxxx, xxxx, xxxx');


const commitment = ref('Waiting for commitment...');
const yValue = ref('Waiting for y...');
const verificationResult = ref(null);
const challengeMode = ref('auto');
const manualChallenge = ref('');


const public_keys_received = ref(false);
const commitment_received = ref(false);
const challenge_sent = ref(false);
const y_received = ref(false);



// This value is set whent he public keys are received.....
// ALSO used for challenge!!!!!

const numberofKeys = ref(0); // Placeholder for number of public keys


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
  challenge_sent.value = true;
};

// Example: Generate a random challenge
const generateRandomChallenge = () => {
 // random sequence of 0s and 1s of the length of the number of public keys
  const length = numberofKeys.value; 
  let challenge = '';
  for (let i = 0; i < length; i++) {
    challenge += Math.random() < 0.5 ? '0' : '1';
  }
  return challenge;


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


          <div v-if="public_keys_received" class="text-gray-700"> received n public keys</div>
          <div v-else class="text-gray-700">Waiting for public keys.......</div>

          <!-- <div class="font-mono text-sm">
            <p>{{ receivedKeysMessage }}</p>
          </div> -->
        </div>

        <!-- Commitment Section -->
        <div v-if="public_keys_received" class="space-y-2">

          <div v-if="commitment_received" class="font-mono text-sm">
            Commitment, x: xxxx
          </div>
          <div v-else class="text-gray-700">Waiting for commitment.......</div>
        </div>

        <!-- Challenge Generation Section -->
        <div v-if="commitment_received" class="space-y-4">
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

          <div v-else class="flex justify-center">
            <button
              @click="sendChallenge"
              class="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium"
            >
              Generate and Send Challenge 
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
          <div v-if="challenge_sent" class="text-gray-700">
            Challenge sent!
          </div>

        </div>

        <!-- Waiting for Y -->
        <div v-if="challenge_sent" class="space-y-2">
          <div v-if="y_received" class="font-mono text-sm">
            Receive y value: xxxx
          </div>
          <div v-else class="text-gray-700">Waiting for y......</div>
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

        <div v-if="verificationResult" class="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold">Verification</h3>
          <div  class="font-mono text-sm space-y-1">
            <div>y² mod n = {{ verificationResult.ySquaredModN }}</div>
            <div>x × t₁^c₁ × ... mod n = {{ verificationResult.productModN }}</div>
          </div>
          <div
            class="flex items-center space-x-2"
            :class="verificationResult.success ? 'text-green-600' : 'text-red-600'"
          >
            <span class="text-xl">{{ verificationResult.success ? '✓' : '✗' }}</span>
            <span class="font-semibold">
              {{ verificationResult.success ? 'Verification succeeded!' : 'Verification failed!' }}
            </span>
          </div>
        </div>



      <!-- Info text decibing what is happening.... -->
      <div class="space-y-4 p-4 bg-gray-50 rounded-lg border border-black-200"> 
        
        <!-- <div>
          <h3 class="font-semibold">Info</h3>
          <p class="text-gray-700">
            This is the verifier view. It waits for the public keys, commitment, and y value from the prover.
            After receiving these, it generates a challenge and sends it to the prover.
            Finally, it verifies the response based on the received values.
          </p>
        </div>     -->
        <div v-if ="public_keys_received&&(!commitment_received)" class="text-gray-700">
          <h3 class="font-semibold">Step 2/6 Waiting for commitment</h3>
          <p>After receiving the public keys the next step is for the proover to send the Commitment</p>
          <p class="text-gray-500">Commitment is a value that is used to prove that the prover has the knowledge of the secret without revealing it.</p>
          <p class="text-gray-500">Following that we will send the challenge bits</p>
        </div>

        <div v-else-if="commitment_received && !challenge_sent" class="text-gray-700">
          <h3 class="font-semibold">Step 3/6 Generate and send challenge</h3>
          <p>After receiving the commitment, the next step is to generate and send the challenge.</p>
          <p class="text-gray-500">The challenge is a random sequence of bits that is used to verify the response from the prover.</p>
        </div>
        <div v-else-if="challenge_sent && !y_received" class="text-gray-700">
          <h3 class="font-semibold">Step 4/6 Waiting for y</h3>
          <p>After receiving the commitment, the next step is for the prover to send the y value.</p>
          <p class="text-gray-500">The y value is used to verify the response from the prover.</p>
        </div>
        <div v-else-if="y_received && !verificationResult" class="text-gray-700">
          <h3 class="font-semibold">Step 5/6 Waiting for verification</h3>
          <p>After receiving the y value, the next step is to verify the response from the prover.</p>
          <p class="text-gray-500">The verification is done by
          checking if the y² mod n equals the product of x and t₁^c₁ × ... mod n.</p>   
        </div>
        <div v-else-if="verificationResult" class="text-gray-700">
          <h3 class="font-semibold">Step 6/6 Verification Result</h3>
          <p>The verification result is displayed above.</p>
          <p class="text-gray-500">If the verification succeeded, it means the prover has the knowledge of the secret without revealing it.</p>
        </div>
       <div v-else class="text-gray-700">
          <h3 class="font-semibold">Step 1/6 Waiting for public keys</h3>
          <p>Waiting for the public keys from the prover.</p>
          <p class="text-gray-500">The public keys are used to verify the response from the prover.</p>
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

        <div class="flex justify-center mt-8">
          <h1 class="text-3xl font-bold text-center">DEBUG</h1>
        </div>
        <div class="flex justify-center mt-8 space-x-2">
          <button
            @click="public_keys_received = true"
            class="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition font-medium"
          >
            Receive pub key 
          </button>
          <button
            @click="commitment_received = true"
            class="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition font-medium"
          >
            Receive commitment
          </button>
          <button
            @click="y_received = true"
            class="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition font-medium"
          >
            Receive y
          </button>
          <button
            @click="verificationResult = { success: true, ySquaredModN: '...', productModN: '...' }"
            class="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition font-medium"
          >
            Verification Result
          </button>
        </div>
      </div>
      
    </template>
  </BaseLayout>
</template>
