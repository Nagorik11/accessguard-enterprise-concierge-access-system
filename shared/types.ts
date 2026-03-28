export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Resident {
  id: string;
  fullName: string;
  apartmentId: string;
  phone: string;
  whatsappOptIn: boolean;
  createdAt: number;
}
export interface VisitLog {
  id: string;
  visitorName: string;
  visitorRut: string;
  apartmentId: string;
  entryTime: number;
  exitTime?: number;
  purpose: string;
  legalConsent: boolean;
  status: 'active' | 'completed' | 'denied';
}
export interface VisitRegistration {
  visitorName: string;
  visitorRut: string;
  apartmentId: string;
  purpose: string;
  legalConsent: boolean;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}