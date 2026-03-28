import { IndexedEntity, Entity } from "./core-utils";
import type { User, Resident, VisitLog, ComplianceSettings, Conserje, CustodyItem, ParkingLog, VideoRoom } from "../shared/types";
import { MOCK_USERS } from "../shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
const SEED_CONSERJES: Conserje[] = [
  { id: "c-admin", username: "admin", password: "admin123", fullName: "Administrador Sistema", role: "admin" },
  { id: "c-staff", username: "staff", password: "staff123", fullName: "Conserje de Turno", role: "conserje" },
];
export class ConserjeEntity extends IndexedEntity<Conserje> {
  static readonly entityName = "conserje";
  static readonly indexName = "conserjes";
  static readonly initialState: Conserje = { id: "", username: "", fullName: "", role: "conserje" };
  static seedData = SEED_CONSERJES;
  static async findByUsername(env: any, username: string): Promise<Conserje | null> {
    const { items } = await this.list(env, null, 100);
    return items.find(u => u.username === username) || null;
  }
}
const SEED_RESIDENTS: Resident[] = [
  { id: "r1", fullName: "Roberto Muñoz", apartmentId: "101-A", phone: "+56912345678", whatsappOptIn: true, createdAt: Date.now() },
  { id: "r2", fullName: "Ana Maria Silva", apartmentId: "202-B", phone: "+56987654321", whatsappOptIn: true, createdAt: Date.now() },
  { id: "r3", fullName: "Carlos Valdivia", apartmentId: "405-C", phone: "+56955544433", whatsappOptIn: false, createdAt: Date.now() },
  { id: "r4", fullName: "Elena Gomez", apartmentId: "801-A", phone: "+56911122233", whatsappOptIn: true, createdAt: Date.now() },
  { id: "r5", fullName: "Pedro Pascal", apartmentId: "502-D", phone: "+56999988877", whatsappOptIn: true, createdAt: Date.now() },
];
export class ResidentEntity extends IndexedEntity<Resident> {
  static readonly entityName = "resident";
  static readonly indexName = "residents";
  static readonly initialState: Resident = { id: "", fullName: "", apartmentId: "", phone: "", whatsappOptIn: false, createdAt: 0 };
  static seedData = SEED_RESIDENTS;
}
export class VisitEntity extends IndexedEntity<VisitLog> {
  static readonly entityName = "visit";
  static readonly indexName = "visits";
  static readonly initialState: VisitLog = {
    id: "",
    visitorName: "",
    visitorRut: "",
    apartmentId: "",
    entryTime: 0,
    purpose: "",
    legalConsent: false,
    status: 'active'
  };
}
export class RoomEntity extends IndexedEntity<VideoRoom> {
  static readonly entityName = "video-room";
  static readonly indexName = "video-rooms";
  static readonly initialState: VideoRoom = {
    id: "",
    apartmentId: "",
    residentId: "",
    visitorName: "",
    status: 'calling',
    createdAt: 0,
    expiresAt: 0
  };
  static async findActiveByApartment(env: any, apartmentId: string): Promise<VideoRoom | null> {
    const { items } = await this.list(env, null, 50);
    const now = Date.now();
    return items.find(r => r.apartmentId === apartmentId && r.expiresAt > now && r.status !== 'completed' && r.status !== 'rejected') || null;
  }
}
export class CustodyEntity extends IndexedEntity<CustodyItem> {
  static readonly entityName = "custody";
  static readonly indexName = "custody-index";
  static readonly initialState: CustodyItem = {
    id: "",
    apartmentId: "",
    itemDescription: "",
    recipientName: "",
    recipientType: 'resident',
    motive: "",
    receivedAt: 0,
    status: 'received',
    createdAt: 0
  };
}
export class ParkingEntity extends IndexedEntity<ParkingLog> {
  static readonly entityName = "parking";
  static readonly indexName = "parking-index";
  static readonly initialState: ParkingLog = {
    id: "",
    plate: "",
    apartmentId: "",
    vehicleType: 'car',
    entryTime: 0,
    status: 'parked',
    createdAt: 0
  };
}
export class SettingsEntity extends Entity<ComplianceSettings> {
  static readonly entityName = "compliance-settings";
  static readonly initialState: ComplianceSettings = {
    id: "global-settings",
    retentionDays: 30,
    autoDeleteEnabled: true,
    privacyPolicyUrl: "https://accessguard.io/privacy",
    whatsappTemplateStatus: 'approved'
  };
}