import { securityApi } from './api';
import * as tf from '@tensorflow/tfjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemma model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

// Initialize anomaly detection model
let anomalyModel: tf.LayersModel | null = null;

export const initializeAIModels = async () => {
  try {
    // Create and compile anomaly detection model
    anomalyModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    anomalyModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    console.log('AI models initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AI models:', error);
    throw error;
  }
};

export const analyzeSecurityData = async (data: any) => {
  try {
    // First, get AI analysis from backend
    const backendAnalysis = await securityApi.analyzeWithAI(data);

    // Then, perform local analysis with Gemma
    const prompt = `Analyze this security event and provide recommendations:
      Type: ${data.type}
      Description: ${data.content}
      Context: Security analysis for threat detection and response`;

    const result = await model.generateContent(prompt);
    const gemmaResponse = result.response.text();

    // Combine backend and local analysis
    return {
      ...backendAnalysis,
      gemmaAnalysis: gemmaResponse,
      timestamp: new Date().toISOString(),
      confidence: calculateConfidenceScore(backendAnalysis, gemmaResponse)
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return fallbackAnalysis(data);
  }
};

const calculateConfidenceScore = (backendAnalysis: any, gemmaResponse: string): number => {
  // Implement confidence scoring logic
  const baseConfidence = backendAnalysis.confidence || 0.5;
  const gemmaConfidence = gemmaResponse.length > 100 ? 0.8 : 0.4;
  return (baseConfidence + gemmaConfidence) / 2;
};

const fallbackAnalysis = (data: any) => {
  return {
    prediction: "Unable to perform complete analysis. Using fallback mode.",
    confidence: 0.5,
    recommendations: [
      "Monitor system activity",
      "Review security logs",
      "Enable additional security controls"
    ],
    timestamp: new Date().toISOString()
  };
};

export const trainAnomalyDetector = async (trainingData: any[]) => {
  if (!anomalyModel) {
    throw new Error('Anomaly detection model not initialized');
  }

  try {
    const features = [];
    const labels = [];

    for (const sample of trainingData) {
      const extractedFeatures = extractFeatures(sample);
      features.push(extractedFeatures);
      labels.push(sample.isAnomaly ? 1 : 0);
    }

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    await anomalyModel.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    });

    xs.dispose();
    ys.dispose();

    console.log('Anomaly detector training completed');
  } catch (error) {
    console.error('Failed to train anomaly detector:', error);
    throw error;
  }
};

const extractFeatures = (data: any): number[] => {
  const features = [];
  
  if (data.type === 'threat_analysis') {
    const content = data.content;
    
    const severityScore = content.severity === 'high' ? 1 :
                         content.severity === 'medium' ? 0.5 : 0;
    
    const timestamp = new Date(content.timestamp);
    const hourOfDay = timestamp.getHours() / 24;
    const dayOfWeek = timestamp.getDay() / 7;
    
    const typeLength = content.type.length / 100;
    const descriptionLength = (content.description?.length || 0) / 1000;
    
    features.push(
      severityScore,
      hourOfDay,
      dayOfWeek,
      typeLength,
      descriptionLength
    );
  }
  
  while (features.length < 10) {
    features.push(0);
  }
  
  return features;
};