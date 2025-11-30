
export type Page = 'home' | 'upload' | 'analytics' | 'chat' | 'settings' | 'login' | 'signup' | 'forgot-password';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi' | 'kn' | 'te';

export interface ConfidenceScore {
  disease: string;
  confidence: number;
}

export interface DetectionResult {
  disease_name: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  analysis_reasoning: string;
  recommended_treatment: {
    curative: string;
    preventive: string;
  };
  confidence_scores: ConfidenceScore[];
  location?: {
    village: string;
    district: string;
    latitude: string;
    longitude: string;
  };
}

export interface HistoryEntry {
  id: string;
  date: string;
  plantType: string;
  imageUrl: string;
  result: DetectionResult;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  name: string;
  email: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'success' | 'info' | 'warning' | 'error';
}
