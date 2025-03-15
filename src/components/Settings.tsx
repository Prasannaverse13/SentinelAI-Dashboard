import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Brain, 
  Database, 
  Users, 
  Key, 
  Save,
  AlertTriangle,
  Sliders,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

interface AIModelConfig {
  name: string;
  enabled: boolean;
  apiKey: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
}

interface DataSourceConfig {
  name: string;
  enabled: boolean;
  endpoint: string;
  apiKey: string;
  refreshInterval: number;
}

interface UserRole {
  name: string;
  permissions: string[];
}

export const Settings: React.FC = () => {
  // AI Model Configuration
  const [aiModels, setAiModels] = useState<AIModelConfig[]>([
    {
      name: 'NVIDIA RAPIDS',
      enabled: true,
      apiKey: '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',
      parameters: {
        temperature: 0.7,
        maxTokens: 512,
        topP: 0.9
      }
    },
    {
      name: 'Google Gemma-3-27B-IT',
      enabled: true,
      apiKey: '',
      parameters: {
        temperature: 0.2,
        maxTokens: 512,
        topP: 0.7
      }
    }
  ]);

  // Data Source Configuration
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([
    {
      name: 'AlienVault OTX',
      enabled: true,
      endpoint: 'https://otx.alienvault.com/api/v1',
      apiKey: '',
      refreshInterval: 300
    },
    {
      name: 'VirusTotal',
      enabled: true,
      endpoint: 'https://www.virustotal.com/vtapi/v2',
      apiKey: '',
      refreshInterval: 600
    }
  ]);

  // User Roles Configuration
  const [roles, setRoles] = useState<UserRole[]>([
    {
      name: 'Administrator',
      permissions: ['manage_settings', 'manage_users', 'view_all', 'modify_all']
    },
    {
      name: 'Security Analyst',
      permissions: ['view_all', 'modify_incidents', 'run_scans']
    },
    {
      name: 'IT Staff',
      permissions: ['view_incidents', 'report_threats']
    }
  ]);

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('ai');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const updateAIModel = (index: number, updates: Partial<AIModelConfig>) => {
    setAiModels(prev => prev.map((model, i) => 
      i === index ? { ...model, ...updates } : model
    ));
  };

  const updateDataSource = (index: number, updates: Partial<DataSourceConfig>) => {
    setDataSources(prev => prev.map((source, i) => 
      i === index ? { ...source, ...updates } : source
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-6">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Security Settings</h2>
        </div>

        {/* Settings Navigation */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-2 px-4 ${activeTab === 'ai' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500'}`}
          >
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Models</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2 px-4 ${activeTab === 'data' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500'}`}
          >
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Data Sources</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-2 px-4 ${activeTab === 'roles' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500'}`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Roles</span>
            </div>
          </button>
        </div>

        {/* AI Models Configuration */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {aiModels.map((model, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="font-medium">{model.name}</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={model.enabled}
                        onChange={(e) => updateAIModel(index, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <input
                            type={showApiKeys[model.name] ? 'text' : 'password'}
                            value={model.apiKey}
                            onChange={(e) => updateAIModel(index, { apiKey: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => toggleApiKeyVisibility(model.name)}
                            className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                          >
                            {showApiKeys[model.name] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={model.parameters.temperature}
                          onChange={(e) => updateAIModel(index, {
                            parameters: {
                              ...model.parameters,
                              temperature: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">
                          {model.parameters.temperature}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          value={model.parameters.maxTokens}
                          onChange={(e) => updateAIModel(index, {
                            parameters: {
                              ...model.parameters,
                              maxTokens: parseInt(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Top P
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={model.parameters.topP}
                          onChange={(e) => updateAIModel(index, {
                            parameters: {
                              ...model.parameters,
                              topP: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">
                          {model.parameters.topP}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Sources Configuration */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {dataSources.map((source, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium">{source.name}</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={source.enabled}
                        onChange={(e) => updateDataSource(index, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={source.endpoint}
                        onChange={(e) => updateDataSource(index, { endpoint: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKeys[source.name] ? 'text' : 'password'}
                          value={source.apiKey}
                          onChange={(e) => updateDataSource(index, { apiKey: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => toggleApiKeyVisibility(source.name)}
                          className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                          {showApiKeys[source.name] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refresh Interval (seconds)
                      </label>
                      <input
                        type="number"
                        value={source.refreshInterval}
                        onChange={(e) => updateDataSource(index, { refreshInterval: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Roles Configuration */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            {roles.map((role, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium">{role.name}</h3>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Permissions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {role.permissions.map((permission, pIndex) => (
                      <div key={pIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span>{permission.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex items-center justify-end space-x-4">
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Failed to save settings
            </div>
          )}
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="w-4 h-4 mr-1" />
              Settings saved successfully
            </div>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-400"
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};