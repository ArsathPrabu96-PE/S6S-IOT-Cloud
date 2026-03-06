import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OnboardingProvider } from './components/OnboardingWizard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OnboardingProvider>
      <App />
    </OnboardingProvider>
  </React.StrictMode>
);
