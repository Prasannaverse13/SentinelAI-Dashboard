import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { analyzeSecurityData, initializeAIModels, trainAnomalyDetector } from '../services/ai';
import { queryLogs, getAlerts, queryEndpoints, createIncident, updateIncident } from '../services/tools';

interface MonitoringTarget {
  id: string;
  source: string;
  target: string;
  enabled: boolean;
  timestamp: string;
}

interface SecurityState {
  threats: any[];
  incidents: any[];
  vulnerabilities: any[];
  monitoringTargets: MonitoringTarget[];
  scanStatus: string;
  loading: boolean;
  error: string | null;
  monitoringSources: {
    siem: boolean;
    ids: boolean;
    edr: boolean;
    waf: boolean;
    cloud: boolean;
    email: boolean;
  };
  fetchThreats: () => Promise<void>;
  runVulnerabilityScan: (target: string) => Promise<void>;
  handleIncident: (incident: any) => Promise<void>;
  analyzeWithAI: (data: any) => Promise<any>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  addThreat: (threat: any) => void;
  initializeAI: () => Promise<void>;
  addMonitoringTarget: (source: string, target: string) => void;
  removeMonitoringTarget: (id: string) => void;
  toggleMonitoringTarget: (id: string) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      threats: [],
      incidents: [],
      vulnerabilities: [],
      monitoringTargets: [],
      scanStatus: 'idle',
      loading: false,
      error: null,
      monitoringSources: {
        siem: false,
        ids: false,
        edr: false,
        waf: false,
        cloud: false,
        email: false,
      },

      addMonitoringTarget: (source: string, target: string) => {
        const newTarget: MonitoringTarget = {
          id: Date.now().toString(),
          source,
          target,
          enabled: true,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          monitoringTargets: [...state.monitoringTargets, newTarget]
        }));

        // Create incident for new target
        createIncident({
          title: `New Monitoring Target Added`,
          description: `Started monitoring ${target} via ${source}`,
          source,
          severity: 'low',
          status: 'active',
          timestamp: new Date().toISOString()
        });
      },

      removeMonitoringTarget: (id: string) => {
        set(state => ({
          monitoringTargets: state.monitoringTargets.filter(target => target.id !== id)
        }));
      },

      toggleMonitoringTarget: (id: string) => {
        set(state => ({
          monitoringTargets: state.monitoringTargets.map(target =>
            target.id === id ? { ...target, enabled: !target.enabled } : target
          )
        }));
      },

      initializeAI: async () => {
        try {
          await initializeAIModels();
          
          const initialTrainingData = [
            {
              type: 'threat_analysis',
              content: {
                type: 'Brute Force Attack',
                description: 'Multiple failed login attempts detected',
                severity: 'high',
                timestamp: new Date().toISOString(),
                source: 'firewall'
              },
              isAnomaly: true
            }
          ];
          
          await trainAnomalyDetector(initialTrainingData);
        } catch (error) {
          console.error('Failed to initialize AI:', error);
          set({ error: 'Failed to initialize AI models' });
        }
      },

      addThreat: async (threat) => {
        try {
          const aiAnalysis = await analyzeSecurityData({
            type: 'threat_analysis',
            content: threat
          });

          const enrichedThreat = {
            ...threat,
            aiAnalysis,
            timestamp: new Date().toISOString()
          };

          set(state => ({
            threats: [enrichedThreat, ...state.threats].slice(0, 10)
          }));

          if (aiAnalysis.confidence > 0.9) {
            await get().handleIncident({
              ...enrichedThreat,
              status: 'critical',
              aiRecommendations: aiAnalysis.recommendations
            });
          }
        } catch (error) {
          console.error('Failed to process threat:', error);
        }
      },

      startMonitoring: () => {
        const monitoringInterval = setInterval(async () => {
          try {
            const [logResults, idsAlerts, endpointAlerts] = await Promise.all([
              queryLogs('security_events'),
              getAlerts(),
              queryEndpoints('security_status')
            ]);

            const processAlerts = async (alerts: any[], source: string) => {
              for (const alert of alerts) {
                const threat = {
                  id: Date.now().toString(),
                  type: alert.type || alert._source?.alert_type,
                  severity: alert.severity || alert._source?.severity,
                  source: source,
                  timestamp: new Date().toISOString(),
                  description: alert.description || alert._source?.description,
                  status: 'active'
                };

                await get().addThreat(threat);
              }
            };

            await Promise.all([
              processAlerts(logResults.hits.hits, 'SIEM'),
              processAlerts(idsAlerts, 'IDS'),
              processAlerts(endpointAlerts, 'EDR')
            ]);

          } catch (error) {
            console.error('Monitoring error:', error);
          }
        }, 10000);

        (window as any).monitoringInterval = monitoringInterval;
        
        set(state => ({
          monitoringSources: {
            ...state.monitoringSources,
            siem: true,
            ids: true,
            edr: true,
            waf: true,
            cloud: true,
            email: true
          }
        }));
      },

      stopMonitoring: () => {
        if ((window as any).monitoringInterval) {
          clearInterval((window as any).monitoringInterval);
        }

        set({ 
          monitoringSources: {
            siem: false,
            ids: false,
            edr: false,
            waf: false,
            cloud: false,
            email: false,
          }
        });
      },

      fetchThreats: async () => {
        set({ loading: true });
        try {
          const [logResults, idsAlerts, endpointAlerts] = await Promise.all([
            queryLogs('security_events'),
            getAlerts(),
            queryEndpoints('security_status')
          ]);

          const threats = [
            ...logResults.hits.hits.map((hit: any) => ({
              id: Date.now().toString(),
              type: hit._source.alert_type,
              severity: hit._source.severity,
              source: 'SIEM',
              timestamp: new Date().toISOString(),
              description: hit._source.description,
              status: 'active'
            })),
            ...idsAlerts.map((alert: any) => ({
              id: (Date.now() + 1).toString(),
              type: alert.type,
              severity: alert.severity,
              source: 'IDS',
              timestamp: new Date().toISOString(),
              description: alert.description,
              status: 'active'
            }))
          ];

          const enrichedThreats = await Promise.all(
            threats.map(async (threat) => {
              const aiAnalysis = await analyzeSecurityData({
                type: 'threat_analysis',
                content: threat
              });

              return {
                ...threat,
                aiAnalysis
              };
            })
          );

          set({ threats: enrichedThreats, loading: false });
        } catch (error) {
          set({ error: 'Failed to fetch threats', loading: false });
        }
      },

      runVulnerabilityScan: async (target: string) => {
        set({ scanStatus: 'running', vulnerabilities: [], error: null });
        try {
          const aiAnalysis = await analyzeSecurityData({
            type: 'vulnerability_scan',
            content: { target }
          });

          set({ 
            vulnerabilities: [{
              name: 'AI Security Analysis',
              description: aiAnalysis.nvidiaPrediction,
              severity: aiAnalysis.confidence > 0.8 ? 'high' : aiAnalysis.confidence > 0.5 ? 'medium' : 'low',
              aiAnalysis: {
                recommendations: aiAnalysis.recommendations,
                confidence: aiAnalysis.confidence
              }
            }],
            scanStatus: 'completed'
          });
        } catch (error: any) {
          set({ 
            error: `Scan failed: ${error.message}`,
            scanStatus: 'failed'
          });
        }
      },

      handleIncident: async (incident) => {
        try {
          const aiAnalysis = await analyzeSecurityData({
            type: 'incident_analysis',
            content: incident
          });

          const enrichedIncident = {
            ...incident,
            status: 'resolved',
            aiRecommendations: [
              ...(incident.aiRecommendations || []),
              ...aiAnalysis.recommendations
            ]
          };

          set(state => ({ 
            incidents: state.incidents.map(inc => 
              inc.id === incident.id ? enrichedIncident : inc
            )
          }));
        } catch (error) {
          set({ error: 'Failed to handle incident' });
        }
      },

      analyzeWithAI: async (data) => {
        try {
          return await analyzeSecurityData(data);
        } catch (error) {
          console.error('AI analysis failed:', error);
          throw error;
        }
      }
    }),
    {
      name: 'security-store',
      partialize: (state) => ({
        monitoringSources: state.monitoringSources,
        monitoringTargets: state.monitoringTargets,
        incidents: state.incidents
      })
    }
  )
);

// Initialize AI models when the store is created
useSecurityStore.getState().initializeAI();