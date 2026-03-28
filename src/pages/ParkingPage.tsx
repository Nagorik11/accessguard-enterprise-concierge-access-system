import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, Search, Plus, Loader2, Clock, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { ParkingLog, Resident } from '@shared/types';
import { motion, AnimatePresence } from 'framer-motion';
const parkingSchema = z.object({
  plate: z.string().min(4, "Patente corta").max(8, "Patente larga"),
  apartmentId: z.string().min(1, "Depto requerido"),
  vehicleType: z.enum(['car', 'moto', 'other']),
});
export function ParkingPage() {
  const [logs, setLogs] = useState<ParkingLog[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof parkingSchema>>({
    resolver: zodResolver(parkingSchema),
    defaultValues: { plate: "", apartmentId: "", vehicleType: "car" },
  });
  const fetchData = async () => {
    try {
      setLoading(true);
      const [parkingRes, residentsRes] = await Promise.all([
        api<{ items: ParkingLog[] }>('/api/parking'),
        api<{ items: Resident[] }>('/api/residents'),
      ]);
      setLogs(parkingRes.items || []);
      setResidents(residentsRes.items || []);
    } catch (err) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const onSubmit = async (values: z.infer<typeof parkingSchema>) => {
    try {
      await api('/api/parking', { method: 'POST', body: JSON.stringify(values) });
      toast.success("Vehículo ingresado");
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (err) {
      toast.error("Error al registrar");
    }
  };
  const handleExit = async (id: string) => {
    try {
      await api(`/api/parking/${id}/exit`, { method: 'PUT' });
      toast.success("Salida confirmada");
      fetchData();
    } catch (err) {
      toast.error("Error al registrar salida");
    }
  };
  const filteredLogs = logs.filter(l =>
    l.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.apartmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Estacionamiento</h1>
            <p className="text-slate-500 font-medium">Control en tiempo real de vehículos.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Patente o depto..." className="pl-10 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-200">
                  <Plus className="h-5 w-5 mr-2" /> Ingresar Vehículo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader><DialogTitle>Ingreso de Vehículo</DialogTitle></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField control={form.control} name="plate" render={({ field }) => (
                      <FormItem><FormLabel>Patente</FormLabel><FormControl>
                        <Input placeholder="ABCD12" className="h-12 uppercase font-black text-xl tracking-widest" {...field} />
                      </FormControl></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="apartmentId" render={({ field }) => (
                        <FormItem><FormLabel>Departamento</FormLabel><Select onValueChange={field.onChange}>
                          <FormControl><SelectTrigger className="h-12 font-bold"><SelectValue placeholder="Depto" /></SelectTrigger></FormControl>
                          <SelectContent>{residents.map(r => <SelectItem key={r.id} value={r.apartmentId} className="font-bold">{r.apartmentId}</SelectItem>)}</SelectContent>
                        </Select></FormItem>
                      )} />
                      <FormField control={form.control} name="vehicleType" render={({ field }) => (
                        <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="car">Auto</SelectItem><SelectItem value="moto">Moto</SelectItem><SelectItem value="other">Otro</SelectItem></SelectContent>
                        </Select></FormItem>
                      )} />
                    </div>
                    <DialogFooter className="pt-4"><Button type="submit" className="w-full h-12 text-lg font-black bg-blue-600">Registrar Ingreso</Button></DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" /> Movimientos Recientes
            </CardTitle>
            <div className="flex items-center gap-4 text-xs font-bold uppercase text-slate-400">
              <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {format(new Date(), 'dd/MM/yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && logs.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Sin registros hoy</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 uppercase text-[10px] font-black hover:bg-transparent">
                    <TableHead className="pl-6 h-10">Entrada</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Depto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right pr-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors h-16">
                      <TableCell className="text-xs font-black text-slate-500 pl-6">
                        {format(log.entryTime, 'HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono font-black text-xl text-slate-900 tracking-widest uppercase">{log.plate}</TableCell>
                      <TableCell className="font-black text-blue-700">Depto {log.apartmentId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px] font-black px-3 py-0.5 rounded-full", log.status === 'parked' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
                          {log.status === 'parked' ? 'EN INTERIOR' : 'SALIDA'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {log.status === 'parked' && (
                          <Button variant="outline" size="sm" className="h-10 font-black text-orange-700 border-orange-200 hover:bg-orange-50 px-4" onClick={() => handleExit(log.id)}>
                            <ArrowRight className="h-4 w-4 mr-2" /> Salida
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