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

        <p v-if="coprimeR" class="w-full text-center text-green-600 font-semibold">✓ Random coprime generated!</p>

        <button
          @click="computeX"
          class="w-full border-1 border-black rounded-full px-6 py-2"
        >
          Compute x
        </button>

        <p class="text-center">
          <code>x = r² mod n</code><br />
          <p class="w-full text-center text-green-600 font-semibold">{{ xDisplay }}</p>
        </p>

        <button
          @click="sendX"
          class="w-full border-1 border-black rounded-full px-6 py-2"
        >
          Send x to Verifier
        </button>

        <p class="block w-full text-center text-green-600 font-semibold">{{ statusMessage }}</p>

        <p class="text-center text-sm text-gray-600" v-if="challengeBitsLoading">
          Waiting for challenge bits
          <span class="dot">.</span>
          <span class="dot" style="animation-delay: 0.15s">.</span>
          <span class="dot" style="animation-delay: 0.3s">.</span>
          <span class="dot" style="animation-delay: 0.45s">.</span>
          <span class="dot" style="animation-delay: 0.6s">.</span>
        </p>

        <p class="text-center font-medium" v-if="challengeBits.length > 0">
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
          <p class="block w-full text-center text-green-600 font-semibold">{{ yDisplay }}</p>
        </p>

        <button
          @click="sendY"
          class="w-full bg-black text-white rounded-full px-6 py-2"
        >
          Send y →
        </button>
        <p class="block w-full text-center text-green-600 font-semibold">{{ ySendStatusText }}</p>
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

        <p class="text-center text-sm text-gray-600" v-if="challengeBitsLoading">
          Waiting for challenge bits
          <span class="dot">.</span>
          <span class="dot" style="animation-delay: 0.15s">.</span>
          <span class="dot" style="animation-delay: 0.3s">.</span>
          <span class="dot" style="animation-delay: 0.45s">.</span>
          <span class="dot" style="animation-delay: 0.6s">.</span>
        </p>
        <p class="text-center font-medium">
          Received challenge bits: {{ challengeBits }}
        </p>
        <!-- <p class="text-center text-sm text-gray-600" v-if="">
          Matches with previously set challenge bits
        </p> -->

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
import socket from '@/helpers/socket';
import BaseLayout from '@/layouts/BaseLayout.vue';
import { checkUserRegistered, generateRandomCoprime } from '@/helpers/utility'
import bigInt from 'big-integer';



const route = useRoute()
const username = ref('Username')
const useVerifiersBits = ref(false)
const coprimeR = ref(null)
const commitmentX = ref(null)
const xDisplay = ref('—')
const secrets = ref('')
const challengeBits = ref([])
const yDisplay = ref('—')
const responseY = ref('')
const blumN = ref(null)
const pubKeys = ref([])
const ySendStatusText = ref('')

// Evil Prover
const evilBits = ref('')
const forgedY = ref(null)
const forgedXDisplay = ref('—')
const challengeBitsLoading = ref(false)

socket.on('challenge_bits_received', ({challenge_bits}) => {
  if(challenge_bits) {
    challengeBits.value = challenge_bits.split('').map(Number);
    challengeBitsLoading.value = false;
  }
})


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

function computeY() {
  try {
    if( !coprimeR.value || !blumN.value || !secrets.value || challengeBits.value.length === 0) {
      return
    }
    const parsedSecrets = parseSecrets(secrets.value)

    for (let i = 0; i < parsedSecrets.length; i++) {
      coprimeR.value = coprimeR.value.multiply(parsedSecrets[i].pow(challengeBits.value[i])).mod(blumN.value)
    }

    responseY.value = coprimeR.value.toString()
    console.log('Computed y:', responseY.value);
    ySendStatusText.value = "✓ Response y has been generated!"
  } catch (err) {
    console.error('Error computing y:', err);
    ySendStatusText.value = 'Error: Invalid input.'
  }
}

function parseSecrets(str) {
  return str
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => bigInt(s))
}


const statusMessage = ref('');

// const sendPublicKeys = () => {
//   const keys = publicKeysInput.value.split(',').map(k => k.trim());
//   socket.emit('publish_public_keys', { public_keys: keys });
//   statusMessage.value = 'Public Keys Have Been Published';
// };

const sendX = () => {
  if (!commitmentX.value) {
    statusMessage.value = 'Please compute x before sending.';
    return;
  }
  socket.emit('publish_commitment_x', { commitment_x: commitmentX.value.toString() });
  statusMessage.value = '✓ Commitment has Been Published';
  challengeBitsLoading.value = true;
};

function sendY() {
  if (!responseY.value) {
    yDisplay.value = '✓ Please compute y before sending';
    return;
  }
  socket.emit('publish_response_y', { response_y: responseY.value });
  yDisplay.value = '✓ Response y has Been Published';
}
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
      const {user} = result
      blumN.value = bigInt(user.blum)
      pubKeys.value = user.pubKeys.split(',').map(k => bigInt(k.trim()))
    }
    socket.emit('publish_public_keys', { pubKeys: pubKeys.value });
  }
})

</script>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.dot {
  display: inline-block;
  animation: blink 1s step-end infinite;
}
</style>
