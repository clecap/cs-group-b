<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { useRouter, useRoute } from 'vue-router';
import socket from '@/helpers/socket';
import { ref, onMounted, computed } from 'vue';
import api from '@/helpers/api';


const router = useRouter();
const route = useRoute();
import demo_values from '@/helpers/demo_values.json';

const goHome = () => {
  router.push('/');
};


// placeholders..
const receivedKeysMessage = ref('Public keys t₁, t₂, t₃ = xxxx, xxxx, xxxx');
const receivedCommitmentXMessage = ref('Commitment, x: xxxx');




const yValue = ref('Waiting for y...');
const xValue = ref('');
const pubKeys = ref([]);
const joinedPubKeys = computed(() => pubKeys.value.join(', '));

const BlumInteger = ref('');
const numberofKeys = ref(0); 
const challenge_bit_str = ref('');
const challengeBits = ref([]); 

const verificationResult = ref(null);
const challengeMode = ref('auto');
const challengeError = ref('');
const manualChallenge = ref('');


// Boolean flags to track the state of the verification process

const user_info_received = ref(false);

const public_keys_received = ref(false);

const commitment_received = ref(false);
const challenge_sent = ref(false);
const y_received = ref(false);


// boolean values for busy states..
const loadingUserInfo = ref(false);


//error messageplaceholder
const errorMessage = ref('');

const query = route.query
console.log(query) // e.g., { search: 'vue', page: '2' }
const proverName = query.proverName || 'Fallback_Prover'; // Get the username from the query params or use a fallback


// getParams = () => {
// //get the username from the query params
// const query = router.currentRoute.value.query;
// if (query && query.proverName) {
//   prooverName.value = query.proverName; // Set the username from the query parameter
// } else {
//   prooverName.value = 'Fallback_Prover'; // Default value if not provided
// }
// };



/// For the info popup modal

const showPublicKeysInfo = ref(false);
const showCommitmentInfo = ref(false);
const showYInfo = ref(false);
const showySquaredModNInfo = ref(false);
const showProductModNInfo = ref(false);



const button_y_received = () => {
  // Simulate receiving y value

  y_received.value = true;
  yValue.value = demo_values.y;


  console.log('Simulated y value:', yValue.value);
  console.log('Commitment x value:', xValue.value);
  console.log('Public keys:', pubKeys.value);
  console.log('Challenge bits:', challengeBits.value);

  // Trigger verification after receiving y
  verification(
    yValue.value,
    xValue.value,
    pubKeys.value,
    challengeBits.value,
    BlumInteger.value
  )
  console.log('Verification result:', verificationResult.value);
};


const button_x_Received = () => {
  // Simulate receiving commitment x value
  commitment_received.value = true;
  xValue.value = demo_values.x; // Example value
  receivedCommitmentXMessage.value = 'Received commitment x: ' + xValue.value;

  console.log('Simulated commitment x value:', xValue.value);
};


const button_view_verifcation = () => {
  console.log('showing verifcation results');
  // this is jsut a stub for now...
};
const button_acknowledge_public_keys = () => {
  // this is just a stub for now...
  console.log('Simulated public keys:', pubKeys.value);
};

onMounted(() => {



  handleGetUserInfo(); // Call the function to get user info on mount


  socket.on('publish_response_y', (data) => {

    console.log('Received response y:', data.response_y);
    
    yValue.value =data.response_y;
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
    receivedCommitmentXMessage.value = 'Received commitment x: ' + data.commitment_x;
    xValue.value = data.commitment_x;
    commitment_received.value = true;
  });

});


const handleGetUserInfo = async () => {
  loadingUserInfo.value = true;
  errorMessage.value = '';


  try {
    const response = await api.get('user/info', {
      params: {
        username: proverName
      }
    })
    console.log('API Response:', response.data);

    if (response.data.username != proverName) {
      console.error("API error: received username not matching the send username")
      alert("API error: received username not matching the send username")
    }



    pubKeys.value = response.data.pubKeys.split(','); // Split the comma-separated string into an array


    numberofKeys.value = pubKeys.value.length; // Update the number of public keys
    console.log('Number of public keys:', numberofKeys.value); // Debug log



    BlumInteger.value = response.data.blum; // Set the Blum integer
    console.log('Blum Integer:', BlumInteger.value); // Debug log


    user_info_received.value = true; // Set the flag to true after successfully receiving user info


    ///tmp workaround....when i update the flow i will remove the variable
    public_keys_received.value = true; //

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


const sendChallenge = () => {

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
  challenge_sent.value = true;
};

// Example: Generate a random challenge
const generateRandomChallenge = () => {
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



  console.log('Verification called with:');
  console.log('y:', y);
  console.log('x:', x);
  console.log('t:', t);
  console.log('c:', c);
  console.log('n:', n);



  console.log('Type of y:', typeof y);
  console.log('Type of x:', typeof x);
  console.log('Type of t:', Array.isArray(t) ? 'Array' : typeof t);
  console.log('Type of c:', Array.isArray(c) ? 'Array' : typeof c);
  console.log('Type of n:', typeof n);

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
            <button @click= "showPublicKeysInfo= true" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>i</i>
            </button>
          </div>

          <!--

          <div v-if="public_keys_received" class="text-gray-700"> received n public keys</div>
          <div v-else class="text-gray-700">Waiting for public keys.......</div>

             -->

          <!-- <div class="font-mono text-sm">
            <p>{{ receivedKeysMessage }}</p>
          </div> -->
        </div>

        <!-- Commitment Section -->
        <div v-if="public_keys_received" class="space-y-2">

          <div v-if="commitment_received" class="font-mono text-sm">
            received commitment       
              <button @click= "showCommitmentInfo= true" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>i</i>
            </button>
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
              class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button class="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition" @click="sendChallenge">
              →
            </button>
            <p v-if="challengeError" class="w-full text-center text-red-600 font-semibold">
              {{ challengeError }}
            </p>
          </div>

          <div v-else class="flex justify-center">
            <button @click="sendChallenge"
              class="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium">
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
            <button @click= "showYInfo= true" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>i</i>
            </button>
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
          <div class="font-mono text-sm space-y-1">
            <div>y² mod n  =     
              <button @click= "showySquaredModNInfo= true" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
                <i>show number</i>
              </button>
            
            </div>
            <div>x × t₁^c₁ × ... mod n =            
              <button @click= "showySquaredModNInfo= true" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
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

          <!-- <div>
          <h3 class="font-semibold">Info</h3>
          <p class="text-gray-700">
            This is the verifier view. It waits for the public keys, commitment, and y value from the prover.
            After receiving these, it generates a challenge and sends it to the prover.
            Finally, it verifies the response based on the received values.
          </p>
        </div>     -->
          <div v-if="public_keys_received && (!commitment_received)" class="text-gray-700">
            <h3 class="font-semibold">Step 2/6 Waiting for commitment</h3>
            <p>After receiving the public keys the next step is for the proover to send the Commitment</p>
            <p class="text-gray-500">Commitment is a value that is used to prove that the prover has the knowledge of
              the secret without revealing it.</p>
            <p class="text-gray-500">Following that we will send the challenge bits</p>
          </div>

          <div v-else-if="commitment_received && !challenge_sent" class="text-gray-700">
            <h3 class="font-semibold">Step 3/6 Generate and send challenge</h3>
            <p>After receiving the commitment, the next step is to generate and send the challenge.</p>
            <p class="text-gray-500">The challenge is a random sequence of bits that is used to verify the response from
              the prover.</p>
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
            <p class="text-gray-500">If the verification succeeded, it means the prover has the knowledge of the secret
              without revealing it.</p>
          </div>
          <div v-else class="text-gray-700">
            <h3 class="font-semibold">Step 1/6 Waiting for public keys</h3>
            <p>Waiting for the public keys from the prover.</p>
            <p class="text-gray-500">The public keys are used to verify the response from the prover.</p>
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



      
      <!-- Public Keys Information Modal -->
      <div v-if="showPublicKeysInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Information</h3>
            <button @click="showPublicKeysInfo = false" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          <div class="space-y-2">
            <p class="font-medium">The Provers Public Keys (tᵢ = sᵢ² mod n):</p>
            <div class="font-mono text-sm space-y-1">
              <div v-for="(pk, index) in pubKeys ">
                t{{index}}: {{ pk }}  
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Commitment Modal -->
      <div v-if="showCommitmentInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Information</h3>
            <button @click="showCommitmentInfo = false" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          <div class="space-y-2">
            <p class="font-medium">The Commitment from the prover:</p>
            <div class="font-mono text-sm space-y-1">
              x: {{ xValue }}
            </div>
          </div>
        </div>
      </div>

      <!-- Y  Modal -->
      <div v-if="showYInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Information</h3>
            <button @click="showYInfo = false" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          <div class="space-y-2">
            <p class="font-medium"> y</p>
            <div class="font-mono text-sm space-y-1">
              y {{ yValue }}
            </div>
          </div>
        </div>
      </div>


      <!-- y^2 mod n  Modal -->
      <div v-if="showySquaredModNInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Information</h3>
            <button @click="showySquaredModNInfo = false" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          <div class="space-y-2">
            <p class="font-medium"> x × t₁^c₁ × ... mod n:  </p>
            <div class="font-mono text-sm space-y-1">
              {{ verificationResult.productModN }}
            </div>
          </div>
        </div>
      </div>


      <!-- productModNInfo Modal -->
      <div v-if="showProductModNInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Information</h3>
            <button @click="showProductModNInfo = false" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          <div class="space-y-2">
            <p class="font-medium">y² mod n : :</p>
            <div class="font-mono text-sm space-y-1">
              y² mod n : {{ verificationResult.ySquaredModN }}
            </div>
          </div>
        </div>
      </div>



    </template>
  </BaseLayout>
</template>
