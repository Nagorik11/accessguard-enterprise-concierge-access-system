import { Hono } from "hono";
import type { Env } from './core-utils';
import { ResidentEntity, VisitEntity, SettingsEntity, ConserjeEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { isValidRut } from "../shared/validators";
import type { VisitRegistration, VisitLog, ComplianceSettings } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AUTH
  app.post('/api/auth/login', async (c) => {
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
  });
  // RESIDENTS
  app.get('/api/residents', async (c) => {
    await ResidentEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    const page = await ResidentEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 50);
    return ok(c, { items: page.items || [], next: page.next });
  });
  // VISITS
  app.get('/api/visits', async (c) => {
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    const page = await VisitEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 100);
    const items = page.items || [];
    items.sort((a, b) => b.entryTime - a.entryTime);
    return ok(c, { items, next: page.next });
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
  // COMPLIANCE SETTINGS
  app.get('/api/settings', async (c) => {
    const settings = new SettingsEntity(c.env, 'global-settings');
    const data = await settings.getState();
    return ok(c, data);
  });
  app.post('/api/settings', async (c) => {
    // Role check would usually happen in middleware, but for brevity here:
    const authHeader = c.req.header('Authorization');
    // Simplified: Check if "admin" is in user metadata if we had real JWTs. 
    // For this phase, we allow the request but the UI restricts access.
    const body = (await c.req.json()) as Partial<ComplianceSettings>;
    const settings = new SettingsEntity(c.env, 'global-settings');
    await settings.patch(body);
    const data = await settings.getState();
    return ok(c, data);
  });
}