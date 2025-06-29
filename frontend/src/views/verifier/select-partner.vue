<script setup>
import BaseLayout from '../../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';
import socket from '@/helpers/socket';
import { ref, onMounted } from 'vue';

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

  { id: 1, name: 'Prover 1', keys: ['123001','1001'], reg_time: '2023-10-01 12:00:00' },
  { id: 2, name: 'Prover 2', keys: ['123002','1002']  , reg_time: '2023-10-02 14:30:00' },
  { id: 3, name: 'Prover 3', keys: ['123003','1003'] , reg_time: '2023-10-03 09:15:00' },

]);


const refreshProvers = () => {
  // Simulate fetching provers from an API or socket
  // In a real application, you would replace this with an actual API call
  console.log('Refreshing provers...');

  socket.emit('getProvers'); // Request the latest provers from the server


  socket.on('proversUpdated', (data) => {
    console.log('Received updated provers:', data);
    provers.value = data; // Update the provers with the received data
  });

  provers.value = dummy_provers.value; // Replace with actual data fetching logic

  console.log('Provers refreshed:', provers.value);
  // You can also handle any additional logic here, such as showing a notification or updating the
};


const selectprover = (prover) => {
  console.log('Selected Prover:', prover);
  router.push('/verifier');

  router.push({ 
    path: '/verifier', 
    query: { 
      proverName: prover.name, 
      proverKeys: prover.keys.join(','), 
    } 
  });

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
          <button @click="DEBUG_go_verifier" class="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
            DEBUG verfier screen
          </button>
        </div>
      </div>~
    </template>
  </BaseLayout>
</template>
