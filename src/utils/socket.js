import openSocket from 'socket.io-client';
const socket = openSocket(process.env.REACT_APP_SOCKET_URL);

export function subscribeOnce(eventName, cb) {
  socket.once(eventName, cb);
} 

export function subscribe(eventName, cb) {
  socket.on(eventName, cb);
} 
