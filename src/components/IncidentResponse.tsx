import React, { useEffect, useState } from 'react';
import { useSecurityStore } from '../store/securityStore';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Info, 
  Shield, 
  AlertTriangle, 
  Brain, 
  Activity, 
  Power,
  Database,
  Radio,
  Shield as ShieldIcon,
  Globe,
  Cloud,
  Mail,
  Plus,
  X
} from 'lucide-react';

interface MonitoringSourceInfo {
  name: string;
  icon: React.ReactNode;
  description: string;
  fullName: string;
  inputPlaceholder: string;
  inputLabel: string;
}

export const IncidentResponse: React.FC = () => {
  const { 
    incidents, 
    handleIncident, 
    startMonitoring, 
    stopMonitoring,
    monitoringTargets,
    addMonitoringTarget,
    removeMonitoringTarget,
    toggleMonitoringTarget
  } = useSecurityStore();

  const [newTarget, setNewTarget] = useState<Record<string, string>>({
    siem: '',
    ids: '',
    edr: '',
    waf: '',
    cloud: '',
    email: ''
  });

  const monitoringSourcesInfo: Record<string, MonitoringSourceInfo> = {
    siem: {
      name: 'SIEM',
      icon: <Database className="w-6 h-6 text-blue-600" />,
      description: 'Security Information and Event Management - Collects and analyzes log data across your infrastructure.',
      fullName: 'Security Information and Event Management',
      inputPlaceholder: 'Enter log source path (e.g., /var/log/auth.log)',
      inputLabel: 'Log Source Path'
    },
    ids: {
      name: 'IDS',
      icon: <Radio className="w-6 h-6 text-purple-600" />,
      description: 'Intrusion Detection System - Monitors network traffic for suspicious activity.',
      fullName: 'Intrusion Detection System',
      inputPlaceholder: 'Enter network interface (e.g., eth0)',
      inputLabel: 'Network Interface'
    },
    edr: {
      name: 'EDR',
      icon: <ShieldIcon className="w-6 h-6 text-green-600" />,
      description: 'Endpoint Detection and Response - Monitors endpoints for suspicious activities.',
      fullName: 'Endpoint Detection and Response',
      inputPlaceholder: 'Enter endpoint hostname or IP',
      inputLabel: 'Endpoint Address'
    },
    waf: {
      name: 'WAF',
      icon: <Globe className="w-6 h-6 text-orange-600" />,
      description: 'Web Application Firewall - Protects web applications by filtering HTTP traffic.',
      fullName: 'Web Application Firewall',
      inputPlaceholder: 'Enter domain to protect (e.g., example.com)',
      inputLabel: 'Domain'
    },
    cloud: {
      name: 'Cloud',
      icon: <Cloud className="w-6 h-6 text-cyan-600" />,
      description: 'Cloud Security Monitoring - Monitors cloud infrastructure and services.',
      fullName: 'Cloud Security Monitoring',
      inputPlaceholder: 'Enter cloud resource ID or ARN',
      inputLabel: 'Resource Identifier'
    },
    email: {
      name: 'Email',
      icon: <Mail className="w-6 h-6 text-yellow-600" />,
      description: 'Email Security - Monitors email traffic for threats.',
      fullName: 'Email Security Monitoring',
      inputPlaceholder: 'Enter email domain or address to monitor',
      inputLabel: 'Email Domain/Address'
    }
  };

  // Start monitoring when component mounts
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const handleAddTarget = (source: string) => {
    if (!newTarget[source].trim()) return;
    
    addMonitoringTarget(source, newTarget[source].trim());
    setNewTarget(prev => ({ ...prev, [source]: '' }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Get targets for a specific source
  const getSourceTargets = (source: string) => {
    return monitoringTargets.filter(target => target.source === source);
  };

  return (
    <div className="space-y-6">
      {/* Monitoring Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Power className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Security Monitoring Control Panel</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Real-time monitoring active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(monitoringSourcesInfo).map(([key, info]) => (
            <div key={key} className="p-4 rounded-lg border bg-white">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">{info.icon}</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{info.name}</h3>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mt-1">{info.fullName}</p>
                  <p className="text-sm text-gray-600 mt-2">{info.description}</p>
                  
                  {/* Input Section */}
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {info.inputLabel}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTarget[key]}
                        onChange={(e) => setNewTarget(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={info.inputPlaceholder}
                        className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleAddTarget(key)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Target List */}
                    {getSourceTargets(key).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Monitored Targets:</p>
                        {getSourceTargets(key).map((target) => (
                          <div key={target.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${target.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-sm text-gray-600">{target.target}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleMonitoringTarget(target.id)}
                                className={`p-1 rounded ${target.enabled ? 'text-green-600' : 'text-gray-400'}`}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeMonitoringTarget(target.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Incidents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Active Incidents</h2>
        <div className="space-y-4">
          {incidents.map((incident, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(incident.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{incident.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {incident.source}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{incident.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Detected: {new Date(incident.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleIncident(incident)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Handle</span>
                </button>
              </div>
              {incident.aiRecommendations && (
                <div className="mt-3 bg-gray-50 p-3 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">AI Analysis & Response Plan:</p>
                  </div>
                  <div className="mt-2 space-y-2">
                    {incident.aiRecommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full" />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No active incidents detected</p>
              <p className="text-sm">The system is actively monitoring for security events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};