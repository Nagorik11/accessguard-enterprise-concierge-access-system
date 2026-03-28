import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { api } from '@/lib/api-client';
import type { VisitLog, CustodyItem, ParkingLog } from '@shared/types';
import { Loader2, TrendingUp, Users, Package, Clock, Calendar, ShieldAlert } from 'lucide-react';
import { format, startOfDay, subDays, eachDayOfInterval, subMonths, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
export function AnalyticsPage() {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [custody, setCustody] = useState<CustodyItem[]>([]);
  const [parking, setParking] = useState<ParkingLog[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [vRes, cRes, pRes] = await Promise.all([
          api<{ items: VisitLog[] }>('/api/visits'),
          api<{ items: CustodyItem[] }>('/api/custody'),
          api<{ items: ParkingLog[] }>('/api/parking')
        ]);
        setVisits(vRes.items || []);
        setCustody(cRes.items || []);
        setParking(pRes.items || []);
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const timelineData = last7Days.map(date => {
    const dayStr = format(date, 'EEE', { locale: es });
    const count = visits.filter(v => v.entryTime && startOfDay(new Date(v.entryTime)).getTime() === startOfDay(date).getTime()).length;
    return { name: dayStr, visitas: count };
  });
  const last6Months = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() });
  const monthlyData = last6Months.map(date => {
    const monthStr = format(date, 'MMM', { locale: es });
    const count = visits.filter(v => v.entryTime && startOfMonth(new Date(v.entryTime)).getTime() === startOfMonth(date).getTime()).length;
    return { name: monthStr, visitas: count };
  });
  const aptCounts = visits.reduce((acc, v) => {
    if (v.apartmentId) acc[v.apartmentId] = (acc[v.apartmentId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topAptsData = Object.entries(aptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
  const renderEmpty = (label: string) => (
    <div className="flex flex-col items-center justify-center h-[280px] text-slate-300 gap-2">
      <ShieldAlert className="h-10 w-10 opacity-20" />
      <p className="text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
  return (
    <AppLayout container className="bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reportes de Gestión</h1>
            <p className="text-slate-500 font-medium">Analítica avanzada de seguridad y flujos.</p>
          </div>
          <Badge variant="outline" className="h-9 px-4 gap-2 bg-white border-slate-200 font-bold text-slate-600 shadow-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            Periodo: Últimos 6 meses
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Visitas Totales", val: visits.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Vehículos Parking", val: parking.filter(p => p.status === 'parked').length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Custodia Activa", val: custody.filter(c => c.status === 'in_custody').length, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Cumplimiento Legal", val: "100%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className={cn("text-3xl font-black tracking-tight text-slate-900")}>{stat.val}</div>}
                </div>
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 border-none shadow-sm bg-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-black">Tráfico Mensual</CardTitle>
              <CardDescription className="text-xs font-medium">Volumen de ingresos autorizados por mes.</CardDescription>
            </CardHeader>
            <div className="h-[300px] w-full mt-6">
              {loading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : monthlyData.length === 0 ? renderEmpty("Sin datos mensuales") : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    <Bar dataKey="visitas" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card className="p-6 border-none shadow-sm bg-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-black">Top Unidades</CardTitle>
              <CardDescription className="text-xs font-medium">Departamentos con mayor recurrencia de visitas.</CardDescription>
            </CardHeader>
            <div className="h-[300px] w-full mt-6">
              {loading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : topAptsData.length === 0 ? renderEmpty("Sin actividad registrada") : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topAptsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={80} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
        <Card className="p-8 border-none shadow-sm bg-white">
          <CardHeader className="px-0 pt-0 mb-6">
            <CardTitle className="text-xl font-black">Tendencia Diaria (Semana Actual)</CardTitle>
          </CardHeader>
          <div className="h-[350px] w-full">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : timelineData.every(d => d.visitas === 0) ? renderEmpty("Esperando registros semanales") : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="visitas" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVisitas)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}