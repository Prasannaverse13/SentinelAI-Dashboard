import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAIModels } from './services/ai';

// Initialize the security store to ensure it has data
import { useSecurityStore } from './store/securityStore';

// Fetch initial data
const initializeApp = async () => {
  try {
    // Initialize AI models
    await initializeAIModels();
    
    // Initialize store with mock data for initial render
    const store = useSecurityStore.getState();
    store.fetchThreats();

    // Initialize mock incidents
    const mockIncidents = [
      {
        id: '1',
        title: 'Brute Force Attack',
        description: 'Multiple failed login attempts from suspicious IP',
        status: 'critical',
        aiRecommendations: [
          'Block source IP address',
          'Enable additional authentication factors',
          'Review access logs for pattern analysis'
        ]
      }
    ];

    // Set initial state
    store.handleIncident(mockIncidents[0]);

  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Initialize app before rendering
initializeApp().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});