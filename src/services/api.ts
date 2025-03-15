import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 10000
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data for development
const mockData = {
  logs: {
    hits: {
      hits: [
        {
          _source: {
            alert_type: 'Suspicious Login Attempt',
            severity: 'high',
            description: 'Multiple failed login attempts detected from unusual IP',
            timestamp: new Date().toISOString()
          }
        },
        {
          _source: {
            alert_type: 'Malware Detection',
            severity: 'medium',
            description: 'Potential ransomware signature detected',
            timestamp: new Date().toISOString()
          }
        }
      ]
    }
  },
  alerts: [
    {
      type: 'Data Exfiltration Attempt',
      severity: 'high',
      description: 'Unusual outbound data transfer detected',
      timestamp: new Date().toISOString()
    }
  ],
  endpoints: [
    {
      type: 'System Anomaly',
      severity: 'medium',
      description: 'Unusual process activity detected',
      timestamp: new Date().toISOString()
    }
  ]
};

// Security API endpoints with fallback to mock data
export const securityApi = {
  // SIEM Operations
  getLogs: async (query: string) => {
    try {
      const response = await api.get(`/siem/logs`, { params: { query } });
      return response.data;
    } catch (error) {
      console.warn('Using mock SIEM data due to API error:', error);
      return mockData.logs;
    }
  },
  
  // IDS Operations
  getAlerts: async () => {
    try {
      const response = await api.get('/ids/alerts');
      return response.data;
    } catch (error) {
      console.warn('Using mock IDS data due to API error:', error);
      return mockData.alerts;
    }
  },
  
  // Vulnerability Scanner
  scanTarget: async (target: string) => {
    try {
      const response = await api.post('/scanner/scan', { target });
      return response.data;
    } catch (error) {
      throw new Error('Vulnerability scan failed. Please try again later.');
    }
  },
  
  // Threat Intelligence
  getIndicators: async (type: string) => {
    try {
      const response = await api.get(`/intel/indicators/${type}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  // Endpoint Security
  getEndpointStatus: async () => {
    try {
      const response = await api.get('/endpoint/status');
      return response.data;
    } catch (error) {
      console.warn('Using mock endpoint data due to API error:', error);
      return mockData.endpoints;
    }
  },
  
  // Incident Management
  createIncident: async (incident: any) => {
    try {
      const response = await api.post('/incidents', incident);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create incident. Please try again.');
    }
  },
  
  updateIncident: async (id: string, update: any) => {
    try {
      const response = await api.put(`/incidents/${id}`, update);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update incident. Please try again.');
    }
  },
  
  // AI Analysis
  analyzeWithAI: async (data: any) => {
    try {
      const response = await api.post('/ai/analyze', data);
      return response.data;
    } catch (error) {
      // Return a basic analysis when AI service is unavailable
      return {
        prediction: "Unable to perform AI analysis at this time",
        confidence: 0.5,
        recommendations: [
          "Continue monitoring system activity",
          "Review security logs manually",
          "Follow standard security protocols"
        ],
        timestamp: new Date().toISOString()
      };
    }
  }
};

// Error handling middleware
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);