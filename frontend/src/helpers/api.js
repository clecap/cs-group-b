import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.PROD ?  'https://feigefiatshamirdemo.ddns.net:8000': "http://localhost:8000",
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});



export default api;
