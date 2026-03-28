import { Hono } from "hono";
import type { Env } from './core-utils';
import { ResidentEntity, VisitEntity, SettingsEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { isValidRut } from "../shared/validators";
import type { VisitRegistration, VisitLog, ComplianceSettings } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // RESIDENTS
  app.get('/api/residents', async (c) => {
    await ResidentEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    const page = await ResidentEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 50);
    return ok(c, page);
  });
  // VISITS
  app.get('/api/visits', async (c) => {
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    const page = await VisitEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 100);
    // Sort by entryTime descending (frontend helper or server side)
    page.items.sort((a, b) => b.entryTime - a.entryTime);
    return ok(c, page);
  });
  app.post('/api/visits', async (c) => {
    const body = (await c.req.json()) as VisitRegistration;
    if (!body.visitorName || body.visitorName.length < 3) return bad(c, 'Invalid visitor name');
    if (!isValidRut(body.visitorRut)) return bad(c, 'Invalid visitor RUT checksum');
    if (!body.apartmentId) return bad(c, 'Apartment destination required');
    if (!body.legalConsent) return bad(c, 'Legal consent is mandatory');
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
    if (!(await entity.exists())) return notFound(c, 'Visit not found');
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
    const body = (await c.req.json()) as Partial<ComplianceSettings>;
    const settings = new SettingsEntity(c.env, 'global-settings');
    await settings.patch(body);
    const data = await settings.getState();
    return ok(c, data);
  });
}