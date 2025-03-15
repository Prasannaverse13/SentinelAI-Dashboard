import React, { useState, useEffect } from 'react';
import { useSecurityStore } from '../store/securityStore';
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Brain,
  Send,
  X,
  ThumbsUp,
  ThumbsDown,
  Settings,
  AlertOctagon
} from 'lucide-react';

interface ManualReport {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface ThreatAlert {
  id: string;
  type: string;
  description: string;
  source: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'confirmed' | 'false_positive';
  aiAnalysis?: {
    confidence: number;
    recommendations: string[];
  };
}

export const ThreatDetection: React.FC = () => {
  const { threats, loading, error, analyzeWithAI } = useSecurityStore();
  const [showReportForm, setShowReportForm] = useState(false);
  const [manualReport, setManualReport] = useState<ManualReport>({
    type: '',
    description: '',
    severity: 'medium'
  });
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoBlockThreshold: 90,
    notifyOnlyHigh: false,
    excludedIPs: [] as string[],
    excludedIP: ''
  });

  useEffect(() => {
    // Convert existing threats to alerts format
    const initialAlerts = threats.map(threat => ({
      id: threat.id,
      type: threat.type,
      description: threat.description,
      source: threat.source,
      timestamp: threat.timestamp,
      severity: threat.severity,
      status: 'pending',
      aiAnalysis: threat.aiAnalysis
    }));
    setAlerts(initialAlerts);
  }, [threats]);

  const handleManualReport = async () => {
    if (!manualReport.type || !manualReport.description) return;

    try {
      const aiAnalysis = await analyzeWithAI({
        type: 'threat_analysis',
        content: {
          type: manualReport.type,
          description: manualReport.description,
          severity: manualReport.severity
        }
      });

      const newAlert: ThreatAlert = {
        id: Date.now().toString(),
        ...manualReport,
        source: 'manual_report',
        timestamp: new Date().toISOString(),
        status: 'pending',
        aiAnalysis: {
          confidence: aiAnalysis.confidence,
          recommendations: aiAnalysis.recommendations
        }
      };

      setAlerts(prev => [newAlert, ...prev]);
      setShowReportForm(false);
      setManualReport({ type: '', description: '', severity: 'medium' });
    } catch (error) {
      console.error('Failed to process manual report:', error);
    }
  };

  const handleAlertResponse = async (alertId: string, confirmed: boolean) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: confirmed ? 'confirmed' : 'false_positive'
        };
      }
      return alert;
    }));

    if (confirmed && settings.autoBlockThreshold <= 90) {
      // Simulate blocking action
      console.log('Blocking threat automatically...');
    }
  };

  const handleExcludeIP = () => {
    if (settings.excludedIP && !settings.excludedIPs.includes(settings.excludedIP)) {
      setSettings(prev => ({
        ...prev,
        excludedIPs: [...prev.excludedIPs, prev.excludedIP],
        excludedIP: ''
      }));
    }
  };

  const removeExcludedIP = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      excludedIPs: prev.excludedIPs.filter(excludedIP => excludedIP !== ip)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Manual Report Button and Settings */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowReportForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Report Suspicious Activity</span>
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <Settings className="w-5 h-5" />
          <span>Detection Settings</span>
        </button>
      </div>

      {/* Manual Report Form */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Report Suspicious Activity</h3>
              <button onClick={() => setShowReportForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Activity
                </label>
                <input
                  type="text"
                  value={manualReport.type}
                  onChange={(e) => setManualReport(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g., Suspicious Login, Phishing Email"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={manualReport.description}
                  onChange={(e) => setManualReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the suspicious activity in detail..."
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={manualReport.severity}
                  onChange={(e) => setManualReport(prev => ({ ...prev, severity: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                onClick={handleManualReport}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detection Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-block Threshold (Confidence %)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.autoBlockThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoBlockThreshold: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{settings.autoBlockThreshold}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifyOnlyHigh}
                  onChange={(e) => setSettings(prev => ({ ...prev, notifyOnlyHigh: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <label className="text-sm text-gray-700">
                  Only notify for high-confidence threats
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exclude IP Address
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={settings.excludedIP}
                    onChange={(e) => setSettings(prev => ({ ...prev, excludedIP: e.target.value }))}
                    placeholder="Enter IP address"
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleExcludeIP}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {settings.excludedIPs.map((ip) => (
                    <div key={ip} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{ip}</span>
                      <button
                        onClick={() => removeExcludedIP(ip)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Threat Alerts</h2>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`border rounded-lg p-4 ${
              alert.status === 'confirmed' ? 'bg-red-50 border-red-200' :
              alert.status === 'false_positive' ? 'bg-green-50 border-green-200' :
              'bg-white'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {alert.severity === 'high' ? (
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                  ) : alert.severity === 'medium' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600" />
                  )}
                  <div>
                    <h3 className="font-medium">{alert.type}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        Source: {alert.source}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {alert.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAlertResponse(alert.id, true)}
                      className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      title="Confirm Threat"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAlertResponse(alert.id, false)}
                      className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      title="Mark as False Positive"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {alert.aiAnalysis && (
                <div className="mt-3 bg-gray-50 p-3 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">AI Analysis</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Confidence: {(alert.aiAnalysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {alert.aiAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {alert.status !== 'pending' && (
                <div className="mt-3 flex items-center space-x-2">
                  {alert.status === 'confirmed' ? (
                    <>
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        Confirmed Threat - Action Taken
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Marked as False Positive
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No threats detected</p>
              <p className="text-sm text-gray-400">
                The system is actively monitoring for security threats
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};