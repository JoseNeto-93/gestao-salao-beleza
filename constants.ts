
import { Service } from './types';

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte Feminino', price: 120, duration: 60, category: 'Cabelo' },
  { id: '2', name: 'Escova Modeladora', price: 80, duration: 45, category: 'Cabelo' },
  { id: '3', name: 'Mechas/Luzes', price: 450, duration: 240, category: 'Cabelo' },
  { id: '4', name: 'Manicure & Pedicure', price: 70, duration: 90, category: 'Unhas' },
  { id: '5', name: 'Design de Sobrancelhas', price: 50, duration: 30, category: 'Estética' },
  { id: '6', name: 'Hidratação Profunda', price: 150, duration: 60, category: 'Cabelo' },
  { id: '7', name: 'Maquiagem Social', price: 200, duration: 75, category: 'Maquiagem' },
];

export const MOCK_REVENUE = [
  { date: '2024-05-01', amount: 1200 },
  { date: '2024-05-02', amount: 1800 },
  { date: '2024-05-03', amount: 1100 },
  { date: '2024-05-04', amount: 2500 },
  { date: '2024-05-05', amount: 900 },
  { date: '2024-05-06', amount: 1600 },
  { date: '2024-05-07', amount: 2100 },
];
