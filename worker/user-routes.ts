import { Hono } from "hono";
import type { Env } from './core-utils';
import { ResidentEntity, VisitEntity, SettingsEntity, ConserjeEntity, CustodyEntity, ParkingEntity, RoomEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { isValidRut } from "./validators";
import type { VisitRegistration, VisitLog, ComplianceSettings, CustodyItem, ParkingLog, Resident, VideoRoom } from "../shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AUTH
  app.post('/api/auth/login', async (c) => {
    try {
      await ConserjeEntity.ensureSeed(c.env);
      const { username, password } = await c.req.json();
      const user = await ConserjeEntity.findByUsername(c.env, username);
      if (!user || user.password !== password) {
        return bad(c, 'Credenciales inválidas');
      }
      const { password: _, ...safeUser } = user;
      return ok(c, { user: safeUser, token: `mock-jwt-${crypto.randomUUID()}` });
    } catch (e) {
      console.error("[AUTH ERROR]", e);
      return bad(c, "Error de autenticación interno");
    }
  });
  // VIDEO SIGNALING
  app.post('/api/video/rooms', async (c) => {
    try {
      const { apartmentId, visitorName } = await c.req.json();
      const { items: residents } = await ResidentEntity.list(c.env, null, 1000);
      const resident = residents.find(r => r.apartmentId === apartmentId);
      if (!resident) return bad(c, 'Residente no encontrado');
      const id = crypto.randomUUID();
      const now = Date.now();
      const newRoom: VideoRoom = {
        id,
        apartmentId,
        residentId: resident.id,
        visitorName,
        status: 'calling',
        createdAt: now,
        expiresAt: now + (10 * 60 * 1000) // 10 minutes
      };
      console.log(`[MOCK WHATSAPP] To: ${resident.phone} - "Conserjería Digital: Videollamada de verificación para el visitante ${visitorName}. Acceda aquí: https://conserjeria.io/v/${id}"`);
      const created = await RoomEntity.create(c.env, newRoom);
      return ok(c, created);
    } catch (e) {
      return bad(c, "Error al crear sala de video");
    }
  });
  app.get('/api/video/rooms/:id', async (c) => {
    try {
      const room = await new RoomEntity(c.env, c.req.param('id')).getState();
      // Logic for mock auto-acceptance for demo purposes after 5 seconds
      if (room.status === 'calling' && (Date.now() - room.createdAt > 5000)) {
        const entity = new RoomEntity(c.env, room.id);
        const updated = await entity.mutate(s => ({ ...s, status: 'connected' }));
        return ok(c, updated);
      }
      return ok(c, room);
    } catch (e) {
      return notFound(c);
    }
  });
  app.patch('/api/video/rooms/:id', async (c) => {
    try {
      const { status } = await c.req.json();
      const entity = new RoomEntity(c.env, c.req.param('id'));
      const updated = await entity.mutate(s => ({ ...s, status }));
      return ok(c, updated);
    } catch (e) {
      return bad(c, "Error al actualizar sala");
    }
  });
  app.get('/api/video/history', async (c) => {
    try {
      const page = await RoomEntity.list(c.env, null, 100);
      return ok(c, { items: page.items });
    } catch (e) {
      return ok(c, { items: [] });
    }
  });
  // RESIDENTS CRUD
  app.get('/api/residents', async (c) => {
    try {
      await ResidentEntity.ensureSeed(c.env);
      const cursor = c.req.query('cursor');
      const limit = c.req.query('limit');
      const page = await ResidentEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 200);
      return ok(c, { items: page.items || [], next: page.next });
    } catch (e) {
      console.error("[RESIDENTS GET ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  app.post('/api/residents', async (c) => {
    try {
      const body = (await c.req.json()) as Partial<Resident>;
      if (!body.fullName || !body.apartmentId) return bad(c, 'Nombre y Departamento son obligatorios');
      const { items: existing } = await ResidentEntity.list(c.env, null, 1000);
      if (existing.some(r => r.apartmentId === body.apartmentId)) {
        return bad(c, `El departamento ${body.apartmentId} ya tiene un residente asignado`);
      }
      const id = crypto.randomUUID();
      const newResident: Resident = {
        id,
        fullName: body.fullName,
        apartmentId: body.apartmentId,
        phone: body.phone || '',
        rut: body.rut,
        vehiclePlate: body.vehiclePlate?.toUpperCase(),
        whatsappOptIn: body.whatsappOptIn ?? true,
        createdAt: Date.now()
      };
      const created = await ResidentEntity.create(c.env, newResident);
      return ok(c, created);
    } catch (e) {
      console.error("[RESIDENTS POST ERROR]", e);
      return bad(c, "Error al crear residente");
    }
  });
  app.put('/api/residents/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = (await c.req.json()) as Partial<Resident>;
      const entity = new ResidentEntity(c.env, id);
      if (!(await entity.exists())) return notFound(c, 'Residente no encontrado');
      const updated = await entity.mutate(s => ({
        ...s,
        ...body,
        vehiclePlate: body.vehiclePlate?.toUpperCase() ?? s.vehiclePlate
      }));
      return ok(c, updated);
    } catch (e) {
      console.error("[RESIDENTS PUT ERROR]", e);
      return bad(c, "Error al actualizar residente");
    }
  });
  app.delete('/api/residents/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const deleted = await ResidentEntity.delete(c.env, id);
      return deleted ? ok(c, { id }) : notFound(c);
    } catch (e) {
      console.error("[RESIDENTS DELETE ERROR]", e);
      return bad(c, "Error al eliminar residente");
    }
  });
  // VISITS
  app.get('/api/visits', async (c) => {
    try {
      const cursor = c.req.query('cursor');
      const limit = c.req.query('limit');
      const page = await VisitEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 200);
      const items = (page.items || []).sort((a, b) => b.entryTime - a.entryTime);
      return ok(c, { items, next: page.next });
    } catch (e) {
      console.error("[VISITS GET ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  app.post('/api/visits', async (c) => {
    try {
      const body = (await c.req.json()) as VisitRegistration;
      if (!body.visitorName || body.visitorName.length < 3) return bad(c, 'Nombre de visitante inválido');
      if (!isValidRut(body.visitorRut)) return bad(c, 'RUT de visitante inválido');
      if (!body.apartmentId) return bad(c, 'Departamento de destino requerido');
      if (!body.legalConsent) return bad(c, 'El consentimiento legal es obligatorio');
      const newVisit: VisitLog = {
        id: crypto.randomUUID(),
        visitorName: body.visitorName,
        visitorRut: body.visitorRut,
        apartmentId: body.apartmentId,
        purpose: body.purpose,
        legalConsent: body.legalConsent,
        entryTime: Date.now(),
        status: 'active',
        videoVerified: body.videoVerified || false,
        verificationRoomId: body.verificationRoomId
      };
      const created = await VisitEntity.create(c.env, newVisit);
      return ok(c, created);
    } catch (e) {
      console.error("[VISITS POST ERROR]", e);
      return bad(c, "Error al registrar visita");
    }
  });
  app.post('/api/visits/:id/exit', async (c) => {
    try {
      const id = c.req.param('id');
      const entity = new VisitEntity(c.env, id);
      if (!(await entity.exists())) return notFound(c, 'Visita no encontrada');
      const updated = await entity.mutate(s => ({ ...s, status: 'completed', exitTime: Date.now() }));
      return ok(c, updated);
    } catch (e) {
      console.error("[VISIT EXIT ERROR]", e);
      return bad(c, "Error al registrar salida");
    }
  });
  app.delete('/api/visits/:id', async (c) => {
    try {
      const deleted = await VisitEntity.delete(c.env, c.req.param('id'));
      return deleted ? ok(c, { id: c.req.param('id') }) : notFound(c);
    } catch (e) {
      return bad(c, "Error al eliminar");
    }
  });
  // CUSTODY
  app.get('/api/custody', async (c) => {
    try {
      const page = await CustodyEntity.list(c.env, c.req.query('cursor') ?? null, 100);
      const items = (page.items || []).sort((a, b) => b.receivedAt - a.receivedAt);
      return ok(c, { items, next: page.next });
    } catch (e) {
      console.error("[CUSTODY GET ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  app.post('/api/custody', async (c) => {
    try {
      const body = (await c.req.json()) as Partial<CustodyItem>;
      if (!body.apartmentId || !body.itemDescription || !body.recipientName) return bad(c, 'Faltan campos obligatorios');
      const now = Date.now();
      const newItem: CustodyItem = {
        id: crypto.randomUUID(),
        apartmentId: body.apartmentId,
        itemDescription: body.itemDescription,
        recipientName: body.recipientName,
        recipientType: body.recipientType || 'resident',
        motive: body.motive || '',
        receivedAt: now,
        status: 'in_custody',
        createdAt: now
      };
      return ok(c, await CustodyEntity.create(c.env, newItem));
    } catch (e) {
      console.error("[CUSTODY POST ERROR]", e);
      return bad(c, "Error al crear registro de custodia");
    }
  });
  app.put('/api/custody/:id/deliver', async (c) => {
    try {
      const entity = new CustodyEntity(c.env, c.req.param('id'));
      if (!(await entity.exists())) return notFound(c);
      return ok(c, await entity.mutate(s => ({ ...s, status: 'delivered', deliveredAt: Date.now() })));
    } catch (e) {
      return bad(c, "Error al entregar");
    }
  });
  app.delete('/api/custody/:id', async (c) => {
    try {
      const deleted = await CustodyEntity.delete(c.env, c.req.param('id'));
      return deleted ? ok(c, { id: c.req.param('id') }) : notFound(c);
    } catch (e) {
      return bad(c, "Error al eliminar");
    }
  });
  // PARKING
  app.get('/api/parking', async (c) => {
    try {
      const page = await ParkingEntity.list(c.env, c.req.query('cursor') ?? null, 100);
      const items = (page.items || []).sort((a, b) => b.entryTime - a.entryTime);
      return ok(c, { items, next: page.next });
    } catch (e) {
      console.error("[PARKING GET ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  app.post('/api/parking', async (c) => {
    try {
      const body = (await c.req.json()) as Partial<ParkingLog>;
      if (!body.plate || !body.apartmentId) return bad(c, 'Patente y depto requeridos');
      const now = Date.now();
      const entry: ParkingLog = {
        id: crypto.randomUUID(),
        plate: body.plate.toUpperCase(),
        apartmentId: body.apartmentId,
        vehicleType: body.vehicleType || 'car',
        entryTime: now,
        status: 'parked',
        createdAt: now
      };
      return ok(c, await ParkingEntity.create(c.env, entry));
    } catch (e) {
      console.error("[PARKING POST ERROR]", e);
      return bad(c, "Error al registrar vehículo");
    }
  });
  app.put('/api/parking/:id/exit', async (c) => {
    try {
      const entity = new ParkingEntity(c.env, c.req.param('id'));
      if (!(await entity.exists())) return notFound(c);
      return ok(c, await entity.mutate(s => ({ ...s, status: 'exited', exitTime: Date.now() })));
    } catch (e) {
      return bad(c, "Error al marcar salida");
    }
  });
  app.delete('/api/parking/:id', async (c) => {
    try {
      const deleted = await ParkingEntity.delete(c.env, c.req.param('id'));
      return deleted ? ok(c, { id: c.req.param('id') }) : notFound(c);
    } catch (e) {
      return bad(c, "Error al eliminar");
    }
  });
  // SETTINGS & CLEANUP
  app.get('/api/settings', async (c) => {
    try {
      const settings = new SettingsEntity(c.env, 'global-settings');
      return ok(c, await settings.getState());
    } catch (e) {
      console.error("[SETTINGS GET ERROR]", e);
      return bad(c, "Error al obtener configuración");
    }
  });
  app.post('/api/settings', async (c) => {
    try {
      const body = (await c.req.json()) as Partial<ComplianceSettings>;
      const settings = new SettingsEntity(c.env, 'global-settings');
      await settings.patch(body);
      return ok(c, await settings.getState());
    } catch (e) {
      console.error("[SETTINGS POST ERROR]", e);
      return bad(c, "Error al guardar configuración");
    }
  });
  app.post('/api/settings/cleanup', async (c) => {
    try {
      const settings = await (new SettingsEntity(c.env, 'global-settings')).getState();
      const retentionDays = settings.retentionDays ?? 30;
      const threshold = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
      const [vL, pL, iL, rL] = await Promise.all([
        VisitEntity.list(c.env, null, 1000),
        ParkingEntity.list(c.env, null, 1000),
        CustodyEntity.list(c.env, null, 1000),
        RoomEntity.list(c.env, null, 1000)
      ]);
      const vD = (vL.items || []).filter(v => v.status === 'completed' && (v.exitTime || v.entryTime) < threshold).map(v => v.id);
      const pD = (pL.items || []).filter(p => p.status === 'exited' && (p.exitTime || p.entryTime) < threshold).map(p => p.id);
      const iD = (iL.items || []).filter(i => i.status === 'delivered' && (i.deliveredAt || i.receivedAt) < threshold).map(i => i.id);
      const rD = (rL.items || []).filter(r => r.createdAt < threshold).map(r => r.id);
      const [vd, pd, id] = await Promise.all([
        VisitEntity.deleteMany(c.env, vD),
        ParkingEntity.deleteMany(c.env, pD),
        CustodyEntity.deleteMany(c.env, iD),
        RoomEntity.deleteMany(c.env, rD)
      ]);
      return ok(c, { visitsDeleted: vd, parkingDeleted: pd, itemsDeleted: id, timestamp: Date.now() });
    } catch (e) {
      console.error("[CLEANUP ERROR]", e);
      return bad(c, "Error durante el proceso de limpieza");
    }
  });
}