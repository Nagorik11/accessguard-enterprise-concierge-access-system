import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, ShieldCheck, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
const MOCK_LOGS = [
  { id: '1', visitor: 'Juan Pérez', rut: '12.345.678-9', apt: '402-A', time: new Date(), status: 'active' },
  { id: '2', visitor: 'Maria Garcia', rut: '15.221.334-K', apt: '101-B', time: new Date(Date.now() - 3600000), status: 'completed' },
  { id: '3', visitor: 'Delivery Rappi', rut: '23.445.123-4', apt: '805-C', time: new Date(Date.now() - 7200000), status: 'completed' },
  { id: '4', visitor: 'Carlos Soto', rut: '18.990.221-3', apt: '202-A', time: new Date(Date.now() - 10800000), status: 'denied' },
];
export function HomePage() {
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time overview of building access and compliance.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">Visits Today</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-green-600 font-medium">+12% from yesterday</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">Currently Inside</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-slate-400">Average stay: 45m</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">WhatsApp Alerts</CardTitle>
              <Bell className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-slate-400">Delivery success rate</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">Compliance Score</CardTitle>
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gold</div>
              <p className="text-xs text-slate-400">Data retention active</p>
            </CardContent>
          </Card>
        </div>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Access Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Visitor</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">RUT</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Apartment</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Entry Time</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LOGS.map((log) => (
                  <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{log.visitor}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">{log.rut}</TableCell>
                    <TableCell className="text-slate-600">{log.apt}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{format(log.time, 'HH:mm')}</TableCell>
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
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}