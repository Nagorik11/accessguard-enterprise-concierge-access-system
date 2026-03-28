import { Hono } from "hono";
import type { Env } from './core-utils';
import { ResidentEntity, VisitEntity, SettingsEntity, ConserjeEntity, CustodyEntity, ParkingEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { isValidRut } from "../shared/validators";
import type { VisitRegistration, VisitLog, ComplianceSettings, CustodyItem, ParkingLog } from "@shared/types";
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
      return ok(c, {
        user: safeUser,
        token: `mock-jwt-${crypto.randomUUID()}`
      });
    } catch (e) {
      console.error("[AUTH ERROR]", e);
      return bad(c, "Error de autenticación interno");
    }
  });
  // RESIDENTS
  app.get('/api/residents', async (c) => {
    try {
      await ResidentEntity.ensureSeed(c.env);
      const cursor = c.req.query('cursor');
      const limit = c.req.query('limit');
      const page = await ResidentEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 100);
      return ok(c, { items: page.items || [], next: page.next });
    } catch (e) {
      console.error("[RESIDENTS ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  // VISITS
  app.get('/api/visits', async (c) => {
    try {
      const cursor = c.req.query('cursor');
      const limit = c.req.query('limit');
      const page = await VisitEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 200);
      const items = page.items || [];
      items.sort((a, b) => b.entryTime - a.entryTime);
      return ok(c, { items, next: page.next });
    } catch (e) {
      console.error("[VISITS ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  app.post('/api/visits', async (c) => {
    const body = (await c.req.json()) as VisitRegistration;
    if (!body.visitorName || body.visitorName.length < 3) return bad(c, 'Nombre de visitante inválido');
    if (!isValidRut(body.visitorRut)) return bad(c, 'RUT de visitante inválido');
    if (!body.apartmentId) return bad(c, 'Departamento de destino requerido');
    if (!body.legalConsent) return bad(c, 'El consentimiento legal es obligatorio');
    const visitId = crypto.randomUUID();
    const newVisit: VisitLog = {
      id: visitId,
      visitorName: body.visitorName,
      visitorRut: body.visitorRut,
      apartmentId: body.apartmentId,
      purpose: body.purpose,
      legalConsent: body.legalConsent,
      entryTime: Date.now(),
      status: 'active'
    };
    const created = await VisitEntity.create(c.env, newVisit);
    return ok(c, created);
  });
  app.post('/api/visits/:id/exit', async (c) => {
    const id = c.req.param('id');
    const entity = new VisitEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Visita no encontrada');
    const updated = await entity.mutate(s => ({
      ...s,
      status: 'completed',
      exitTime: Date.now()
    }));
    return ok(c, updated);
  });
  // CUSTODY
  app.get('/api/custody', async (c) => {
    try {
      const cursor = c.req.query('cursor');
      const limit = c.req.query('limit');
      const page = await CustodyEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 100);
      const items = page.items || [];
      items.sort((a, b) => b.receivedAt - a.receivedAt);
      return ok(c, { items, next: page.next });
    } catch (e) {
      console.error("[CUSTODY ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  app.post('/api/custody', async (c) => {
    const body = (await c.req.json()) as Partial<CustodyItem>;
    if (!body.apartmentId || !body.itemDescription || !body.recipientName) {
      return bad(c, 'Faltan campos obligatorios');
    }
    const id = crypto.randomUUID();
    const now = Date.now();
    const newItem: CustodyItem = {
      id,
      apartmentId: body.apartmentId,
      itemDescription: body.itemDescription,
      recipientName: body.recipientName,
      recipientType: body.recipientType || 'resident',
      motive: body.motive || '',
      receivedAt: now,
      status: 'in_custody',
      createdAt: now
    };
    const created = await CustodyEntity.create(c.env, newItem);
    return ok(c, created);
  });
  app.put('/api/custody/:id/deliver', async (c) => {
    const id = c.req.param('id');
    const entity = new CustodyEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Pertenencia no encontrada');
    const updated = await entity.mutate(s => ({
      ...s,
      status: 'delivered',
      deliveredAt: Date.now()
    }));
    return ok(c, updated);
  });
  app.delete('/api/custody/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await CustodyEntity.delete(c.env, id);
    return deleted ? ok(c, { id }) : notFound(c);
  });
  // PARKING
  app.get('/api/parking', async (c) => {
    try {
      const cursor = c.req.query('cursor');
      const limit = c.req.query('limit');
      const page = await ParkingEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 100);
      const items = page.items || [];
      items.sort((a, b) => b.entryTime - a.entryTime);
      return ok(c, { items, next: page.next });
    } catch (e) {
      console.error("[PARKING ERROR]", e);
      return ok(c, { items: [], next: null });
    }
  });
  app.post('/api/parking', async (c) => {
    const body = (await c.req.json()) as Partial<ParkingLog>;
    if (!body.plate || !body.apartmentId) return bad(c, 'Patente y depto requeridos');
    const id = crypto.randomUUID();
    const now = Date.now();
    const entry: ParkingLog = {
      id,
      plate: body.plate.toUpperCase(),
      apartmentId: body.apartmentId,
      vehicleType: body.vehicleType || 'car',
      entryTime: now,
      status: 'parked',
      createdAt: now
    };
    const created = await ParkingEntity.create(c.env, entry);
    return ok(c, created);
  });
  app.put('/api/parking/:id/exit', async (c) => {
    const id = c.req.param('id');
    const entity = new ParkingEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Registro de estacionamiento no encontrado');
    const updated = await entity.mutate(s => ({
      ...s,
      status: 'exited',
      exitTime: Date.now()
    }));
    return ok(c, updated);
  });
  app.delete('/api/parking/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await ParkingEntity.delete(c.env, id);
    return deleted ? ok(c, { id }) : notFound(c);
  });
  // COMPLIANCE SETTINGS
  app.get('/api/settings', async (c) => {
    try {
      const settings = new SettingsEntity(c.env, 'global-settings');
      const data = await settings.getState();
      return ok(c, data);
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
      const data = await settings.getState();
      return ok(c, data);
    } catch (e) {
      console.error("[SETTINGS POST ERROR]", e);
      return bad(c, "Error al guardar configuración");
    }
  });
}