<script setup>
// ========================
// IMPORTS
// ========================

// Layout and Vue core functionality
import BaseLayout from '../../layouts/BaseLayout.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// API and utility functions
import api from '@/helpers/api';
import { generateRandomCoprime } from '@/helpers/utility';
import bigInt from "big-integer";


// ========================
// ROUTER INITIALIZATION
// ========================

const router = useRouter();


// ========================
// REACTIVE STATE VARIABLES
// ========================

// User input fields
const username = ref('');
const numberOfSecrets = ref('');
const secretsText = ref('xxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx');

// Blum integer related state
const blumInteger = ref('');
const loadingBlum = ref(false);
const blumSuccess = ref(false);
const showBlumInfo = ref(false);

// Public keys and secrets state
const publicKeys = ref([]);
const secretsGenerated = ref(false);
const showPublicKeysInfo = ref(false);

// UI feedback states
const errorMessage = ref('');
const copySuccess = ref(false);

// Registration state
const registering = ref(false);
const registrationComplete = ref(false);

// ========================
// COMPUTED PROPERTIES FOR STEP TRACKING
// ========================

const hasUsername = computed(() => username.value.trim() !== '');
const hasBlumInteger = computed(() => blumInteger.value !== '');
const hasPublicKeys = computed(() => publicKeys.value.length > 0);
const readyToRegister = computed(() => hasUsername.value && hasBlumInteger.value && hasPublicKeys.value);


// ========================
// BLUM INTEGER FUNCTIONS
// ========================

/**
 * Fetches a Blum integer from the backend API
 * Falls back to a hardcoded value (9797) if the API fails or returns invalid data
 * Updates UI states to show loading, success, or error messages
 */
const handleGetBlumInteger = async () => {
  // Reset states before starting
  loadingBlum.value = true;
  errorMessage.value = '';
  blumSuccess.value = false;
  
  try {
    // Make API call to get Blum integer
    const response = await api.get('/blum');
    
    console.log('API Response:', response.data);
    
    // Try different possible response formats from the API
    const blumValue = response.data.blum || response.data.n || response.data.blum_integer;
    
    // Validate the received value
    if (!blumValue || blumValue === null || blumValue === 'Infinity' || blumValue === 'NaN' || isNaN(parseInt(blumValue))) {
      // Use a hardcoded Blum integer for development/demo purposes
      blumInteger.value = '9797';
      errorMessage.value = 'Using demo Blum integer (API returned invalid value)';
    } else {
      // Successfully received valid Blum integer
      blumInteger.value = blumValue.toString();
      errorMessage.value = '';
      blumSuccess.value = true;
    }
    
    console.log('Blum Integer set to:', blumInteger.value);
  } catch (error) {
    console.error('Failed to get Blum Integer:', error);
    
    // Fallback to hardcoded value for development
    blumInteger.value = '9797';
    errorMessage.value = 'API error - using demo Blum integer';
  } finally {
    loadingBlum.value = false;
  }
};

/**
 * Generates a simple Blum integer locally for testing purposes
 * A Blum integer is the product of two prime numbers that are congruent to 3 (mod 4)
 * This function is kept for local testing when API is unavailable
 */
const generateBlumInteger = () => {
  // Small primes for demo purposes
  const primes = [7, 11, 19, 23, 31, 43, 47, 59, 67, 71, 79, 83, 103, 107];
  
  // Select first prime randomly
  const p = primes[Math.floor(Math.random() * primes.length)];
  
  // Select second prime (different from first)
  let q;
  do {
    q = primes[Math.floor(Math.random() * primes.length)];
  } while (q === p);
  
  // Return the product
  return p * q;
};


// ========================
// SECRETS GENERATION FUNCTIONS
// ========================

/**
 * Handles the generation of coprime secrets when user clicks the arrow button
 * Validates input, generates unique coprime numbers, and computes public keys
 */
const handleSecretsSubmit = () => {
  console.log('Number of secrets:', numberOfSecrets.value);
  
  // Validate the number of secrets input
  const numSecrets = parseInt(numberOfSecrets.value);
  if (isNaN(numSecrets) || numSecrets < 1) {
    errorMessage.value = 'Please enter a valid number of secrets (≥ 1)';
    return;
  }
  
  // Check if Blum integer is available
  if (!blumInteger.value) {
    errorMessage.value = 'Please get a Blum Integer first';
    return;
  }
  
  // Convert Blum integer to bigInt for large number calculations
  const n = bigInt(blumInteger.value);
  if (isNaN(parseInt(blumInteger.value))) {
    errorMessage.value = 'Invalid Blum Integer';
    return;
  }
  
  // Generate unique coprime secrets
  const secrets = [];
  const usedValues = new Set(); // Track used values to ensure uniqueness
  
  for (let i = 0; i < numSecrets; i++) {
    let secret;
    // Keep generating until we find a unique coprime number
    do {
      secret = generateRandomCoprime(n);
    } while (usedValues.has(secret.toString()));
    
    usedValues.add(secret.toString());
    secrets.push(secret);
  }
  
  // Update the textarea with generated secrets
  secretsText.value = secrets.map(s => s.toString()).join('\n');
  errorMessage.value = '';
  secretsGenerated.value = true;
  
  // Calculate public keys using the formula: t_i = s_i^2 mod n
  publicKeys.value = secrets.map((secret, index) => {
    const t = secret.pow(2).mod(n);
    return {
      index: index + 1,
      secret: secret.toString(),
      publicKey: t.toString()
    };
  });
};


// ========================
// UTILITY FUNCTIONS
// ========================

/**
 * Copies the generated secrets to the user's clipboard
 * Shows a success message that auto-hides after 3 seconds
 */
const copySecrets = () => {
  navigator.clipboard.writeText(secretsText.value).then(() => {
    console.log('Secrets copied to clipboard');
    copySuccess.value = true;
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      copySuccess.value = false;
    }, 3000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};


// ========================
// REGISTRATION FUNCTION
// ========================

/**
 * Handles the user registration process
 * Validates all required data, sends to backend, and navigates to prover page on success
 */
const handleRegister = async () => {
  // Validate username
  if (!username.value) {
    errorMessage.value = 'Please enter a username';
    return;
  }
  
  // Validate Blum integer
  if (!blumInteger.value) {
    errorMessage.value = 'Please get a Blum Integer first';
    return;
  }
  
  // Validate public keys
  if (publicKeys.value.length === 0) {
    errorMessage.value = 'Please generate secrets first';
    return;
  }
  
  registering.value = true;
  
  try {
    // Prepare the payload according to the API specification
    const payload = {
      username: username.value,
      pubKeys: publicKeys.value.map(pk => pk.publicKey).join(','), // comma-separated string
      blum: blumInteger.value
    };
    
    console.log('Registering with payload:', payload);
    
    // Make API call to register the user
    const response = await api.post('/user/register', payload);
    
    console.log('Registration response:', response.data);
    
    registrationComplete.value = true;
    
    // On successful registration, navigate to the prover page after a short delay
    setTimeout(() => {
      router.push(`/prover/${username.value}`);
    }, 1500);
  } catch (error) {
    // Handle various error scenarios
    console.error('Registration failed:', error);
    console.error('Error response:', error.response);
    
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      
      // Handle specific HTTP status codes
      if (error.response.status === 406) {
        errorMessage.value = 'User already exists. Please choose a different username.';
      } else {
        // Generic error message with details if available
        errorMessage.value = error.response.data?.message || 
                            error.response.data || 
                            `Registration failed (${error.response.status})`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage.value = 'No response from server. Please check your connection.';
    } else {
      // Something else went wrong
      errorMessage.value = 'Registration failed. Please try again.';
    }
  } finally {
    registering.value = false;
  }
};
</script>

<template>
  <BaseLayout>


    <!-- ======================== -->
    <!-- HEADER SECTION -->
    <!-- ======================== -->

    <template #header>
      <h1 class="text-3xl font-bold text-center">Register as Prover</h1>
    </template>


    <!-- ======================== -->
    <!-- MAIN CONTENT -->
    <!-- ======================== -->

    <template #default>
      <div class="max-w-2xl mx-auto mt-8 space-y-6">
        

        <!-- ======================== -->
        <!-- USERNAME INPUT SECTION -->
        <!-- ======================== -->

        <div class="flex items-center space-x-4">
          <label class="font-medium">Set username:</label>
          <input
            v-model="username"
            type="text"
            class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-xs"
          />
        </div>


        <!-- ======================== -->
        <!-- BLUM INTEGER SECTION -->
        <!-- ======================== -->

        <div class="flex items-center space-x-4">
          <button
            @click="handleGetBlumInteger"
            class="border-1 border-black rounded-full px-6 py-2"
            :disabled="loadingBlum"
          >
            {{ loadingBlum ? 'Loading...' : 'Get Blum Integer' }}
          </button>
        </div>
        
        <!-- Success message for Blum Integer with info button -->
        <p v-if="blumSuccess" class="w-full text-center text-green-600 font-semibold">
          ✓ Blum integer generated!
          <button @click="showBlumInfo = true" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
            <i>i</i>
          </button>
        </p>
        
        <!-- Error message display -->
        <p v-if="errorMessage" class="text-red-500 text-xs mt-1">
          {{ errorMessage }}
        </p>


        <!-- ======================== -->
        <!-- SECRETS GENERATION SECTION -->
        <!-- ======================== -->

        <div>
          <p class="font-medium mb-4">
            Choose secrets s₁...sₖ coprime to the Blum integer n
          </p>

          <div class="flex items-center space-x-4">
            <label class="font-medium">Number of secrets:</label>
            <input
              v-model="numberOfSecrets"
              type="number"
              min="1"
              class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              @keyup.enter="handleSecretsSubmit"
            />
            <button
              @click="handleSecretsSubmit"
              class="p-2 border-1 border-black rounded-full hover:bg-gray-50 transition"
              :disabled="!blumInteger"
              :title="!blumInteger ? 'Get Blum Integer first' : 'Generate secrets'"
            >
              →
            </button>
          </div>
        </div>


        <!-- ======================== -->
        <!-- SECRETS DISPLAY SECTION -->
        <!-- ======================== -->

        <div class="space-y-2">
          <div class="font-medium">Secrets sᵢ (coprime to n):</div>
          <div class="flex items-start space-x-3">
            <!-- Textarea showing generated secrets (read-only) -->
            <textarea
              v-model="secretsText"
              readonly
              class="flex-1 px-4 py-3 border border-gray-300 rounded bg-gray-50 font-mono text-sm resize-none overflow-y-auto"
              rows="5"
            ></textarea>
            <!-- Copy button -->
            <button
              @click="copySecrets"
              class="border-1 border-black rounded px-4 py-2"
            >
              Copy
            </button>
          </div>
          <!-- Copy success feedback -->
          <p v-if="copySuccess" class="text-green-600 text-sm text-center">
            ✓ Secrets copied to clipboard!
          </p>
        </div>


        <!-- ======================== -->
        <!-- PUBLIC KEYS SECTION -->
        <!-- ======================== -->

        <div class="space-y-2">
          <!-- Default placeholder when no keys generated -->
          <div v-if="publicKeys.length === 0" class="font-mono text-sm space-y-1">
            <div>t₁ = s₁² mod n = xxxx</div>
            <div>t₂ = s₂² mod n = xxxx</div>
            <div>t₃ = s₃² mod n = xxxx</div>
          </div>
          <!-- Show computed keys before final generation -->
          <div v-else-if="!secretsGenerated" class="font-mono text-sm space-y-1">
            <div v-for="pk in publicKeys" :key="pk.index">
              t{{ pk.index }} = {{ pk.secret }}² mod {{ blumInteger }} = {{ pk.publicKey }}
            </div>
          </div>
          
          <!-- Success message for computed public keys with info button -->
          <p v-if="secretsGenerated" class="w-full text-center text-green-600 font-semibold">
            ✓ Public keys computed!
            <button @click="showPublicKeysInfo = true" class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
              <i>i</i>
            </button>
          </p>
        </div>


        <!-- ======================== -->
        <!-- REGISTER BUTTON -->
        <!-- ======================== -->

        <div class="flex justify-center mt-8">
          <button
            @click="handleRegister"
            class="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!username || !blumInteger || publicKeys.length === 0 || registering"
          >
            {{ registering ? 'Registering...' : 'Register' }}
          </button>
        </div>


        <!-- ======================== -->
        <!-- STEP-BY-STEP INFO BOX -->
        <!-- ======================== -->
        
        <div class="space-y-4 p-4 bg-gray-50 rounded-lg border border-black-200">
          <!-- Step 1: Initial State -->
          <div v-if="!hasUsername" class="text-gray-700">
            <h3 class="font-semibold">Step 1/5: Choose Username</h3>
            <p>Start by choosing a unique username for your prover identity.</p>
            <p class="text-gray-500">This username will be used to identify you during the zero-knowledge proof process.</p>
            <p class="text-gray-500">Make sure to remember it as you'll need it to access your prover interface later.</p>
          </div>

          <!-- Step 2: Get Blum Integer -->
          <div v-else-if="hasUsername && !hasBlumInteger" class="text-gray-700">
            <h3 class="font-semibold">Step 2/5: Get Blum Integer</h3>
            <p>Click the button to obtain a Blum integer from the server.</p>
            <p class="text-gray-500">A Blum integer is a special number that is the product of two prime numbers, both congruent to 3 mod 4.</p>
          </div>

          <!-- Step 3: Generate Secrets -->
          <div v-else-if="hasBlumInteger && !secretsGenerated" class="text-gray-700">
            <h3 class="font-semibold">Step 3/5: Generate Secret Numbers</h3>
            <p>Specify how many secret numbers you want to generate, then click the arrow button.</p>
            <p class="text-gray-500">These secrets must be coprime to the Blum integer (their greatest common divisor is 1).</p>
            <p class="text-gray-500">The system will automatically generate random coprime numbers for you.</p>
          </div>

          <!-- Step 4: Public Keys Computed -->
          <div v-else-if="secretsGenerated && !readyToRegister" class="text-gray-700">
            <h3 class="font-semibold">Step 4/5: Public Keys Computed</h3>
            <p>Your public keys have been automatically calculated from your secrets.</p>
            <p class="text-gray-500">Each public key tᵢ is computed as sᵢ² mod n, where sᵢ is your secret and n is the Blum integer.</p>
            <p class="text-gray-500">These public keys will be shared with verifiers while your secrets remain private.</p>
          </div>

          <!-- Step 5: Ready to Register -->
          <div v-else-if="readyToRegister && !registrationComplete" class="text-gray-700">
            <h3 class="font-semibold">Step 5/5: Ready to Register</h3>
            <p>All required information has been provided. Click the Register button to complete the process.</p>
            <p class="text-gray-500">Your username, Blum integer, and public keys will be sent to the server.</p>
            <p class="text-gray-500">After successful registration, you'll be redirected to your prover interface.</p>
          </div>

          <!-- Registration Complete -->
          <div v-else-if="registrationComplete" class="text-gray-700">
            <h3 class="font-semibold">Registration Complete!</h3>
            <p class="text-green-600">✓ Successfully registered as a prover.</p>
          </div>
        </div>
      </div>
      
      
      <!-- ======================== -->
      <!-- MODAL DIALOGS -->
      <!-- ======================== -->
      
      <!-- Blum Integer Information Modal -->
      <div v-if="showBlumInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Information</h3>
            <button @click="showBlumInfo = false" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          <div class="space-y-2">
            <p class="font-medium">Blum integer, n:</p>
            <p class="font-mono text-sm break-all">{{ blumInteger }}</p>
          </div>
        </div>
      </div>
      
      <!-- Public Keys Information Modal -->
      <div v-if="showPublicKeysInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-2xl mx-4 max-h-[80vh] flex flex-col">
          <!-- Fixed Header -->
          <div class="flex justify-between items-center p-6 pb-4 border-b">
            <h3 class="text-lg font-semibold">Information</h3>
            <button @click="showPublicKeysInfo = false" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
          <!-- Scrollable Content -->
          <div class="p-6 pt-4 overflow-y-auto">
            <div class="space-y-2">
              <p class="font-medium">Computed Public Keys (tᵢ = sᵢ² mod n):</p>
              <div class="font-mono text-sm space-y-1">
                <div v-for="pk in publicKeys" :key="pk.index">
                  t{{ pk.index }} = {{ pk.secret }}² mod {{ blumInteger }} = {{ pk.publicKey }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>