<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';
import socket from '@/helpers/socket';
import { ref, onMounted } from 'vue';
import api from '@/helpers/api';

import demo_values from '@/helpers/demo_values.json';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const DEBUG_go_verifier = () => {
  router.push('/verifier');

};


const provers = ref([

]);

const dummy_provers = ref([

  { id: 1, name: 'Prover 1', keys: ['123001','1001'], reg_time: '2023-10-01 12:00:00', status: 'available' },
  { id: 2, name: 'Prover 2', keys: ['123002','1002']  , reg_time: '2023-10-02 14:30:00', status: 'not available' },
  { id: 3, name: 'Prover 3', keys: ['123003','1003'] , reg_time: '2023-10-03 09:15:00' , status: 'available' },

]);



const loadingProoverTable = ref(false);
const errorMessage = ref('');


const refreshProvers = async() => {

  loadingProoverTable.value = true;
  errorMessage.value = '';
  
  try {
 
    const response = await api.get('/provers');
    
    console.log('API Response:', response.data); // Debug log
    console.log('typeof response.data.provers:', typeof response.data.provers); // Debug log
    provers.value = response.data.provers; 

  } catch (error) {
    console.error('Failed to load the table of provers', error);
  
    errorMessage.value = 'API error - using demo table of provers';
    provers.value = dummy_provers.value; 
  } finally {
    loadingProoverTable.value = false;
  }



  console.log('Provers refreshed:', provers.value);

};


const selectprover = (prover) => {


  // disabled since this is not achievable yet
  // ###########################

  // // if prover not available notify user
  // if (prover.status !== 'available') {
  //   alert('Selected prover is not available. Please select another prover.');
  //   return;
  // }




  console.log('Selected Prover:', prover);
  router.push('/verifier');

  router.push({ 
    path: '/verifier', 
    query: { 
      proverName: prover.name, 
      // proverKeys: prover.keys,
      // the keys are now retrieved from the server via the API endpoint 
    } 
  });

};


const username = ref(demo_values.username || 'demo_peggy'); 
const blumInteger = ref(demo_values.blum || 77);

const register_demo_peggy = async () => {


  try {
    // Prepare the payload according to the API spec
    const payload = {
      username: username.value,
      pubKeys:  demo_values.publicKeys || [9], // Use demo values or default
      blum: blumInteger.value || 77 
    };


    // Convert pubKeys to a comma-separated string
    payload.pubKeys = payload.pubKeys.join(','); 
    
    
    console.log('Registering with payload:', payload);
    
    // Call the correct endpoint
    const response = await api.post('/user/register', payload);
    
    console.log('Registration response:', response.data);
    
    // // On success, navigate to the prover page
    // router.push(`/prover/${username.value}`);
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








onMounted(() => {


});


</script>

<template>
  <BaseLayout>
    <template #header>
      <h1 class="text-3xl font-bold text-center">Verifier </h1>
    </template>



    <template #default>
      <div class="flex flex-col items-center mt-10 space-y-6">
        <!-- Prover button -->

        <div class="h3"> select the right prover</div>

        <table class="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 border-b">Username</th>
              <th class="px-4 py-2 border-b">Keys</th>
              <th class="px-4 py-2 border-b">Time registered</th>
              <!-- <th class="px-4 py-2 border-b">Status</th> -->
              <th class="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prover in provers" :key="prover.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 border-b">{{ prover.name }}</td>
              <td class="px-4 py-2 border-b">{{ prover.keys }}</td>
              <!-- replace with the ac  -->
              <td class="px-4 py-2 border-b">{{ prover.reg_time}}</td>
              <td class="px-4 py-2 border-b">
                <span :class="prover.status === 'available' ? 'text-green-600' : 'text-red-600'">
                  {{ prover.status }}
                </span>
              </td>
              <td class="px-4 py-2 border-b">
                <button
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  @click="selectprover(prover)"
                >
                  Select
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-center mt-4">
          <button
            @click="refreshProvers"
            class="border border-blue-500 text-blue-500 rounded-xl p-3 flex items-center hover:bg-blue-100 transition cursor-pointer w-48 justify-center mr-4"
          >
            <span>Refresh Provers</span>
          </button>
        </div>
        <div class="flex justify-center mt-4">
          <button 
            @click="goHome" 
              class="border border-black rounded-xl p-3 flex items-center hover:bg-gray-100 transition cursor-pointer w-48 justify-center"    
          >
            <span>Go Home</span>
            </button>
        </div>
        <div class="flex justify-center mt-4">
          <button 
            @click="register_demo_peggy" 
              class="border border-black rounded-xl p-3 flex items-center hover:bg-gray-100 transition cursor-pointer w-48 justify-center"    
          >
            <span>DEBUG add fake user</span>
            </button>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>
