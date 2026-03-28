import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  plate: z.string().min(4, "Patente demasiado corta").max(8, "Patente demasiado larga"),
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
    defaultValues: {
      plate: "",
      apartmentId: "",
      vehicleType: "car",
    },
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
      toast.error("Error al cargar datos de estacionamiento");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const onSubmit = async (values: z.infer<typeof parkingSchema>) => {
    try {
      await api('/api/parking', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success("Vehículo registrado exitosamente");
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (err) {
      toast.error("Error al registrar vehículo");
    }
  };
  const handleExit = async (id: string) => {
    try {
      await api(`/api/parking/${id}/exit`, { method: 'PUT' });
      toast.success("Salida de vehículo registrada");
      fetchData();
    } catch (err) {
      toast.error("Error al registrar salida");
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar registro?")) return;
    try {
      await api(`/api/parking/${id}`, { method: 'DELETE' });
      toast.success("Registro eliminado");
      fetchData();
    } catch (err) {
      toast.error("Error al eliminar");
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estacionamiento</h1>
            <p className="text-slate-500 mt-1">Control de ingreso y salida de vehículos.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar patente o depto..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Registrar Vehículo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Ingreso de Vehículo</DialogTitle>
                  <DialogDescription>Registre la patente y el departamento de destino.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="plate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patente</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. ABCD12" className="uppercase" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="apartmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {residents.map(r => (
                                  <SelectItem key={r.id} value={r.apartmentId}>{r.apartmentId}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicleType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="car">Automóvil</SelectItem>
                                <SelectItem value="moto">Motocicleta</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter className="pt-4 gap-2">
                      <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancelar</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">Registrar Ingreso</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Vehículos en el Edificio
            </CardTitle>
            <CardDescription>Bitácora de movimientos vehiculares hoy.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-20 text-slate-400 italic">No hay vehículos registrados recientemente.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 uppercase text-[10px] hover:bg-transparent">
                    <TableHead className="pl-6">Entrada</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Depto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right pr-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredLogs.map((log) => (
                      <motion.tr
                        key={log.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="text-xs text-slate-500 pl-6 py-4">
                          {format(log.entryTime, 'HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-900 tracking-widest uppercase">{log.plate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {log.vehicleType === 'car' ? 'auto' : log.vehicleType === 'moto' ? 'moto' : 'otro'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-blue-600">{log.apartmentId}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-2 py-0 gap-1",
                              log.status === 'parked' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                              log.status === 'exited' && "bg-slate-100 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {log.status === 'parked' ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            {log.status === 'parked' ? 'estacionado' : 'salida'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-2">
                          {log.status === 'parked' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                              onClick={() => handleExit(log.id)}
                            >
                              <ArrowRight className="h-3 w-3 mr-1" /> Registrar Salida
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => handleDelete(log.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}