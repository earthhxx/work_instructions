import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Worker } from '@react-pdf-viewer/core';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Worker workerUrl="/pdf.worker.min.js">
      <App />
    </Worker>
  </StrictMode>,
);
