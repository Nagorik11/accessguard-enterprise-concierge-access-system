import { IndexedEntity } from "./core-utils";
import type { User, Resident, VisitLog } from "@shared/types";
import { MOCK_USERS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
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