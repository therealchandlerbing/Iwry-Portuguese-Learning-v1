import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initErrorTracking } from './utils/errorTracking';
import { initAnalytics } from './utils/analytics';

// Initialize error tracking early
initErrorTracking().catch(console.error);

// Initialize analytics
initAnalytics().catch(console.error);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
