import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, ShieldCheck, LogOut, Loader2, Package, UserPlus, FileSearch, Car, AlertCircle, RefreshCcw, ArrowUpRight } from 'lucide-react';
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
      setError("Error de conexión. Reintente por favor.");
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
    <AppLayout container className="bg-slate-50">
      <div className="space-y-6">
        <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/80 backdrop-blur-md border-b flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Acciones de Turno</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-200">
                <UserPlus className="h-5 w-5 mr-2" /> Nueva Visita
              </Button>
            </Link>
            <Link to="/parking">
              <Button variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800 font-bold h-11 px-6 shadow-md">
                <Car className="h-5 w-5 mr-2" /> Parking
              </Button>
            </Link>
            <Link to="/custody">
              <Button variant="outline" className="border-2 font-bold h-11 px-6 bg-white">
                <Package className="h-5 w-5 mr-2" /> Encomienda
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full bg-slate-100" onClick={fetchData} disabled={loading}>
              <RefreshCcw className={cn("h-5 w-5 text-slate-600", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
            <Button size="sm" variant="destructive" onClick={fetchData}>Reintentar</Button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Personas en Recinto", val: currentlyInside, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Vehículos Visita", val: parkedNow, icon: Car, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Visitas de Hoy", val: visitsToday, icon: ArrowUpRight, color: "text-green-600", bg: "bg-green-50" },
            { label: "Paquetes en Guardia", val: inCustody, icon: Package, color: "text-orange-600", bg: "bg-orange-50" }
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border-none bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
                  {loading ? <Skeleton className="h-10 w-16" /> : <div className={cn("text-4xl font-black tracking-tight", stat.color)}>{stat.val}</div>}
                </div>
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-7 w-7", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-sm border-none bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Monitor de Accesos Activos</CardTitle>
              <p className="text-xs text-slate-500">Registros vigentes en el edificio</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && visits.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-20 text-slate-400 italic font-medium">No hay movimientos registrados hoy.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100 uppercase text-[10px]">
                    <TableHead className="pl-6 font-bold">Visitante</TableHead>
                    <TableHead className="font-bold">Departamento</TableHead>
                    <TableHead className="font-bold">Entrada</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.slice(0, 10).map((log) => (
                    <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="font-bold text-slate-900">{log.visitorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{log.visitorRut}</div>
                      </TableCell>
                      <TableCell className="text-blue-700 font-black">Unidad {log.apartmentId}</TableCell>
                      <TableCell className="text-slate-500 text-xs font-semibold">
                        {log.entryTime ? format(log.entryTime, 'HH:mm', { locale: es }) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize text-[10px] px-3 py-0.5 font-bold rounded-full",
                            log.status === 'active' && "bg-green-100 text-green-700",
                            log.status === 'completed' && "bg-slate-100 text-slate-600",
                            log.status === 'denied' && "bg-red-100 text-red-700",
                          )}
                        >
                          {log.status === 'active' ? 'en edificio' : log.status === 'completed' ? 'finalizado' : 'denegado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {log.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 font-bold text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => handleCheckOut(log.id)}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Registrar Salida
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
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest pt-4 font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-green-500" /> Sincronizado</span>
            <span>Actualizado: {format(new Date(), 'HH:mm:ss')}</span>
          </div>
          <div>Conserjería Digital v1.5.0</div>
        </div>
      </div>
    </AppLayout>
  );
}