import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, ShieldCheck, Bell, LogOut, Loader2 } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import type { VisitLog } from '@shared/types';
import { toast } from 'sonner';
export function HomePage() {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchVisits = async () => {
    try {
      const response = await api<{ items: VisitLog[] }>('/api/visits');
      setVisits(response.items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load access logs");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVisits();
  }, []);
  const handleCheckOut = async (id: string) => {
    try {
      await api(`/api/visits/${id}/exit`, { method: 'POST' });
      toast.success("Visitor checked out");
      fetchVisits();
    } catch (err) {
      toast.error("Failed to check out visitor");
    }
  };
  const visitsToday = visits.filter(v => isToday(new Date(v.entryTime))).length;
  const currentlyInside = visits.filter(v => v.status === 'active').length;
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time building access monitor.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchVisits} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">Visits Today</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitsToday}</div>
              <p className="text-xs text-slate-400 font-medium">Recorded since midnight</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">Currently Inside</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentlyInside}</div>
              <p className="text-xs text-slate-400 font-medium">Awaiting check-out</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">WhatsApp Alerts</CardTitle>
              <Bell className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-slate-400">System online</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase">Compliance</CardTitle>
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">Active</div>
              <p className="text-xs text-slate-400">Data retention enforced</p>
            </CardContent>
          </Card>
        </div>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Access Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && visits.length === 0 ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
            ) : visits.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic">No access records found for today.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Visitor</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Apartment</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Entry</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Exit</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Status</TableHead>
                    <TableHead className="text-right text-slate-400 font-bold uppercase text-[10px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((log) => (
                    <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-slate-900">{log.visitorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{log.visitorRut}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-semibold">{log.apartmentId}</TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {format(log.entryTime, 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {log.exitTime ? format(log.exitTime, 'HH:mm') : '—'}
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
                          {log.status}
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
                            Check Out
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