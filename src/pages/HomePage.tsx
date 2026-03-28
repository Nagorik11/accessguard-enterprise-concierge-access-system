import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, ShieldCheck, LogOut, Loader2, Package, UserPlus, FileSearch, Car, AlertCircle, RefreshCcw } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError("No se pudo conectar con el servidor. Verifique su conexión.");
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
  const visitsToday = visits.filter(v => v.entryTime && isToday(new Date(v.entryTime))).length;
  const currentlyInside = visits.filter(v => v.status === 'active').length;
  const inCustody = custodyItems.filter(i => i.status === 'in_custody').length;
  const parkedNow = parkingLogs.filter(p => p.status === 'parked').length;
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Seguridad</h1>
            <p className="text-slate-500 mt-1">Monitor de acceso, custodia y parking en tiempo real.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-800 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button size="sm" variant="destructive" onClick={fetchData}>Reintentar</Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: "/register", icon: UserPlus, label: "Nueva Visita", sub: "Ingreso peatonal", color: "blue" },
            { to: "/parking", icon: Car, label: "Registrar Vehículo", sub: "Acceso vehicular", color: "indigo" },
            { to: "/custody", icon: Package, label: "Recibir Item", sub: "Encomienda/Custodia", color: "orange" },
            { to: "/history", icon: FileSearch, label: "Ver Bitácora", sub: "Registros históricos", color: "slate" }
          ].map((action, i) => (
            <Link key={i} to={action.to}>
              <Card className="hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group bg-white shadow-sm h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                    `bg-${action.color}-50 text-${action.color}-600 group-hover:bg-${action.color}-600 group-hover:text-white`
                  )}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Visitas Hoy", val: visitsToday, icon: Users, color: "text-blue-600" },
            { label: "Peatones Interior", val: currentlyInside, icon: Clock, color: "text-orange-500" },
            { label: "Vehículos Interior", val: parkedNow, icon: Car, color: "text-indigo-600" },
            { label: "En Custodia", val: inCustody, icon: Package, color: "text-green-600" }
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border-none bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase">{stat.label}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stat.val}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-sm border-none bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bitácora de Accesos Recientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && visits.length === 0 ? (
              <div className="p-12 flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
                <p className="text-sm text-slate-400">Cargando bitácora...</p>
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic">No se encontraron registros hoy.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 uppercase text-[10px]">
                    <TableHead className="pl-6">Visitante</TableHead>
                    <TableHead>Depto</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right pr-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.slice(0, 8).map((log) => (
                    <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6">
                        <div className="font-medium text-slate-900">{log.visitorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{log.visitorRut}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-semibold">{log.apartmentId}</TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {log.entryTime ? format(log.entryTime, 'HH:mm', { locale: es }) : '—'}
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
                      <TableCell className="text-right pr-6">
                        {log.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => handleCheckOut(log.id)}
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Salida
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
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 text-[10px] text-slate-400 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-green-500" /> {error ? 'Desconectado' : 'Sistema Sincronizado'} v1.3.0</div>
            <div className="w-px h-3 bg-slate-200 hidden md:block" />
            <div>Última Sincronización: {format(new Date(), 'HH:mm:ss')}</div>
          </div>
          <div className="font-medium tracking-wider uppercase">Certificado por Cumplimiento Legal 2024</div>
        </div>
      </div>
    </AppLayout>
  );
}