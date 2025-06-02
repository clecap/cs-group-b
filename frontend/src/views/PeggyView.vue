<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';
import BaseLayout from '../layouts/BaseLayout.vue';
import { useRouter } from 'vue-router';

const publicKeysInput = ref('');
const statusMessage = ref('');
let socket;

const sendPublicKeys = () => {
  const keys = publicKeysInput.value.split(',').map(k => k.trim());
  socket.emit('publish_public_keys', { public_keys: keys });
  statusMessage.value = 'Public Keys Have Been Published';
};

onMounted(() => {
  socket = io();
});

const router = useRouter();

const goHome = () => {
  router.push('/');
};

</script>

<template>
  <BaseLayout>
    <div>
      <h1>Peggy's View</h1>

      <div>
        <label>Enter Public Keys:</label>
        <input v-model="publicKeysInput" />
        <button @click="sendPublicKeys">Publish</button>
        <p>{{ statusMessage }}</p>
      </div>
    </div>
  </BaseLayout>
</template>
