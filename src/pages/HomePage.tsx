import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, ShieldCheck, Bell, LogOut, Loader2, Package, CheckCircle2 } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import type { VisitLog, CustodyItem } from '@shared/types';
import { toast } from 'sonner';
export function HomePage() {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [custodyItems, setCustodyItems] = useState<CustodyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitsRes, custodyRes] = await Promise.all([
        api<{ items: VisitLog[] }>('/api/visits'),
        api<{ items: CustodyItem[] }>('/api/custody')
      ]);
      setVisits(visitsRes.items || []);
      setCustodyItems(custodyRes.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos del panel");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleCheckOut = async (id: string) => {
    try {
      await api(`/api/visits/${id}/exit`, { method: 'POST' });
      toast.success("Salida registrada con éxito");
      fetchData();
    } catch (err) {
      toast.error("Error al registrar la salida");
    }
  };
  const visitsToday = visits.filter(v => isToday(new Date(v.entryTime))).length;
  const currentlyInside = visits.filter(v => v.status === 'active').length;
  const inCustody = custodyItems.filter(i => i.status === 'in_custody').length;
  const deliveredToday = custodyItems.filter(i => i.status === 'delivered' && i.deliveredAt && isToday(new Date(i.deliveredAt))).length;
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Seguridad</h1>
            <p className="text-slate-500 mt-1">Monitor de acceso y custodia en tiempo real.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">Visitas Hoy</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitsToday}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">En el Interior</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentlyInside}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">En Custodia</CardTitle>
              <Package className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inCustody}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">Paquetes Entregados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredToday}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">WhatsApp</CardTitle>
              <Bell className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Activo</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">Cumplimiento</CardTitle>
              <ShieldCheck className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
            </CardContent>
          </Card>
        </div>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bitácora de Accesos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && visits.length === 0 ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
            ) : visits.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic">No se encontraron registros hoy.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Visitante</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Depto</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Entrada</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Salida</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Estado</TableHead>
                    <TableHead className="text-right text-slate-400 font-bold uppercase text-[10px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.slice(0, 10).map((log) => (
                    <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-slate-900">{log.visitorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{log.visitorRut}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-semibold">{log.apartmentId}</TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {format(log.entryTime, 'MMM d, HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {log.exitTime ? format(log.exitTime, 'HH:mm', { locale: es }) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize text-[10px] px-2 py-0",
                            log.status === 'active' && "bg-green-100 text-green-700 hover:bg-green-100",
                            log.status === 'completed' && "bg-slate-100 text-slate-600 hover:bg-slate-100",
                            log.status === 'denied' && "bg-red-100 text-red-700 hover:bg-red-100",
                          )}
                        >
                          {log.status === 'active' ? 'activo' : log.status === 'completed' ? 'finalizado' : 'denegado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => handleCheckOut(log.id)}
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Marcar Salida
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}