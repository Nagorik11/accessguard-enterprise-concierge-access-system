import { Hono } from "hono";
import type { Env } from './core-utils';
import { ResidentEntity, VisitEntity } from "./entities";
import { ok, bad, isStr } from './core-utils';
import { isValidRut } from "../shared/validators";
import type { VisitRegistration, VisitLog } from "@shared/types";
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
    const page = await VisitEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 20);
    return ok(c, page);
  });
  app.post('/api/visits', async (c) => {
    const body = (await c.req.json()) as VisitRegistration;
    // Strict Technical Contract Validation
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
    // Mock 3rd party integration (Twilio/WhatsApp)
    console.log(`[SIMULATED WHATSAPP] To Apt ${body.apartmentId}: Visitor ${body.visitorName} arriving.`);
    return ok(c, created);
  });
}