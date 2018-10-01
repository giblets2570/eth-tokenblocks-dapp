import axios from 'axios';

// Add a request interceptor
axios.interceptors.request.use((config) => {
  // Do something before request is sent
  config.headers.Authorization =  "Bearer " + localStorage.token
  return config;
}, (error) => {
  // Do something with request error
  return Promise.reject(error);
});


export default axios;