module.exports = {
    root: true,
    env: {
      node: true
    },
    extends: [
      'plugin:vue/essential',  // Für Vue 2, oder 'plugin:vue/vue3-essential' für Vue 3
      'eslint:recommended'
    ],
    parserOptions: {
      parser: '@babel/eslint-parser',
      requireConfigFile: false,
      ecmaVersion: 2020
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  };