import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor for Authentication
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && resource.includes('localhost:5001/api')) {
    const token = localStorage.getItem('token');
    if (token) {
      config = config || {};
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  } else if (resource instanceof Request && resource.url.includes('localhost:5001/api')) {
    const token = localStorage.getItem('token');
    if (token) {
      resource.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  const response = await originalFetch(resource, config);
  
  // Handle 401 globally (optional logout could be done here)
  if (response.status === 401) {
    console.error("Unauthorized request. Token might be invalid or expired.");
  }
  
  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
