import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Search, MessageSquare, Phone, User, Plus, Edit2, Trash2, Loader2, Car, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
  rut: z.string().optional().or(z.literal('')),
  vehiclePlate: z.string().optional().or(z.literal('')),
  whatsappOptIn: z.boolean().default(true),
});
type ResidentFormValues = z.infer<typeof residentSchema>;
export function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      console.error("Error loading residents:", err);
      toast.error("Error al cargar residentes");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadResidents();
  }, []);
  const onSubmit = async (values: ResidentFormValues) => {
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
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este residente permanentemente?")) return;
    try {
      await api(`/api/residents/${id}`, { method: 'DELETE' });
      toast.success("Residente eliminado");
      loadResidents();
    } catch (err) {
      toast.error("Error al eliminar residente");
    }
  };
  const filteredResidents = residents.filter(r =>
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.apartmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.vehiclePlate && r.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Directorio de Residentes</h1>
            <p className="text-slate-500 mt-1">Gestión integral de ocupantes y vehículos autorizados.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, depto o patente..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingId(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Nuevo Residente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Residente' : 'Agregar Nuevo Residente'}</DialogTitle>
                  <DialogDescription>
                    Ingrese los datos del ocupante principal del departamento.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej. Roberto Muñoz" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apartmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento</FormLabel>
                            <FormControl>
                              <Input placeholder="101-A" {...field} />
                            </FormControl>
                            <FormDescription className="text-[10px]">Debe ser único en el sistema.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono de Contacto</FormLabel>
                            <FormControl>
                              <Input placeholder="+569..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RUT (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="12.345.678-9" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehiclePlate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patente Vehículo</FormLabel>
                            <FormControl>
                              <Input placeholder="ABCD12" className="uppercase" {...field} />
                            </FormControl>
                            <FormDescription className="text-[10px]">Para acceso automático.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Notificaciones WhatsApp</FormLabel>
                        <p className="text-xs text-slate-500">Enviar avisos de visitas y encomiendas.</p>
                      </div>
                      <FormField
                        control={form.control}
                        name="whatsappOptIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter className="pt-4 gap-2">
                      <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancelar</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex-1" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Guardar Cambios' : 'Registrar Residente'}
                      </Button>
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
              <User className="h-5 w-5 text-blue-600" />
              Lista de Ocupación Autorizada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
                <p className="text-sm font-medium">Sincronizando directorio...</p>
              </div>
            ) : filteredResidents.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic">No se encontraron residentes.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="pl-6 text-slate-400 font-bold uppercase text-[10px]">Residente</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Depto</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Contacto</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Vehículo</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">WhatsApp</TableHead>
                    <TableHead className="text-right pr-6 text-slate-400 font-bold uppercase text-[10px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.map((resident) => (
                    <TableRow key={resident.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="font-semibold text-slate-900">{resident.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{resident.rut || 'SIN RUT'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 font-mono text-xs text-blue-700 border-blue-100">
                          {resident.apartmentId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" /> {resident.phone}</div>
                      </TableCell>
                      <TableCell>
                        {resident.vehiclePlate ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Car className="h-3 w-3 text-indigo-500" />
                            {resident.vehiclePlate}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px]">Sin vehículo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-2 py-0 gap-1",
                            resident.whatsappOptIn
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                          )}
                        >
                          <MessageSquare className={cn("h-3 w-3", resident.whatsappOptIn ? "text-green-600" : "text-slate-400")} />
                          {resident.whatsappOptIn ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEdit(resident)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(resident.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
          <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900">Privacidad y Protección de Datos</h4>
            <p className="text-xs text-blue-700/80 leading-relaxed">
              Toda la información contenida en este directorio está sujeta a la Ley de Protección de la Vida Privada.
              El personal de conserjería tiene prohibido compartir estos datos con terceros externos al edificio
              sin autorización judicial expresa.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}