<!-- ProverPage.vue -->
<template>
  <BaseLayout>
    <!-- header slot -->
    <template #header>
      <h1 class="text-3xl font-bold text-center mb-6">Prover</h1>
    </template>

    <!-- main content -->
    <div class="w-full space-y-8">
      <!-- Current user -->
      <p class="font-medium">
        Current user:
        <span class="font-bold">{{ username }}</span>
      </p>

      <!-- Toggle -->
      <div class="flex items-center">
        <span :class="!useVerifiersBits ? 'text-black font-medium' : 'text-gray-600'">Predict challenge bits</span>
        <button
          @click="useVerifiersBits = !useVerifiersBits"
          class="mx-4 relative w-14 h-8 flex items-center rounded-full transition-colors duration-200 focus:outline-none"
          :class="useVerifiersBits ? 'bg-black' : 'bg-gray-300'"
        >
          <span
            class="block w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200"
            :class="useVerifiersBits ? 'translate-x-7' : 'translate-x-1'"
          ></span>
        </button>
        <span :class="useVerifiersBits ? 'text-black font-medium' : 'text-gray-600'">Use Verifier’s challenge bits</span>
      </div>

      <!-- Good Prover -->
      <div v-if="!useVerifiersBits" class="space-y-6">
        <div class="flex items-center">
          <span class="flex-1">Random coprime of blum integer n, r:</span>
          
          <button
            @click="generateR"
            class="border-1 border-black rounded-full px-6 py-2"
          >
            Generate
          </button>
        </div>

        <span v-if="coprimeR" class="block w-full text-center text-green-600 font-semibold">✓ Random coprime generated!</span>

        <button
          @click="computeX"
          class="w-full border-1 border-black rounded-full px-6 py-2"
        >
          Compute x
        </button>

        <p class="text-center">
          <code>x = r² mod n</code><br />
          <span class="block w-full text-center text-green-600 font-semibold">{{ xDisplay }}</span>
        </p>

        <button
          @click="sendX"
          class="w-full border-1 border-black rounded-full px-6 py-2"
        >
          Send x to Verifier
        </button>

        <p class="text-center text-sm text-gray-600">
          Waiting for challenge bits……
        </p>
        <p class="text-center font-medium">
          Received challenge bits: {{ challengeBits }}
        </p>

        <div>
          <label class="block mb-1">Secrets, s<sub>j</sub></label>
          <textarea
            v-model="secrets"
            rows="4"
            class="w-full border-1 border-black rounded p-2 resize-none"
          ></textarea>
        </div>

        <button
          @click="computeY"
          class="w-full border-1 border-black rounded-full px-6 py-2"
        >
          Compute response, y
        </button>

        <p class="text-center">
          <code
            >y = r × s₁ᶜ¹ × s₂ᶜ² × … × s<sub>k</sub>ᶜᵏ mod n</code
          ><br />
          <span class="block w-full text-center text-green-600 font-semibold">{{ yDisplay }}</span>
        </p>

        <button
          @click="sendY"
          class="w-full bg-black text-white rounded-full px-6 py-2"
        >
          Send y →
        </button>
      </div>

      <!-- Evil Prover -->
      <div v-else class="space-y-6">
        <div class="flex items-center">
          <span class="flex-1">Set challenge bits, c:</span>
          <input
            v-model="evilBits"
            type="text"
            placeholder="e.g. 0 1 1"
            class="border-1 border-black rounded-full px-4 py-2 w-70"
          />
        </div>

        <div class="flex items-center">
          <span class="flex-1">Forged y:</span>
          <button
            @click="generateForgedY"
            class="border-1 border-black rounded-full px-6 py-2"
          >
            Generate random y
          </button>
        </div>

        <button
          @click="computeForgedX"
          class="w-full border-1 border-black rounded-full px-6 py-2"
        >
          Compute forged x
        </button>

        <p class="text-center">
          <code
            >x = y² × (t₁ᶜ¹ × t₂ᶜ² × … × t<sub>k</sub>ᶜᵏ)⁻¹ mod n</code
          ><br />
          <span class="font-bold">{{ forgedXDisplay }}</span>
        </p>

        <button
          @click="sendForgedX"
          class="w-full border-1 border-black rounded-full px-6 py-2"
        >
          Send x to Verifier
        </button>

        <p class="text-center text-sm text-gray-600" v-if="challengeBitsloadingText">
          {{ challengeBitsloadingText }}
          <!-- Waiting for challenge bits…… -->
        </p>
        <p class="text-center font-medium">
          Received challenge bits: {{ challengeBits }}
        </p>
        <p class="text-center text-sm text-gray-600">
          Matches with previously set challenge bits
        </p>

        <button
          @click="sendY"
          class="w-full bg-black text-white rounded-full px-6 py-2"
        >
          Send y →
        </button>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted  } from 'vue';
import { useRoute } from 'vue-router'
//import socket from '@/helpers/socket';
import BaseLayout from '@/layouts/BaseLayout.vue';
import { checkUserRegistered, generateRandomCoprime } from '@/helpers/utility'
import bigInt from 'big-integer';



// const publicKeysInput = ref('');
// const statusMessage = ref('');


// const sendPublicKeys = () => {
//   const keys = publicKeysInput.value.split(',').map(k => k.trim());
//   socket.emit('publish_public_keys', { public_keys: keys });
//   statusMessage.value = 'Public Keys Have Been Published';
// };

const route = useRoute()
const username = ref('Username')
const useVerifiersBits = ref(false)
const coprimeR = ref(null)
const commitmentX = ref(null)
const xDisplay = ref('—')
const secrets = ref('')
const challengeBits = ref([1,0,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,1,0,0,1,0,1,0,0,1,1,0]) // Example challenge bits
const yDisplay = ref('—')
const responseY = ref('')
const blumN = ref(null)
const challengeBitsloadingText = ref('')

// Evil Prover
const evilBits = ref('')
const forgedY = ref(null)
const forgedXDisplay = ref('—')


function generateR() {
  if(blumN.value) {
      coprimeR.value = generateRandomCoprime(blumN.value);
      console.log('Generated r:', coprimeR.value.toString());
    }
}
function computeX() {
  if (coprimeR.value && blumN.value) {
    commitmentX.value = coprimeR.value.square().mod(blumN.value);
    console.log('Computed x:', commitmentX.value.toString());
    xDisplay.value = "✓ Commitment x has been generated!"
  }
}
function sendX() {}

function computeY() {
  try {
    const parsedSecrets = parseSecrets(secrets.value)

    console.log(challengeBits.value[0])
    for (let i = 0; i < parsedSecrets.length; i++) {
      coprimeR.value = coprimeR.value.multiply(parsedSecrets[i].pow(challengeBits.value[i])).mod(blumN.value)
    }

    responseY.value = coprimeR.value.toString()
    console.log('Computed y:', responseY.value);
    yDisplay.value = "✓ Response y has been generated!"
  } catch (err) {
    console.error('Error computing y:', err);
    yDisplay.value = 'Error: Invalid input.'
  }
}

function parseSecrets(str) {
  return str
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => bigInt(s))
}

function sendY() {}
function generateForgedY() {  }
function computeForgedX() {  }
function sendForgedX() {}


onMounted(async () => {
  const userparam = route.params.user
  if(userparam) {
      username.value = userparam;
  }
 if(username.value) {
  const result = await checkUserRegistered(username.value)
    if (result.registered) {
      blumN.value = bigInt(result.user.blum)

    }
  }
})

</script>
