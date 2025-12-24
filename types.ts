
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  category: 'Cabelo' | 'Unhas' | 'Estética' | 'Maquiagem';
}

export interface Appointment {
  id: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO string
  time: string; // HH:mm
  status: 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado';
  price: number;
  createdAt?: string;
}

export interface IncomingMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  processed: boolean;
  detectedBooking?: any;
}

export interface DbConfig {
  supabaseUrl: string;
  supabaseKey: string;
  isConnected: boolean;
}

export interface InstanceConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  provider: 'local' | 'evolution' | 'z-api' | 'cloud-demo';
}

export interface SalonConfig {
  name: string;
  niche: string;
  setupComplete: boolean;
  instance?: InstanceConfig;
  db?: DbConfig;
}

export type View = 'dashboard' | 'appointments' | 'whatsapp' | 'analytics' | 'connection' | 'onboarding' | 'settings' | 'cloud' | 'video_presentation';
