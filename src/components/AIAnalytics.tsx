import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { Shield, Brain, AlertTriangle, Activity, Database, Cloud, Lock, Mail, Globe, Server, RefreshCw } from 'lucide-react';
import { useSecurityStore } from '../store/securityStore';
import { format } from 'date-fns';
import { analyzeSecurityData } from '../services/ai';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SecurityMetric {
  source: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

interface AnomalyData {
  timestamp: string;
  value: number;
  threshold: number;
}

interface AIPrediction {
  id: string;
  type: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  source: string;
}

export const AIAnalytics: React.FC = () => {
  const { threats, incidents } = useSecurityStore();
  const [activeTab, setActiveTab] = useState<'realtime' | 'anomalies' | 'sources' | 'predictions'>('realtime');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize data
  useEffect(() => {
    const sources = ['Network', 'Application', 'System', 'Cloud', 'Email', 'Endpoint'];
    const initialMetrics = sources.map(source => ({
      source,
      count: Math.floor(Math.random() * 100),
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      confidence: Math.random() * 100
    }));
    setMetrics(initialMetrics);

    // Generate anomaly data
    const now = new Date();
    const anomalyData = Array.from({ length: 24 }).map((_, i) => ({
      timestamp: format(new Date(now.getTime() - i * 3600000), 'HH:mm'),
      value: Math.random() * 100,
      threshold: 75
    }));
    setAnomalies(anomalyData.reverse());

    // Generate initial AI predictions
    generateAIPredictions();
  }, []);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await generateAIPredictions();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIPredictions = async () => {
    try {
      // Analyze recent threats and incidents
      const analysisPromises = [...threats, ...incidents].map(async (item) => {
        const analysis = await analyzeSecurityData({
          type: 'prediction',
          content: {
            type: item.type || item.title,
            description: item.description,
            severity: item.severity,
            source: item.source,
            timestamp: item.timestamp
          }
        });

        return {
          id: item.id,
          type: item.type || item.title,
          prediction: analysis.gemmaAnalysis || analysis.prediction,
          confidence: analysis.confidence,
          timestamp: analysis.timestamp,
          recommendations: analysis.recommendations,
          severity: item.severity,
          source: item.source
        };
      });

      const newPredictions = await Promise.all(analysisPromises);
      setPredictions(newPredictions);
    } catch (error) {
      console.error('Failed to generate AI predictions:', error);
    }
  };

  // Chart data
  const threatData = {
    labels: threats.map(t => format(new Date(t.timestamp), 'HH:mm')),
    datasets: [{
      label: 'Threat Severity',
      data: threats.map(t => t.aiAnalysis?.confidence || 0),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      tension: 0.1
    }]
  };

  const sourceData = {
    labels: metrics.map(m => m.source),
    datasets: [{
      label: 'Security Events',
      data: metrics.map(m => m.count),
      backgroundColor: metrics.map(m => 
        m.severity === 'high' ? 'rgba(255, 99, 132, 0.5)' :
        m.severity === 'medium' ? 'rgba(255, 159, 64, 0.5)' :
        'rgba(75, 192, 192, 0.5)'
      ),
      borderColor: metrics.map(m =>
        m.severity === 'high' ? 'rgb(255, 99, 132)' :
        m.severity === 'medium' ? 'rgb(255, 159, 64)' :
        'rgb(75, 192, 192)'
      ),
      borderWidth: 1
    }]
  };

  const anomalyData = {
    labels: anomalies.map(a => a.timestamp),
    datasets: [
      {
        label: 'Anomaly Score',
        data: anomalies.map(a => a.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'Threshold',
        data: anomalies.map(a => a.threshold),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.1
      }
    ]
  };

  const radarData = {
    labels: ['Network', 'Application', 'System', 'Cloud', 'Email', 'Endpoint'],
    datasets: [{
      label: 'Threat Coverage',
      data: metrics.map(m => m.confidence),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgb(75, 192, 192)',
      pointBackgroundColor: 'rgb(75, 192, 192)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(75, 192, 192)'
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">AI Security Analytics</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Last updated: {format(lastUpdate, 'HH:mm:ss')}
            </span>
            <button
              onClick={refreshData}
              className={`p-2 rounded-full ${isLoading ? 'bg-purple-100' : 'bg-purple-50 hover:bg-purple-100'}`}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 text-purple-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'realtime' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Real-time Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'anomalies' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Anomaly Detection</span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'sources' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Security Sources</span>
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'predictions' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Predictions</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Real-time Analysis */}
          {activeTab === 'realtime' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Trends */}
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-4">Threat Trends</h3>
                  <Line
                    data={threatData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }}
                  />
                </div>

                {/* Security Coverage */}
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-4">Security Coverage</h3>
                  <Radar
                    data={radarData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {metric.source === 'Network' && <Globe className="w-5 h-5 text-blue-600" />}
                        {metric.source === 'Application' && <Server className="w-5 h-5 text-green-600" />}
                        {metric.source === 'System' && <Database className="w-5 h-5 text-purple-600" />}
                        {metric.source === 'Cloud' && <Cloud className="w-5 h-5 text-cyan-600" />}
                        {metric.source === 'Email' && <Mail className="w-5 h-5 text-yellow-600" />}
                        {metric.source === 'Endpoint' && <Lock className="w-5 h-5 text-red-600" />}
                        <span className="font-medium">{metric.source}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        metric.severity === 'high' ? 'bg-red-100 text-red-800' :
                        metric.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {metric.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Events</span>
                        <span>{metric.count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>AI Confidence</span>
                        <span>{metric.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            metric.confidence > 80 ? 'bg-green-500' :
                            metric.confidence > 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${metric.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomaly Detection */}
          {activeTab === 'anomalies' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Anomaly Detection</h3>
                <Line
                  data={anomalyData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>

              {/* Anomaly Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {threats.slice(0, 4).map((threat, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${
                        threat.severity === 'high' ? 'text-red-600' :
                        threat.severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <h4 className="font-medium">{threat.type}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{threat.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {format(new Date(threat.timestamp), 'MMM d, HH:mm')}
                      </span>
                      <span className="font-medium">
                        Confidence: {(threat.aiAnalysis?.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Sources */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Security Events by Source</h3>
                <Bar
                  data={sourceData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>

              {/* Source Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      {metric.source === 'Network' && <Globe className="w-5 h-5 text-blue-600" />}
                      {metric.source === 'Application' && <Server className="w-5 h-5 text-green-600" />}
                      {metric.source === 'System' && <Database className="w-5 h-5 text-purple-600" />}
                      {metric.source === 'Cloud' && <Cloud className="w-5 h-5 text-cyan-600" />}
                      {metric.source === 'Email' && <Mail className="w-5 h-5 text-yellow-600" />}
                      {metric.source === 'Endpoint' && <Lock className="w-5 h-5 text-red-600" />}
                      <h4 className="font-medium">{metric.source} Analytics</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Events</span>
                        <span className="font-medium">{metric.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Severity</span>
                        <span className={`font-medium ${
                          metric.severity === 'high' ? 'text-red-600' :
                          metric.severity === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {metric.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">AI Confidence</span>
                        <span className="font-medium">{metric.confidence.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Predictions */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {predictions.map((prediction, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium">AI Analysis: {prediction.type}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prediction.severity === 'high' ? 'bg-red-100 text-red-800' :
                        prediction.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {prediction.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Prediction:</h5>
                        <p className="text-sm text-gray-600">{prediction.prediction}</p>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</h5>
                        <ul className="space-y-1">
                          {prediction.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Source: {prediction.source}</span>
                          <span className="font-medium">
                            Confidence: {(prediction.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {format(new Date(prediction.timestamp), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {predictions.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No predictions available</p>
                  <p className="text-sm text-gray-400">
                    AI analysis will appear here when new security events are detected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};