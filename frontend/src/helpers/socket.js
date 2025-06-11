import { io } from 'socket.io-client';

const SOCKET_URL =  import.meta.env.PROD === "production" ? undefined : "http://localhost:5000";


const socket = io(SOCKET_URL);


const on = (event, callback) => socket.on(event, callback);
const off = (event) => socket.off(event);
const emit = (event, data) => socket.emit(event, data);
const disconnect = () => socket.disconnect();
const connect = () => socket.connect();
const getSocket = () => socket;

export default {
  on,
  off,
  emit,
  connect,
  disconnect,
  getSocket
};
