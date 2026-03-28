export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'admin' | 'conserje';
export interface Conserje {
  id: string;
  username: string;
  password?: string; // Only used during auth on server
  fullName: string;
  role: UserRole;
}
export interface AuthSession {
  user: Omit<Conserje, 'password'>;
  token: string;
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
export interface ComplianceSettings {
  id: string;
  retentionDays: number;
  autoDeleteEnabled: boolean;
  privacyPolicyUrl: string;
  whatsappTemplateStatus: 'pending' | 'approved' | 'rejected';
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