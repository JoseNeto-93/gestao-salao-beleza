
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
}

export interface IncomingMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  processed: boolean;
  detectedBooking?: any;
}

export type View = 'dashboard' | 'appointments' | 'whatsapp' | 'analytics' | 'connection';
