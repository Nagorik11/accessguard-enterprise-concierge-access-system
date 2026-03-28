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
import { Package, Search, Plus, Loader2, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CustodyItem, Resident } from '@shared/types';
import { motion, AnimatePresence } from 'framer-motion';
const itemSchema = z.object({
  apartmentId: z.string().min(1, "Depto requerido"),
  itemDescription: z.string().min(3, "Descripción requerida"),
  recipientName: z.string().min(3, "Nombre de destinatario requerido"),
  recipientType: z.enum(['resident', 'visitor']),
  motive: z.string().optional(),
});
export function CustodyPage() {
  const [items, setItems] = useState<CustodyItem[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      apartmentId: "",
      itemDescription: "",
      recipientName: "",
      recipientType: "resident",
      motive: "",
    },
  });
  const fetchData = async () => {
    try {
      setLoading(true);
      const [custodyRes, residentsRes] = await Promise.all([
        api<{ items: CustodyItem[] }>('/api/custody'),
        api<{ items: Resident[] }>('/api/residents'),
      ]);
      setItems(custodyRes.items || []);
      setResidents(residentsRes.items || []);
    } catch (err) {
      toast.error("Error al cargar datos de custodia");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const onSubmit = async (values: z.infer<typeof itemSchema>) => {
    try {
      await api('/api/custody', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success("Item registrado en custodia");
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (err) {
      toast.error("Error al registrar item");
    }
  };
  const handleDeliver = async (id: string) => {
    try {
      await api(`/api/custody/${id}/deliver`, { method: 'PUT' });
      toast.success("Item entregado con éxito");
      fetchData();
    } catch (err) {
      toast.error("Error al marcar como entregado");
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar registro permanentemente?")) return;
    try {
      await api(`/api/custody/${id}`, { method: 'DELETE' });
      toast.success("Registro eliminado");
      fetchData();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };
  const filteredItems = items.filter(i =>
    i.apartmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Custodia y Paquetes</h1>
            <p className="text-slate-500 mt-1">Gestión de encomiendas y objetos en conserjería.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar depto o item..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Registrar Paquete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Nueva Recepción de Custodia</DialogTitle>
                  <DialogDescription>Ingrese los detalles del paquete o item para su custodia en conserjería.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                        name="recipientType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo Destinatario</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="resident">Residente</SelectItem>
                                <SelectItem value="visitor">Visita / Otro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="recipientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Destinatario</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Juan Carlos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="itemDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción del Item</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Caja mediana Amazon, Sobre Chilexpress" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Frágil, Urgente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="pt-4 gap-2">
                      <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancelar</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1">Guardar Registro</Button>
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
              <Package className="h-5 w-5 text-blue-600" />
              Inventario de Custodia
            </CardTitle>
            <CardDescription>Lista de paquetes pendientes de retiro y entregados.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 text-slate-400 italic">No hay paquetes en custodia actualmente.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 uppercase text-[10px] hover:bg-transparent">
                    <TableHead className="pl-6">Fecha</TableHead>
                    <TableHead>Depto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredItems.map((item) => (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="text-xs text-slate-500 pl-6 py-4">
                          {format(item.receivedAt, 'dd/MM HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell className="font-bold text-blue-700">{item.apartmentId}</TableCell>
                        <TableCell className="text-slate-900 font-medium">{item.itemDescription}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{item.recipientName}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{item.recipientType === 'resident' ? 'residente' : 'externo'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-2 py-0 gap-1",
                              item.status === 'in_custody' && "bg-orange-100 text-orange-700 hover:bg-orange-100",
                              item.status === 'delivered' && "bg-green-100 text-green-700 hover:bg-green-100"
                            )}
                          >
                            {item.status === 'in_custody' ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            {item.status === 'in_custody' ? 'en custodia' : 'entregado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-2">
                          {item.status === 'in_custody' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => handleDeliver(item.id)}
                            >
                              Entregar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => handleDelete(item.id)}
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