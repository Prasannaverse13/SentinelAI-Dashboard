import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { ThreatData } from '../types';

interface ThreatsListProps {
  threats: ThreatData[];
}

export const ThreatsList: React.FC<ThreatsListProps> = ({ threats }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="text-red-500 w-5 h-5" />;
      case 'contained':
        return <Clock className="text-yellow-500 w-5 h-5" />;
      case 'resolved':
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      default:
        return null;
    }
  };

  // Function to format relative time
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Threats</h2>
      <div className="space-y-4">
        {threats.map((threat) => (
          <div key={threat.id} className="border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(threat.status)}
                <div>
                  <h3 className="font-medium">{threat.type}</h3>
                  <p className="text-sm text-gray-500">{threat.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                  ${threat.severity === 'high' ? 'bg-red-100 text-red-800' :
                    threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}`}>
                  {threat.severity.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 mt-1">{getRelativeTime(threat.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};