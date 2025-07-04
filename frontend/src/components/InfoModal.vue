<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    style="backdrop-filter: blur(2px);"
    >
    <div class="bg-white relative rounded-xl shadow-lg px-6 py-4 min-w-[300px] max-w-md max-h-[70vh] overflow-y-auto">

      <div class="flex justify-between items-center bg-gray-100 p-3 rounded-t-xl">
        <h4 class="font-medium text-xl">Information</h4>

        <button
          @click="$emit('close')"
          class="w-8 h-8 flex items-center justify-center text-center rounded-full bg-gray-200 text-black text-lg font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div class="mt-2">{{ subtitle }}</div>
      <div class="mt-2 mb-2 overflow-y-auto break-words whitespace-pre-line">
        {{ content }}
      </div>

    </div>
  </div>
</template>

<script setup>
const {visible, content} = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    default: 'No content available'
  },
  subtitle: {
    type: String,
    default: ''
  }
})

</script>
