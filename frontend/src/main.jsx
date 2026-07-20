import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor for Authentication
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && resource.includes('/api')) {
    config = config || {};
    config.credentials = 'include';
  } else if (resource instanceof Request && resource.url.includes('/api')) {
    // If it's a Request object, we don't modify it directly here since credentials is read-only.
    // Instead we attach it to the config which overrides the Request's credentials.
    config = config || {};
    config.credentials = 'include';
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
    <BrowserRouter>
      <UnsavedChangesProvider>
        <App />
      </UnsavedChangesProvider>
    </BrowserRouter>
  </StrictMode>,
)
