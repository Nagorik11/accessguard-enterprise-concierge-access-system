import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, ShieldCheck, Bell, LogOut, Loader2, Package, UserPlus, FileSearch, Car } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import type { VisitLog, CustodyItem, ParkingLog } from '@shared/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
export function HomePage() {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [custodyItems, setCustodyItems] = useState<CustodyItem[]>([]);
  const [parkingLogs, setParkingLogs] = useState<ParkingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [visitsRes, custodyRes, parkingRes] = await Promise.all([
        api<{ items: VisitLog[] }>('/api/visits'),
        api<{ items: CustodyItem[] }>('/api/custody'),
        api<{ items: ParkingLog[] }>('/api/parking')
      ]);
      setVisits(visitsRes.items || []);
      setCustodyItems(custodyRes.items || []);
      setParkingLogs(parkingRes.items || []);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
      toast.error("Error al cargar datos del panel");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleCheckOut = async (id: string) => {
    try {
      await api(`/api/visits/${id}/exit`, { method: 'POST' });
      toast.success("Salida registrada con éxito");
      fetchData();
    } catch (err) {
      toast.error("Error al registrar la salida");
    }
  };
  const visitsToday = (visits || []).filter(v => v.entryTime && isToday(new Date(v.entryTime))).length;
  const currentlyInside = (visits || []).filter(v => v.status === 'active').length;
  const inCustody = (custodyItems || []).filter(i => i.status === 'in_custody').length;
  const parkedNow = (parkingLogs || []).filter(p => p.status === 'parked').length;
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Seguridad</h1>
            <p className="text-slate-500 mt-1">Monitor de acceso, custodia y parking en tiempo real.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/register">
            <Card className="hover:border-blue-500 transition-colors cursor-pointer group bg-white shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Nueva Visita</p>
                  <p className="text-xs text-slate-500">Ingreso peatonal</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/parking">
            <Card className="hover:border-indigo-500 transition-colors cursor-pointer group bg-white shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Registrar Vehículo</p>
                  <p className="text-xs text-slate-500">Acceso vehicular</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/custody">
            <Card className="hover:border-orange-500 transition-colors cursor-pointer group bg-white shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Recibir Item</p>
                  <p className="text-xs text-slate-500">Encomienda/Custodia</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/history">
            <Card className="hover:border-slate-500 transition-colors cursor-pointer group bg-white shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                  <FileSearch className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Ver Bitácora</p>
                  <p className="text-xs text-slate-500">Registros históricos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">Peatones Interior</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentlyInside}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">Vehículos Interior</CardTitle>
              <Car className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parkedNow}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-500 uppercase">En Custodia</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inCustody}</div>
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
                  {visits.slice(0, 8).map((log) => (
                    <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-slate-900">{log.visitorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{log.visitorRut}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-semibold">{log.apartmentId}</TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {log.entryTime ? format(log.entryTime, 'MMM d, HH:mm', { locale: es }) : '—'}
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