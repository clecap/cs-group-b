<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { useRouter, useRoute } from 'vue-router';
import socket from '@/helpers/socket';
import { ref, onMounted, computed } from 'vue';
import api from '@/helpers/api';
import InfoModal from '@/components/InfoModal.vue'

const router = useRouter();
const route = useRoute();

const goHome = () => {
  router.push('/');
};


// variables..in seqquence of use


// from the URL
const query = route.query
console.log(query) 
const proverName = query.proverName; 

// from the API
const pubKeys = ref([]);
const joinedPubKeysNewLines = computed(() => {
  return pubKeys.value.map((key, index) => `t${index} =\n ${key}`).join('\n\n');
});
const BlumInteger = ref(0);
const numberofKeys = ref(0);

// commitment x from the prover
const xValue = ref(0);

// challenge bits
const challengeMode = ref('auto');
const challengeError = ref('');
const manualChallenge = ref('');
const challengeBits = ref([]); 

const onlyBinary = computed(() => /^[01,]*$/.test(manualChallenge.value))
const isInvalid = computed(() =>
  manualChallenge.value.length > 0 && !onlyBinary.value
)


// response y from the prover
const yValue = ref(0);

// verification result
const verificationResult = ref(null);


// Boolean flags to track the state of the verification process

const user_info_received = ref(false);
const commitment_received = ref(false);
const challenge_sent = ref(false);
const y_received = ref(false);


// boolean values for busy states..
const loadingUserInfo = ref(false);


//error messageplaceholder
const errorMessage = ref('');





/// For the info popup modal

const BlumIntegerSubtitle = 'The Blum Integer n is:';
const PublicKeysSubtitle = 'The Provers Public Keys (tᵢ = sᵢ² mod n):';
const CommitmenSuptitle = 'The Commitment x from the prover:';
const yValueSubtitle = 'y is:';
const ySquaredModNSuptitle = 'y² mod n is:';
const productModNSuptitle = 'x × t₁^c₁ × ... mod n is:';


// proper modal
const showModal = ref(false)
const content = ref('')
const modalSubtitle = ref('')


function onShowModal(_content, _subtitle) {
  showModal.value = true;
  modalSubtitle.value = _subtitle;
  content.value = _content.toString();
}

onMounted(() => {



  handleGetUserInfo(); // Call the function to get user info on mount


  socket.on('publish_response_y', (data) => {
    yValue.value =data.response_y;
    console.log('yValue:', yValue.value);
    y_received.value = true;

    // Trigger verification after receiving y
    verification(
      yValue.value,
      xValue.value,
      pubKeys.value,
      challengeBits.value,
      BlumInteger.value
    )
    console.log('Verification result:', verificationResult.value);
  });

  socket.on('publish_commitment_x', (data) => {
    xValue.value = data.commitment_x;
    console.log('Received commitment x:', xValue.value);
    commitment_received.value = true;
  });

});


const handleGetUserInfo = async () => {
  loadingUserInfo.value = true;
  errorMessage.value = '';


  try {
    console.log('pulled user info from API');
    const response = await api.get('user/info', {
      params: {
        username: proverName
      }
    })
    console.debug('API Response:', response.data);

    if (response.data.username != proverName) {
      console.error("API error: received username not matching the send username")
      alert("API error: received username not matching the send username")
    }

    pubKeys.value = response.data.pubKeys.split(','); // Split the comma-separated string into an array

    numberofKeys.value = pubKeys.value.length; // Update the number of public keys
    console.log('Number of public keys:', numberofKeys.value); 

    BlumInteger.value = response.data.blum; // Set the Blum integer
    console.log('Blum Integer:', BlumInteger.value); 

    user_info_received.value = true; // Set the flag to true after successfully receiving user info
  }
  catch (error) {
    console.error('Failed to get the user info', error)
    errorMessage.value = 'API error - GET of user info  failed'

    /// i have no reasonable way to do any deafult values here...
  }
  finally {
    loadingUserInfo.value = false;
  }

}




const sendResult = () => {
  try {
    console.log('Sending verification result:', verificationResult);
    socket.emit('verification_result', {success: verificationResult.value.success});
  } catch (error) {
    console.error('Socket connection error:', error);
    return;
  }

};


const sendChallenge = () => {

  if (isInvalid.value) {
    return;
  }

  challengeError.value = '';
  
  if (challengeMode.value === 'manual' && manualChallenge.value) {
    challengeBits.value = manualChallenge.value.split(',').map(Number); // Store the manual challenge
  } else if (challengeMode.value === 'auto') {
    challengeBits.value = generateRandomChallenge();
  }

  const challengeSize = challengeBits.value.length;

  if (challengeSize != numberofKeys.value) {
    challengeError.value = `Number of challenge bits you entered is ${challengeSize}. \n It should be exactly ${numberofKeys.value}`
    return;
  }

  socket.emit('send_challenge', { challenge: challengeBits.value });
  console.log('Challenge sent:', challengeBits.value);
  challenge_sent.value = true;
};

const generateRandomChallenge = () => {
  console.log('Generating random challenge');
  // random sequence of 0s and 1s of the length of the number of public keys
  const length = numberofKeys.value;
  let challenge = [];
  for (let i = 0; i < length; i++) {
    challenge.push(Math.random() < 0.5 ? 0 : 1);
  }
  return challenge;
};


const verification = (y, x, t, c, n) => {
  // y: received y value
  // x: commitment x value
  // t: array of public keys (t₁, t₂, t₃, ...)
  // c: challenge bits (array of string of 0s and 1s)
  // n: Blum integer


  y =BigInt(y);
  x = BigInt(x);
  n = BigInt(n); 
  t = t.map(BigInt); // Convert each public key to a BigInt
  c = c.map(String); // Ensure challenge bits are strings


  console.log('Starting verification...');

  console.debug('Verification called with:');
  console.debug('y, Type of y:', y, typeof y);
  console.debug('x, Type of x:', x, typeof x);
  console.debug('t, Type of t:', t, Array.isArray(t) ? 'Array' : typeof t);
  console.debug('c, Type of c:', c, Array.isArray(c) ? 'Array' : typeof c);
  console.debug('n, Type of n:', n, typeof n);

  const ySquaredModN = (y * y) % n;


  let productModN = x;

  for (let i = 0; i < t.length; i++) {
    if (c[i] === '1') {
      productModN = productModN * t[i];
    }
  }
  productModN = productModN % n;   // take mod n

  const success = (ySquaredModN === productModN);

  verificationResult.value = {
    success,
    ySquaredModN,
    productModN
  };
  console.log('Verification result:', verificationResult.value);
  sendResult(); // Send the verification result via socket
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

        <div class="space-y-4">
          <span class="text-lg font-semibold">
            Verifying for <span class="text-green-600 font-bold">{{ proverName }}</span>
          </span>
        </div>
        <div class="space-y-2">
          <div v-if="user_info_received" class="font-mono text-sm">
            Using {{ numberofKeys }} public keys                 
            <button @click="onShowModal(joinedPubKeysNewLines, PublicKeysSubtitle)" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>show </i>
            </button>
            and a Blum Integer 
            <button @click="onShowModal(BlumInteger, BlumIntegerSubtitle)" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>show </i>
            </button>
          </div>
        </div>

        <!-- Commitment Section -->
        <div v-if="public_keys_received" class="space-y-2">

          <div class="space-y-4">
            <span class="text-lg font-semibold">
            Commitment from the prover
            </span>
          </div>
          <div v-if="commitment_received" class="font-mono text-sm">
            received commitment       
            <button @click="onShowModal(xValue, CommitmenSuptitle)" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>show </i>
            </button>
          </div>
          <div v-else class="text-gray-700">Waiting for commitment.......</div>
        </div>

        <!-- Challenge Generation Section -->
        <div v-if="commitment_received" class="space-y-4">
          <h3 class="font-semibold">Generate challenge</h3>
          <div class="space-y-3">
            <label class="flex items-center space-x-2">
              <input type="radio" v-model="challengeMode" value="auto"
                class="h-4 w-4 text-gray-900 focus:ring-gray-500" />
              <span>Auto-generate challenge</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" v-model="challengeMode" value="manual"
                class="h-4 w-4 text-gray-900 focus:ring-gray-500" />
              <span>Enter challenge manually</span>
            </label>
          </div>

          <div v-if="challengeMode === 'manual'" class="flex items-center space-x-2">
            <input v-model="manualChallenge" type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 0,1,1"/>
            <button class="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition" @click="sendChallenge">
              →
            </button>
            <p v-if="challengeError" class="w-full text-center text-red-600 font-semibold">
              {{ challengeError }}
            </p>
          </div>
          <p v-if="isInvalid" class="text-red-500 text-xs mt-1">
            Please use only 0 and 1
          </p>

          <div v-else class="flex justify-center">
            <button @click="sendChallenge"
              class="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium">
              Generate and Send Challenge
            </button>
          </div>

          <div v-if="challenge_sent" class="text-gray-700">
            Challenge sent!
          </div>

        </div>

        <!-- Waiting for Y -->
        <div v-if="challenge_sent" class="space-y-2">
            <span class="text-lg font-semibold">
            Response from the prover
            </span>
          <div v-if="y_received" class="font-mono text-sm">
            The prover has send the response 
            <button @click="onShowModal(yValue,yValueSubtitle)" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>show</i>
            </button>
          </div>
          <div v-else class="text-gray-700">Waiting for y......</div>
        </div>


        <!-- Verification Result -->

        <div v-if="verificationResult" class="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-semibold">Verification</h3>
          <div class="font-mono text-sm space-y-1">
            <div>y² mod n  =     
              <button @click="onShowModal(verificationResult.ySquaredModN,ySquaredModNSuptitle)" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
                <i>show number</i>
              </button>
            
            </div>
            <div>x × t₁^c₁ × ... mod n =            
              <button @click="onShowModal(verificationResult.productModN,productModNSuptitle)" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
                <i>show number</i>
              </button>
            </div>


          </div>
          <div class="flex items-center space-x-2"
            :class="verificationResult.success ? 'text-green-600' : 'text-red-600'">
            <span class="text-xl">{{ verificationResult.success ? '✓' : '✗' }}</span>
            <span class="font-semibold">
              {{ verificationResult.success ? 'Verification succeeded!' : 'Verification failed!' }}
            </span>
          </div>
        </div>



        <!-- Info text decibing what is happening.... -->
        <div class="space-y-4 p-4 bg-gray-50 rounded-lg border border-black-200">

          <div v-if="public_keys_received && (!commitment_received)" class="text-gray-700">
            <h3 class="font-semibold">Step 2/5 Waiting for commitment</h3>
            <p>With knowledge of the public keys and the Blum Integer, the next step is for the proover to send the commitment</p>
            <p>This commitment prevents the Prover from adapting the responce after we have sent our challenge bits </p>
          </div>

          <div v-else-if="commitment_received && !challenge_sent" class="text-gray-700">
            <h3 class="font-semibold">Step 3/5 Generate and send challenge</h3>
            <p>After receiving the commitment, the next step is to generate and send the challenge.</p>
            <p>The challenge is a random sequence of bits that is used by the prover to calculate the responce and for us to verify the response</p>
          </div>
          <div v-else-if="challenge_sent && !y_received" class="text-gray-700">
            <h3 class="font-semibold">Step 4/5 Waiting for y</h3>
            <p>After receiving the commitment, the next step is for the prover to send the responce y to our challenge </p>
          </div>
          <div v-else-if="verificationResult" class="text-gray-700">
            <h3 class="font-semibold">Step 5/5 Verification </h3>
            <p>The verification result is displayed above.</p>
            <p>If the verification succeeded, it means the prover has proven knowledge of the secret
              without revealing it.</p>
            <p>The verification is done by checking if the y² mod n equals the product of x t₁^c₁  ... mod n.</p>
          </div>
        </div>



        <!-- Close Button -->
        <div class="flex justify-center mt-8">
          <button @click="goHome"
            class="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium">
            Close
          </button>

        </div>

      </div>
    <!-- Modal -->
    <InfoModal :visible="showModal" @close="showModal = false" :content="content" :subtitle="modalSubtitle"/>

    </template>
  </BaseLayout>
</template>