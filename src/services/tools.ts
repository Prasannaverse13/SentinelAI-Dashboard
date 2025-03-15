import { securityApi } from './api';

export const getIndicators = async (type: string) => {
  try {
    return await securityApi.getIndicators(type);
  } catch (error) {
    console.error('Threat Intelligence Error:', error);
    return [];
  }
};

export const queryLogs = async (query: string) => {
  try {
    return await securityApi.getLogs(query);
  } catch (error) {
    console.error('SIEM Error:', error);
    return { hits: { hits: [] } };
  }
};

export const getAlerts = async () => {
  try {
    return await securityApi.getAlerts();
  } catch (error) {
    console.error('IDS Error:', error);
    return [];
  }
};

export const queryEndpoints = async () => {
  try {
    return await securityApi.getEndpointStatus();
  } catch (error) {
    console.error('Endpoint Security Error:', error);
    return [];
  }
};

export const createIncident = async (incident: any) => {
  try {
    return await securityApi.createIncident(incident);
  } catch (error) {
    console.error('Incident Management Error:', error);
    return null;
  }
};

export const updateIncident = async (id: string, update: any) => {
  try {
    return await securityApi.updateIncident(id, update);
  } catch (error) {
    console.error('Incident Update Error:', error);
    return null;
  }
};