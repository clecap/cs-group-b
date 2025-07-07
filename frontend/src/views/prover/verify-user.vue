<script setup>


// ========================
// IMPORTS
// ========================

// Layout component
import BaseLayout from '../../layouts/BaseLayout.vue';

// Vue core functionality
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Utility functions
import { checkUserRegistered } from '@/helpers/utility'


// ========================
// ROUTER INITIALIZATION
// ========================

const router = useRouter();


// ========================
// REACTIVE STATE VARIABLES
// ========================

// User input field for username
const username = ref('');

// Error/status message display
const message = ref('');


// ========================
// USER AUTHENTICATION FUNCTIONS
// ========================

/**
 * Handles the form submission when user clicks the arrow button or presses Enter
 * Checks if the username exists in the system and redirects accordingly
 * Shows error message if user is not found
 */
const handleSubmit = async () => {
  // Only proceed if username is not empty
  if(username.value) {
    // Check if user is registered using utility function
    const result = await checkUserRegistered(username.value)
    
    if (result.registered) {
      // User exists - redirect to their prover page
      router.push(`/prover/${username.value}`)
    } else {
      // User doesn't exist - display error message
      message.value = result.message
    }
  }
};


// ========================
// NAVIGATION FUNCTIONS
// ========================

/**
 * Navigates to the registration page when user clicks the "Register" link
 * Allows new users to create an account
 */
const handleRegister = () => {
  router.push('/prover/register');
};
</script>

<template>
  <BaseLayout>
    

    <!-- ======================== -->
    <!-- HEADER SECTION -->
    <!-- ======================== -->
    
    <template #header>
      <div class="relative w-full">
        <!-- Register link positioned at top-right corner -->
        <button
          @click="handleRegister"
          class="absolute top-0 right-0 text-lg underline hover:text-gray-700 transition z-10 cursor-pointer"
        >
          Register
        </button>
        
        <!-- Main page title -->
        <h1 class="text-3xl font-bold text-center pt-8">Are you an existing user?</h1>
      </div>
    </template>

    
    <!-- ======================== -->
    <!-- MAIN CONTENT -->
    <!-- ======================== -->
    
    <template #default>
      <div class="flex flex-col items-center mt-10">
        
        
        <!-- ======================== -->
        <!-- USERNAME INPUT SECTION -->
        <!-- ======================== -->
        
        <div class="flex items-center space-x-3">
          <div>
            <!-- Username input field with Enter key support -->
            <input
              v-model="username"
              type="text"
              placeholder="Enter username"
              class="px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              @keyup.enter="handleSubmit"
            />
            
            <!-- Error message display -->
            <div v-if="message" class="text-red-500">{{ message }}</div>
          </div>
          
          <!-- Submit button with arrow icon -->
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