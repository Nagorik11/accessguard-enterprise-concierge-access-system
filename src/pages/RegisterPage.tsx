import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isValidRut, formatRut } from '@/lib/validators';
import { toast } from 'sonner';
import { ShieldAlert, Send, CheckCircle2, UserPlus, FileText, Printer, ArrowLeft, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api-client';
import type { Resident, VisitLog } from '@shared/types';
import { VISIT_PURPOSES } from '@shared/types';
const formSchema = z.object({
  visitorName: z.string().min(3, "Se requiere nombre completo"),
  visitorRut: z.string().refine((val) => isValidRut(val), {
    message: "RUT Chileno inválido",
  }),
  apartmentId: z.string().min(1, "Seleccione un departamento"),
  purpose: z.string().min(1, "Indique el motivo de la visita"),
  otherPurpose: z.string().optional(),
  legalConsent: z.boolean().refine((val) => val === true, {
    message: "El consentimiento legal es obligatorio",
  }),
});
export function RegisterPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoadingResidents, setIsLoadingResidents] = useState(true);
  const [submittedData, setSubmittedData] = useState<VisitLog | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: "",
      visitorRut: "",
      apartmentId: "",
      purpose: "",
      otherPurpose: "",
      legalConsent: false,
    },
  });
  const selectedPurpose = form.watch("purpose");
  useEffect(() => {
    async function loadResidents() {
      try {
        const response = await api<{ items: Resident[] }>('/api/residents');
        setResidents(response.items || []);
      } catch (err) {
        console.error("Error al cargar residentes", err);
        toast.error("Error al cargar el directorio de residentes");
      } finally {
        setIsLoadingResidents(false);
      }
    }
    loadResidents();
  }, []);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const finalPurpose = values.purpose === "Otros" 
        ? `Otros: ${values.otherPurpose || 'No especificado'}`
        : values.purpose;
      const result = await api<VisitLog>('/api/visits', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          purpose: finalPurpose
        })
      });
      setSubmittedData(result);
      setIsSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("Visita registrada con éxito");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fallo en el registro");
    }
  };
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    form.setValue("visitorRut", formatted, { shouldValidate: true });
  };
  if (isSuccess && submittedData) {
    return (
      <AppLayout container>
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-sm">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">¡Acceso Autorizado!</h1>
              <p className="text-slate-500 text-sm">Registro completado exitosamente en el sistema.</p>
            </div>
            <Card className="border-none shadow-2xl overflow-hidden bg-white">
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Ticket de Acceso</span>
                </div>
                <span className="text-[10px] font-mono opacity-50">#{submittedData.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Visitante</p>
                    <p className="text-sm font-semibold text-slate-800">{submittedData.visitorName}</p>
                    <p className="text-[10px] font-mono text-slate-500">{submittedData.visitorRut}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Destino</p>
                    <p className="text-sm font-bold text-blue-600">Depto {submittedData.apartmentId}</p>
                  </div>
                </div>
                <div className="h-px bg-slate-100 w-full" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <Send className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Notificación WhatsApp Enviada</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
                    "Hola, AccessGuard informa: El visitante <strong>{submittedData.visitorName}</strong> está ingresando a su depto <strong>{submittedData.apartmentId}</strong>. Motivo: {submittedData.purpose}."
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
                <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => window.print()}>
                  <Printer className="h-3 w-3 mr-2" /> Imprimir
                </Button>
                <Button className="flex-1 h-9 text-xs bg-slate-900" onClick={() => { setIsSuccess(false); form.reset(); setSubmittedData(null); }}>
                  Nuevo Registro
                </Button>
              </CardFooter>
            </Card>
            <button
              onClick={() => { setIsSuccess(false); form.reset(); setSubmittedData(null); }}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 text-xs transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Volver al formulario
            </button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-none">
          <CardHeader className="space-y-1 border-b bg-slate-50/50 rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              Nuevo Registro de Visitante
            </CardTitle>
            <CardDescription>
              Complete el formulario para autorizar el ingreso al edificio.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="visitorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan Pérez" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visitorRut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUT (ID Nacional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12.345.678-9"
                            className="h-10"
                            {...field}
                            onChange={handleRutChange}
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Validación automática Módulo 11
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="apartmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento de Destino</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={isLoadingResidents ? "Cargando..." : "Seleccione unidad"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {residents.map((r) => (
                              <SelectItem key={r.id} value={r.apartmentId}>
                                <div className="flex flex-col items-start gap-0.5">
                                  <span>{r.apartmentId} ({r.fullName})</span>
                                  {r.vehiclePlate && (
                                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                      <Car className="h-2 w-2" /> Patente: {r.vehiclePlate}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo de la Visita</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Seleccione motivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VISIT_PURPOSES.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {selectedPurpose === "Otros" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <FormField
                      control={form.control}
                      name="otherPurpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especifique Motivo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Entrega de documentos" className="h-10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4 min-h-[140px]">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cumplimiento Legal y Privacidad</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Sus datos serán tratados según la Ley 19.628. Al registrarse, acepta que su visita sea informada al residente
                        y que sus datos se almacenen por seguridad durante 30 días.
                      </p>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="legalConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs font-medium cursor-pointer text-slate-600">
                            Confirmo que el visitante acepta la política de privacidad.
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-6 flex justify-end gap-3 rounded-b-lg border-t">
                <Button variant="ghost" type="button" onClick={() => form.reset()}>Limpiar</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px] h-11" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Procesando..." : "Autorizar Ingreso"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}