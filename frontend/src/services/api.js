import axios from 'axios';

const isDev = window.location.hostname === 'localhost';

const api = axios.create({
  baseURL: isDev
    ? 'http://localhost:8081/api'
    : 'https://seu-backend-em-producao.com/api',
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && token.includes('.') && token.split('.').length === 3) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Evita mandar Authorization malformado
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
