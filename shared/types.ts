export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'admin' | 'conserje';
export interface Conserje {
  id: string;
  username: string;
  password?: string;
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
  rut?: string;
  vehiclePlate?: string;
  whatsappOptIn: boolean;
  createdAt: number;
}
export const VISIT_PURPOSES = [
  "Invitado Familiar",
  "Delivery/Paquete",
  "Servicio Técnico",
  "Mantenimiento Edificio",
  "Proveedor/Comercial",
  "Profesional (Doctor/Abogado)",
  "Otros"
] as const;
export type VisitPurpose = typeof VISIT_PURPOSES[number];
export type VideoCallStatus = 'calling' | 'connected' | 'rejected' | 'missed' | 'completed';
export interface VideoRoom {
  id: string;
  apartmentId: string;
  residentId: string;
  visitorName: string;
  status: VideoCallStatus;
  createdAt: number;
  expiresAt: number;
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
  videoVerified?: boolean;
  verificationRoomId?: string;
}
export interface VisitRegistration {
  visitorName: string;
  visitorRut: string;
  apartmentId: string;
  purpose: string;
  legalConsent: boolean;
  videoVerified?: boolean;
  verificationRoomId?: string;
}
export type CustodyStatus = 'received' | 'in_custody' | 'delivered';
export type RecipientType = 'resident' | 'visitor';
export interface CustodyItem {
  id: string;
  apartmentId: string;
  itemDescription: string;
  recipientName: string;
  recipientType: RecipientType;
  motive: string;
  receivedAt: number;
  deliveredAt?: number;
  status: CustodyStatus;
  createdAt: number;
}
export type ParkingStatus = 'parked' | 'exited';
export type VehicleType = 'car' | 'moto' | 'other';
export interface ParkingLog {
  id: string;
  plate: string;
  apartmentId: string;
  vehicleType: VehicleType;
  entryTime: number;
  exitTime?: number;
  status: ParkingStatus;
  createdAt: number;
}
export interface ComplianceSettings {
  id: string;
  retentionDays: number;
  autoDeleteEnabled: boolean;
  privacyPolicyUrl: string;
  whatsappTemplateStatus: 'pending' | 'approved' | 'rejected';
}
export interface CleanupResponse {
  visitsDeleted: number;
  parkingDeleted: number;
  itemsDeleted: number;
  timestamp: number;
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