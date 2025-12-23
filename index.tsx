import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("ScribeFlow: Initializing application core...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("ScribeFlow Error: Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("ScribeFlow: Application mounted successfully.");
} catch (err) {
  console.error("ScribeFlow Mount Error:", err);
}