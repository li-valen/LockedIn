import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';

console.log('LockedIn popup script loaded');

const container = document.getElementById('root');
if (!container) {
  console.error('Failed to find the root element');
  throw new Error('Failed to find the root element');
}

console.log('Creating React root...');
const root = createRoot(container);
console.log('Rendering App component...');
root.render(<App />);
console.log('App component rendered successfully');
