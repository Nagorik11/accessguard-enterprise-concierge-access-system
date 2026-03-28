import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, MessageSquare, Phone, Plus, Edit2, Trash2, Loader2, Car, Filter } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api-client';
import type { Resident } from '@shared/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
const residentSchema = z.object({
  fullName: z.string().min(3, "Mínimo 3 caracteres"),
  apartmentId: z.string().min(1, "Departamento requerido"),
  phone: z.string().min(8, "Teléfono inválido"),
  rut: z.string(),
  vehiclePlate: z.string(),
  whatsappOptIn: z.boolean(),
});
type ResidentFormValues = z.infer<typeof residentSchema>;
export function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      fullName: "",
      apartmentId: "",
      phone: "",
      rut: "",
      vehiclePlate: "",
      whatsappOptIn: true,
    },
  });
  const loadResidents = async () => {
    try {
      setLoading(true);
      const response = await api<{ items: Resident[] }>('/api/residents');
      setResidents(response.items || []);
    } catch (err) {
      toast.error("Error al cargar residentes");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadResidents();
  }, []);
  const onSubmit: SubmitHandler<ResidentFormValues> = async (values) => {
    try {
      if (editingId) {
        await api(`/api/residents/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        });
        toast.success("Residente actualizado");
      } else {
        await api('/api/residents', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        toast.success("Residente creado exitosamente");
      }
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
      loadResidents();
    } catch (error: any) {
      toast.error(error.message || "Fallo en la operación");
    }
  };
  const handleEdit = (resident: Resident) => {
    setEditingId(resident.id);
    form.reset({
      fullName: resident.fullName,
      apartmentId: resident.apartmentId,
      phone: resident.phone,
      rut: resident.rut || "",
      vehiclePlate: resident.vehiclePlate || "",
      whatsappOptIn: resident.whatsappOptIn,
    });
    setIsDialogOpen(true);
  };
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api(`/api/residents/${deleteConfirmId}`, { method: 'DELETE' });
      toast.success("Residente eliminado");
      setDeleteConfirmId(null);
      loadResidents();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };
  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.apartmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.vehiclePlate && r.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()));
    if (floorFilter === 'all') return matchesSearch;
    return matchesSearch && r.apartmentId.startsWith(floorFilter);
  });
  const floors = useMemo(() => {
    const floorSet = new Set<string>();
    residents.forEach(r => {
      const match = r.apartmentId.match(/^\d+/);
      if (match) floorSet.add(match[0]);
    });
    return Array.from(floorSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [residents]);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Directorio de Ocupantes</h1>
            <p className="text-slate-500 font-medium">Gestión de residentes y vehículos registrados.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Nombre, depto o patente..."
                className="pl-10 h-11 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-[140px] h-11 bg-white">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filtro Piso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier Piso</SelectItem>
                {floors.map(f => (
                  <SelectItem key={f} value={f}>Piso {f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) { setEditingId(null); form.reset(); }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-lg shadow-blue-100">
                  <Plus className="h-5 w-5 mr-2" /> Agregar Residente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">{editingId ? 'Actualizar Datos' : 'Registrar Residente'}</DialogTitle>
                  <DialogDescription>Ingrese la información del ocupante principal de la unidad.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="font-bold">Nombre Completo</FormLabel>
                          <FormControl><Input placeholder="Ej. Roberto Muñoz" className="h-12" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="apartmentId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Unidad/Departamento</FormLabel>
                          <FormControl><Input placeholder="101-A" className="h-12" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Teléfono de Contacto</FormLabel>
                          <FormControl><Input placeholder="+569..." className="h-12" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="rut" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">RUT (ID Personal)</FormLabel>
                          <FormControl><Input placeholder="12.345.678-9" className="h-12" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="vehiclePlate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Patente Vehículo</FormLabel>
                          <FormControl><Input placeholder="ABCD12" className="h-12 uppercase" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-bold">Notificaciones Digitales</FormLabel>
                        <p className="text-xs text-slate-500">Enviar avisos de visitas y encomiendas.</p>
                      </div>
                      <FormField control={form.control} name="whatsappOptIn" render={({ field }) => (
                        <FormItem><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                      )} />
                    </div>
                    <DialogFooter className="pt-4 gap-2">
                      <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="flex-1 h-12 font-bold">Cancelar</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1 h-12 font-black text-white" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? 'Guardar Cambios' : 'Confirmar Registro'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="shadow-sm border-none bg-white overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-bold">Accediendo a la base de datos central...</p>
              </div>
            ) : filteredResidents.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-medium italic">No se encontraron residentes registrados.</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100 uppercase text-[10px] font-black">
                    <TableHead className="pl-6 h-12">Nombre y RUT</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Alertas</TableHead>
                    <TableHead className="text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.map((resident) => (
                    <TableRow key={resident.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors h-16">
                      <TableCell className="pl-6">
                        <div className="font-bold text-slate-900">{resident.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{resident.rut || 'SIN RUT'}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="bg-blue-50 text-blue-700 font-black border-blue-100">{resident.apartmentId}</Badge></TableCell>
                      <TableCell className="text-slate-600 text-xs font-bold"><div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" /> {resident.phone}</div></TableCell>
                      <TableCell>{resident.vehiclePlate ? <div className="flex items-center gap-1.5 text-xs font-black text-slate-800"><Car className="h-3 w-3 text-indigo-500" /> {resident.vehiclePlate}</div> : <span className="text-slate-300 text-[10px]">Sin Registro</span>}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px] font-bold px-3 py-0.5 rounded-full", resident.whatsappOptIn ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400")}>
                          <MessageSquare className="h-3 w-3 mr-1" /> {resident.whatsappOptIn ? "ACTIVO" : "DESACT."}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 space-x-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 rounded-full" onClick={() => handleEdit(resident)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 rounded-full" onClick={() => setDeleteConfirmId(resident.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black text-xl">¿Confirmar Eliminación?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción es irreversible y removerá permanentemente al residente del directorio activo.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-black">Eliminar Registro</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}