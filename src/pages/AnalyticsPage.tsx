import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api-client';
import type { VisitLog, CustodyItem, ParkingLog } from '@shared/types';
import { Loader2, TrendingUp, Users, Package, Clock, Calendar } from 'lucide-react';
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
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  if (loading) {
    return (
      <AppLayout container>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }
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
  return (
    <AppLayout container>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estadísticas de Gestión</h1>
            <p className="text-slate-500 mt-1">Análisis profundo de tráfico y seguridad.</p>
          </div>
          <Badge variant="outline" className="h-8 px-3 gap-2 bg-white">
            <Calendar className="h-3 w-3" />
            Últimos 6 meses
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Total Visitas</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visits.length}</div>
              <p className="text-[10px] text-green-600 font-medium">Histórico total</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Ocupación Parking</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parking.filter(p => p.status === 'parked').length}</div>
              <p className="text-[10px] text-slate-400 font-medium">Vehículos en interior</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Paquetes Activos</CardTitle>
              <Package className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{custody.filter(c => c.status === 'in_custody').length}</div>
              <p className="text-[10px] text-slate-400 font-medium">Pendientes de retiro</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Eficiencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.1%</div>
              <p className="text-[10px] text-green-600 font-medium">Sistema Operativo</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 border-none shadow-sm bg-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-semibold">Volumen Mensual de Visitas</CardTitle>
              <CardDescription>Comparativa de ingresos por mes.</CardDescription>
            </CardHeader>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="visitas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-6 border-none shadow-sm bg-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-semibold">Top 5 Deptos con Más Visitas</CardTitle>
              <CardDescription>Ranking de unidades con mayor flujo.</CardDescription>
            </CardHeader>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAptsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card className="p-6 border-none shadow-sm bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">Tendencia Diaria (Últimos 7 días)</CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="visitas" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}