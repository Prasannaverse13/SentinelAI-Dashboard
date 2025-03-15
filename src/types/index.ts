export interface SecurityMetrics {
  activeThreats: number;
  resolvedIncidents: number;
  ongoingScans: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ThreatData {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  source: string;
  timestamp: string;
  description: string;
  status: 'active' | 'contained' | 'resolved';
}

export interface AIAnalysis {
  prediction: string;
  confidence: number;
  recommendations: string[];
}