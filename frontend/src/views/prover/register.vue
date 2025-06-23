<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/helpers/api';

const router = useRouter();
const username = ref('');
const numberOfSecrets = ref('');
const secretsText = ref('xxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx\nxxxxxxx');
const blumInteger = ref('');
const loadingBlum = ref(false);
const errorMessage = ref('');
const publicKeys = ref([]);

const handleGetBlumInteger = async () => {
  loadingBlum.value = true;
  errorMessage.value = '';
  
  try {
    // Assuming the API endpoint is GET /blum
    const response = await api.get('/blum');
    
    console.log('API Response:', response.data); // Debug log
    
    // Handle the response structure { "blum": value }
    const blumValue = response.data.blum || response.data.n || response.data.blum_integer;
    
    if (!blumValue || blumValue === null || blumValue === 'Infinity' || blumValue === 'NaN' || isNaN(parseInt(blumValue))) {
      // Use a hardcoded Blum integer for development
      blumInteger.value = '9797';
      errorMessage.value = 'Using demo Blum integer (API returned invalid value)';
    } else {
      blumInteger.value = blumValue.toString();
      errorMessage.value = '';
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

// Generate a simple Blum integer for demo purposes
const generateBlumInteger = () => {
  const primes = [7, 11, 19, 23, 31, 43, 47, 59, 67, 71, 79, 83, 103, 107];
  const p = primes[Math.floor(Math.random() * primes.length)];
  let q;
  do {
    q = primes[Math.floor(Math.random() * primes.length)];
  } while (q === p);
  
  return p * q;
};

// Helper function to calculate GCD (Greatest Common Divisor)
const gcd = (a, b) => {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

// Helper function to check if two numbers are coprime
const areCoprime = (a, b) => {
  return gcd(a, b) === 1;
};

// Generate a random number that is coprime to n
const generateCoprimeNumber = (n) => {
  let candidate;
  do {
    // Generate random number between 2 and n-1
    candidate = Math.floor(Math.random() * (n - 2)) + 2;
  } while (!areCoprime(candidate, n));
  return candidate;
};

const handleSecretsSubmit = () => {
  console.log('Number of secrets:', numberOfSecrets.value);
  
  // Validate input
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
  
  const n = parseInt(blumInteger.value);
  if (isNaN(n)) {
    errorMessage.value = 'Invalid Blum Integer';
    return;
  }
  
  // Generate coprime secrets
  const secrets = [];
  const usedValues = new Set();
  
  for (let i = 0; i < numSecrets; i++) {
    let secret;
    do {
      secret = generateCoprimeNumber(n);
    } while (usedValues.has(secret)); // Ensure uniqueness
    
    usedValues.add(secret);
    secrets.push(secret);
  }
  
  // Update the textarea with generated secrets
  secretsText.value = secrets.join('\n');
  errorMessage.value = '';
  
  // Calculate public keys
  publicKeys.value = secrets.map((secret, index) => {
    const t = (secret * secret) % n;
    return {
      index: index + 1,
      secret: secret,
      publicKey: t
    };
  });
};

const copySecrets = () => {
  navigator.clipboard.writeText(secretsText.value).then(() => {
    console.log('Secrets copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};

const handleRegister = async () => {
  // Validate all required data
  if (!username.value) {
    errorMessage.value = 'Please enter a username';
    return;
  }
  
  if (!blumInteger.value) {
    errorMessage.value = 'Please get a Blum Integer first';
    return;
  }
  
  if (publicKeys.value.length === 0) {
    errorMessage.value = 'Please generate secrets first';
    return;
  }
  
  try {
    // Prepare the payload according to the API spec
    const payload = {
      username: username.value,
      pubKeys: publicKeys.value.map(pk => pk.publicKey).join(','), // comma-separated string
      blum: blumInteger.value
    };
    
    console.log('Registering with payload:', payload);
    
    // Call the correct endpoint
    const response = await api.post('/user/register', payload);
    
    console.log('Registration response:', response.data);
    
    // On success, navigate to the prover page
    router.push(`/prover/${username.value}`);
  } catch (error) {
    console.error('Registration failed:', error);
    console.error('Error response:', error.response);
    
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      
      // Handle specific error codes
      if (error.response.status === 406) {
        errorMessage.value = 'User already exists. Please choose a different username.';
      } else {
        errorMessage.value = error.response.data?.message || 
                            error.response.data || 
                            `Registration failed (${error.response.status})`;
      }
    } else if (error.request) {
      errorMessage.value = 'No response from server. Please check your connection.';
    } else {
      errorMessage.value = 'Registration failed. Please try again.';
    }
  }
};
</script>

<template>
  <BaseLayout>
    <template #header>
      <h1 class="text-3xl font-bold text-center">Register as Prover</h1>
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
          <span class="font-medium">Blum integer, n:</span>
          <span v-if="blumInteger" class="font-mono">{{ blumInteger }}</span>
          <button
            @click="handleGetBlumInteger"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            :disabled="loadingBlum"
          >
            {{ loadingBlum ? 'Loading...' : 'Get Blum Integer' }}
          </button>
        </div>
        
        <!-- Error message -->
        <div v-if="errorMessage" class="text-red-500 text-sm">
          {{ errorMessage }}
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
              type="number"
              min="1"
              class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              @keyup.enter="handleSecretsSubmit"
            />
            <button
              @click="handleSecretsSubmit"
              class="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              :disabled="!blumInteger"
              :title="!blumInteger ? 'Get Blum Integer first' : 'Generate secrets'"
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
          <div v-if="publicKeys.length === 0" class="font-mono text-sm space-y-1">
            <div>t₁ = s₁² mod n = xxxx</div>
            <div>t₂ = s₂² mod n = xxxx</div>
            <div>t₃ = s₃² mod n = xxxx</div>
          </div>
          <div v-else class="font-mono text-sm space-y-1">
            <div v-for="pk in publicKeys" :key="pk.index">
              t{{ pk.index }} = {{ pk.secret }}² mod {{ blumInteger }} = {{ pk.publicKey }}
            </div>
          </div>
        </div>

        <!-- Register Button -->
        <div class="flex justify-center mt-8">
          <button
            @click="handleRegister"
            class="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="!username || !blumInteger || publicKeys.length === 0"
          >
            Register
          </button>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>