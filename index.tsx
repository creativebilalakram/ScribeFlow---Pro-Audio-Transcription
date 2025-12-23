
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("ScribeFlow Core: Starting initialization...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical Error: Root element not found!");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("ScribeFlow Core: Successfully mounted.");
} catch (err) {
  console.error("Initialization failed:", err);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;">Mount Error: ${err.message}</div>`;
}
