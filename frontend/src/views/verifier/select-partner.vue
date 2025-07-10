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



//// those 2 are for the popup modal
const displayed_keys = ref([]);
const showPublicKeysInfo = ref(false);


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


const display_prover_keys = (prover) => {
  // This function can be used to display the keys of the selected prover


  prover = provers.value.find(p => p.name === prover);

  console.log('Displaying keys for prover:', prover);

  let keys = prover.keys.split(',').map(key => BigInt(key.trim()));
  console.log('Parsed keys:', keys); 
  displayed_keys.value = keys; // Assuming keys are stored in the 'keys' property of the prover object
  console.log('Displayed keys:', displayed_keys.value);

  // You can implement further logic here if needed
  showPublicKeysInfo.value = true
};



const discribe_keys = (keys) => {
  
  try {
    keys = keys.split(',').map(key => BigInt(key.trim())); // Split the keys string into an array
  } catch (error) {
    console.error('Error parsing keys:', error);
    return 'Invalid keys format';
  }
  /// assumption!   the keys are all of the same bit length, but that should be the case anyway, right?
  let bitlength = keys[0].toString(2).length; // Calculate the bit length of the first key

  let result = keys.length+ " keys, with " + bitlength + " bits each";
  return result;
};


const showTimeRegistered = (reg_time) => {
  
  let parsed_date = new Date(reg_time).toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Berlin' // Change to your desired timezone
  });

  return parsed_date;
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

        <div class="h3"> Please select the right prover from the table below</div>

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
              <td class="px-4 py-2 border-b">
                {{ discribe_keys(prover.keys) }}
                <button @click=display_prover_keys(prover.name) class="bg-transparent hover:bg-green-600 text-green-600 hover:text-white px-2 border border-green-600 hover:border-transparent rounded-full">
                  <i>i</i>
                </button>
              </td>
              <!-- replace with the ac  -->
              <td class="px-4 py-2 border-b">{{showTimeRegistered(prover.reg_time)}}</td>
              <!-- <td class="px-4 py-2 border-b">
                <span :class="prover.status === 'available' ? 'text-green-600' : 'text-red-600'">
                  {{ prover.status }}
                </span>
              </td> -->
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
          <button 
            @click="goHome" 
              class="border border-black rounded-xl p-3 flex items-center hover:bg-gray-100 transition cursor-pointer w-48 justify-center"    
          >
            <span>Go Home</span>
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
              <div v-for="(pk, index) in displayed_keys">
                t{{index}}: {{ pk }}  
              </div>
            </div>
          </div>
        </div>
      </div>



    </template>
  </BaseLayout>
</template>
