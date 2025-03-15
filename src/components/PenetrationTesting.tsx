import React, { useState } from 'react';
import { useSecurityStore } from '../store/securityStore';
import { Target, AlertCircle, CheckCircle, Info, Loader2, Shield, AlertTriangle } from 'lucide-react';

export const PenetrationTesting: React.FC = () => {
  const [target, setTarget] = useState('');
  const { vulnerabilities, scanStatus, error, runVulnerabilityScan } = useSecurityStore();

  const exampleTargets = [
    {
      hostname: 'scanme.nmap.org',
      description: 'Official test domain by Nmap for security testing'
    },
    {
      hostname: 'httpbin.org',
      description: 'Public HTTP testing service'
    },
    {
      hostname: 'httpstat.us',
      description: 'HTTP status code testing service'
    }
  ];

  const handleScan = async () => {
    if (!target) return;
    await runVulnerabilityScan(target);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Vulnerability Scanner</h2>
        
        {/* Example Targets Section */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Example Test Targets</h3>
          </div>
          <div className="space-y-3">
            {exampleTargets.map((example, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                <div>
                  <p className="font-medium text-gray-900">{example.hostname}</p>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
                <button
                  onClick={() => setTarget(example.hostname)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-blue-700">
            Note: These are public test services designed for security testing. Always obtain proper authorization before scanning any other targets.
          </p>
        </div>

        {/* Scan Input and Button */}
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter target IP or hostname"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleScan}
            disabled={scanStatus === 'running' || !target}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {scanStatus === 'running' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                <span>Start Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Scan Status */}
        {scanStatus === 'running' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-blue-900">Scanning {target}</p>
              <p className="text-sm text-blue-700">Please wait while we analyze the target...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Scan Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {scanStatus === 'completed' && vulnerabilities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-medium">Scan Results</h3>
            </div>
            
            {vulnerabilities.map((vuln, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(vuln.severity)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <h4 className="font-medium">{vuln.name}</h4>
                    </div>
                    <p className="text-sm mt-1">{vuln.description}</p>
                    
                    {/* Service Information */}
                    {vuln.service && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Service:</span> {vuln.service}
                        {vuln.port && <span className="ml-2">(Port {vuln.port})</span>}
                      </div>
                    )}
                    
                    {/* Severity Badge */}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize`}>
                        {vuln.severity}
                      </span>
                    </div>
                  </div>
                  
                  {/* Exploitable Indicator */}
                  {vuln.exploitable ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>

                {/* AI Analysis Section */}
                {vuln.aiAnalysis && (
                  <div className="mt-3 bg-white bg-opacity-50 p-3 rounded">
                    <p className="text-sm font-medium mb-2">AI Recommendations:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {vuln.aiAnalysis.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                    {vuln.aiAnalysis.mitigation && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Mitigation Strategy:</p>
                        <p className="text-sm">{vuln.aiAnalysis.mitigation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Vulnerabilities Found */}
        {scanStatus === 'completed' && vulnerabilities.length === 0 && (
          <div className="p-4 bg-green-50 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Scan Complete</p>
              <p className="text-sm text-green-700">No vulnerabilities were detected in the target.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};