import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import type { SecurityMetrics } from '../types';

interface MetricsPanelProps {
  metrics: SecurityMetrics;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Active Threats</p>
            <h3 className="text-2xl font-bold text-red-600">{metrics.activeThreats}</h3>
          </div>
          <AlertTriangle className="text-red-600 w-8 h-8" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Resolved Incidents</p>
            <h3 className="text-2xl font-bold text-green-600">{metrics.resolvedIncidents}</h3>
          </div>
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Ongoing Scans</p>
            <h3 className="text-2xl font-bold text-blue-600">{metrics.ongoingScans}</h3>
          </div>
          <Activity className="text-blue-600 w-8 h-8" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Risk Level</p>
            <h3 className="text-2xl font-bold text-orange-600 capitalize">{metrics.riskLevel}</h3>
          </div>
          <Shield className="text-orange-600 w-8 h-8" />
        </div>
      </div>
    </div>
  );
};