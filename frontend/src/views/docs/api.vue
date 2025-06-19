<script setup>
import { onMounted, ref } from 'vue';
import 'swagger-ui-dist/swagger-ui.css';
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';
import { load } from 'js-yaml';

const swaggerSpec = ref(null);
const errorMsg = ref('');

onMounted(async () => {
  try {
    const response = await fetch('/api.yaml');


    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const yamlText = await response.text();

    const parsedData = load(yamlText);

    swaggerSpec.value = parsedData;

    if (swaggerSpec.value) {
      SwaggerUIBundle({
        spec: swaggerSpec.value,
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      });
    }
  } catch (error) {
    console.error("Error loading or parsing YAML for Swagger UI:", error);
    errorMsg.value = 'Failed to load API definition. Please check the console for details.';
  }
});
</script>

<template>
  <div id="swagger-ui">{{ errorMsg }}</div>
</template>
