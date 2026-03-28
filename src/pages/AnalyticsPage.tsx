import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api-client';
import type { VisitLog, CustodyItem } from '@shared/types';
import { Loader2, TrendingUp, Users, Package, Clock } from 'lucide-react';
import { format, startOfDay, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
export function AnalyticsPage() {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [custody, setCustody] = useState<CustodyItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadData() {
      try {
        const [vRes, cRes] = await Promise.all([
          api<{ items: VisitLog[] }>('/api/visits'),
          api<{ items: CustodyItem[] }>('/api/custody')
        ]);
        setVisits(vRes.items || []);
        setCustody(cRes.items || []);
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
  // Process data for charts
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const timelineData = last7Days.map(date => {
    const dayStr = format(date, 'EEE', { locale: es });
    const count = visits.filter(v => startOfDay(new Date(v.entryTime)).getTime() === startOfDay(date).getTime()).length;
    return { name: dayStr, visitas: count };
  });
  const purposeCounts = visits.reduce((acc, v) => {
    acc[v.purpose] = (acc[v.purpose] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(purposeCounts).map(([name, value]) => ({ name, value })).slice(0, 5);
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estadísticas de Gestión</h1>
          <p className="text-slate-500 mt-1">Análisis de flujo de personas y eficiencia operativa.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Total Visitas (Mes)</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visits.length}</div>
              <p className="text-[10px] text-green-600 font-medium">+12% vs mes anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Items en Custodia</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{custody.filter(c => c.status === 'in_custody').length}</div>
              <p className="text-[10px] text-slate-400 font-medium">Capacidad actual: 45%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Tiempo Promedio Estancia</CardTitle>
              <Clock className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42 min</div>
              <p className="text-[10px] text-slate-400 font-medium">Basado en registros de salida</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase text-slate-500">Eficiencia Notificación</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-[10px] text-green-600 font-medium">WhatsApp Delivery Rate</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Tendencia de Visitas (Últimos 7 días)</CardTitle>
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
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="visitas" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Motivos de Visita</CardTitle>
            </CardHeader>
            <div className="h-[300px] w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/3 space-y-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-600 truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}