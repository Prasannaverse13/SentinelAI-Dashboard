import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, AlertTriangle, Target, AlertOctagon, Brain, Activity, Sun, Moon } from 'lucide-react';
import { MetricsPanel } from './components/MetricsPanel';
import { ThreatsList } from './components/ThreatsList';
import { ThreatDetection } from './components/ThreatDetection';
import { PenetrationTesting } from './components/PenetrationTesting';
import { IncidentResponse } from './components/IncidentResponse';
import { AIAnalytics } from './components/AIAnalytics';
import { useThemeStore } from './store/themeStore';
import { useSecurityStore } from './store/securityStore';

const mockMetrics = {
  activeThreats: 3,
  resolvedIncidents: 127,
  ongoingScans: 2,
  riskLevel: 'medium' as const
};

function App() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { threats } = useSecurityStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SentinelAI Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-4">
                  <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md flex items-center">
                    <Activity className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link to="/threats" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Threat Detection
                  </Link>
                  <Link to="/pentest" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Penetration Testing
                  </Link>
                  <Link to="/incidents" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md flex items-center">
                    <AlertOctagon className="w-4 h-4 mr-1" />
                    Incident Response
                  </Link>
                  <Link to="/ai-analytics" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md flex items-center">
                    <Brain className="w-4 h-4 mr-1" />
                    AI Analytics
                  </Link>
                </nav>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={
              <>
                <MetricsPanel metrics={mockMetrics} />
                <div className="mt-6">
                  <ThreatsList threats={threats} />
                </div>
              </>
            } />
            <Route path="/threats" element={<ThreatDetection />} />
            <Route path="/pentest" element={<PenetrationTesting />} />
            <Route path="/incidents" element={<IncidentResponse />} />
            <Route path="/ai-analytics" element={<AIAnalytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;