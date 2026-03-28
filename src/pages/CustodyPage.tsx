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
import { Package, Search, Plus, Loader2, CheckCircle2, Clock, Trash2, Box } from 'lucide-react';
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
  recipientName: z.string().min(3, "Nombre requerido"),
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
    defaultValues: { apartmentId: "", itemDescription: "", recipientName: "", recipientType: "resident", motive: "" },
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
      toast.error("Error de datos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const onSubmit = async (values: z.infer<typeof itemSchema>) => {
    try {
      await api('/api/custody', { method: 'POST', body: JSON.stringify(values) });
      toast.success("Item en custodia");
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (err) {
      toast.error("Error al registrar");
    }
  };
  const handleDeliver = async (id: string) => {
    try {
      // Optimistic update
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'delivered', deliveredAt: Date.now() } : i));
      await api(`/api/custody/${id}/deliver`, { method: 'PUT' });
      toast.success("Entregado con éxito");
      fetchData();
    } catch (err) {
      toast.error("Error al entregar");
      fetchData();
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Custodia y Paquetes</h1>
            <p className="text-slate-500 font-medium">Inventario de encomiendas en conserjería.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar depto o item..." className="pl-10 h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-200">
                  <Plus className="h-5 w-5 mr-2" /> Recibir Paquete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Nueva Recepción de Custodia</DialogTitle></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="apartmentId" render={({ field }) => (
                        <FormItem><FormLabel>Depto</FormLabel><Select onValueChange={field.onChange}>
                          <FormControl><SelectTrigger className="h-12 font-bold"><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                          <SelectContent>{residents.map(r => <SelectItem key={r.id} value={r.apartmentId} className="font-bold">{r.apartmentId}</SelectItem>)}</SelectContent>
                        </Select></FormItem>
                      )} />
                      <FormField control={form.control} name="recipientType" render={({ field }) => (
                        <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="h-12"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="resident">Residente</SelectItem><SelectItem value="visitor">Visita</SelectItem></SelectContent>
                        </Select></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="recipientName" render={({ field }) => (
                      <FormItem><FormLabel>Nombre Destinatario</FormLabel><FormControl><Input placeholder="Ej. Juan Carlos" className="h-12 font-bold" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="itemDescription" render={({ field }) => (
                      <FormItem><FormLabel>Descripción Item</FormLabel><FormControl><Input placeholder="Ej. Caja Amazon, Sobre Chilexpress" className="h-12" {...field} /></FormControl></FormItem>
                    )} />
                    <DialogFooter className="pt-4"><Button type="submit" className="w-full h-12 text-lg font-black bg-blue-600">Guardar Registro</Button></DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2"><Package className="h-5 w-5 text-blue-600" /> Control de Custodia</CardTitle>
            <Badge className="bg-blue-100 text-blue-700 font-bold border-none">{filteredItems.filter(i => i.status === 'in_custody').length} PENDIENTES</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {loading && items.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Sin items en custodia</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 uppercase text-[10px] font-black hover:bg-transparent">
                    <TableHead className="pl-6 h-10">Fecha</TableHead>
                    <TableHead>Depto</TableHead>
                    <TableHead>Item / Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right pr-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredItems.map((item) => (
                      <motion.tr key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-slate-50 hover:bg-slate-50/50 h-20 transition-colors">
                        <TableCell className="text-xs font-black text-slate-500 pl-6">{format(item.receivedAt, 'dd/MM HH:mm')}</TableCell>
                        <TableCell className="font-black text-blue-700 text-lg">Depto {item.apartmentId}</TableCell>
                        <TableCell>
                          <div className="text-sm font-black text-slate-900">{item.itemDescription}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.recipientName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("text-[10px] font-black px-3 py-0.5 rounded-full", item.status === 'in_custody' ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-green-100 text-green-700 border-green-200")}>
                            {item.status === 'in_custody' ? 'PENDIENTE ENTREGA' : 'ENTREGADO'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {item.status === 'in_custody' && (
                            <Button variant="outline" size="sm" className="h-10 font-black text-green-700 border-green-200 hover:bg-green-50 px-6" onClick={() => handleDeliver(item.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Entregar
                            </Button>
                          )}
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