<template>
  <div id="app">
    <FFSDemo />
  </div>
</template>

<script>
import FFSDemo from './components/FFSDemo.vue'

export default {
  name: 'App',
  components: {
    FFSDemo
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f7f7f7;
}
</style>