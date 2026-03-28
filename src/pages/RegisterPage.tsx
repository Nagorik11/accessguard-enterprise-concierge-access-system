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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isValidRut, formatRut } from '@/lib/validators';
import { toast } from 'sonner';
import { ShieldAlert, Send, CheckCircle2, UserPlus, Video, Printer, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api-client';
import { VideoCallModal } from '@/components/VideoCallModal';
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
  videoVerified: z.boolean(),
  verificationRoomId: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof formSchema>;

export function RegisterPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoadingResidents, setIsLoadingResidents] = useState(true);
  const [submittedData, setSubmittedData] = useState<VisitLog | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: "",
      visitorRut: "",
      apartmentId: "",
      purpose: "",
      otherPurpose: "",
      legalConsent: false,
      videoVerified: false,
    },
  });
  const apartmentId = form.watch("apartmentId");
  const visitorName = form.watch("visitorName");
  const videoVerified = form.watch("videoVerified");
  useEffect(() => {
    async function loadResidents() {
      try {
        const response = await api<{ items: Resident[] }>('/api/residents');
        setResidents(response.items || []);
      } catch (err) {
        toast.error("Error al cargar el directorio");
      } finally {
        setIsLoadingResidents(false);
      }
    }
    loadResidents();
  }, []);
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const values = form.getValues();
    if (!form.formState.isValid) {
      toast.error("Complete todos los campos requeridos");
      return;
    }
    await form.handleSubmit(async (values: RegisterFormValues) => {
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
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast.success("Ingreso Autorizado por Conserjería Digital");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Fallo en el registro");
      }
    })();
  };
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    form.setValue("visitorRut", formatted, { shouldValidate: true });
  };
  const handleVideoVerified = (roomId: string) => {
    form.setValue("videoVerified", true);
    form.setValue("verificationRoomId", roomId);
    toast.success("Verificación de video confirmada");
  };
  if (isSuccess && submittedData) {
    return (
      <AppLayout container>
        <div className="max-w-md mx-auto py-10">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
            <Card className="border-none shadow-2xl overflow-hidden bg-white">
              <div className="bg-green-600 p-8 text-center text-white">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-3xl font-black uppercase tracking-tight">¡Autorizado!</h1>
                <p className="text-green-100 font-bold mt-2">Acceso verificado por sistema digital</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-400">Visitante</p>
                    <p className="text-lg font-black text-slate-900">{submittedData.visitorName}</p>
                    <p className="text-xs font-mono font-bold text-slate-500">{submittedData.visitorRut}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase font-black text-slate-400">Destino</p>
                    <p className="text-2xl font-black text-blue-600">Unidad {submittedData.apartmentId}</p>
                  </div>
                </div>
                {submittedData.videoVerified && (
                  <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-4 text-white border-l-4 border-blue-500">
                    <Video className="h-6 w-6 text-blue-400" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 leading-none">Identidad Confirmada</p>
                      <p className="text-xs font-medium">Verificación por Videollamada</p>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Send className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase">Notificación enviada al residente</span>
                  </div>
                  <p className="text-xs font-bold text-blue-800 leading-relaxed italic">
                    "Conserjería Digital: El visitante {submittedData.visitorName} acaba de ser autorizado."
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 p-6 flex gap-3">
                <Button variant="outline" className="flex-1 h-12 font-bold text-slate-600" onClick={() => window.print()}>
                  <Printer className="h-5 w-5 mr-2" /> Comprobante
                </Button>
                <Button className="flex-1 h-12 font-black bg-slate-900" onClick={() => { setIsSuccess(false); form.reset(); }}>
                  Nuevo Registro
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-none">
          <CardHeader className="space-y-2 border-b bg-slate-50 p-8">
            <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-blue-600" />
              Gestión de Acceso
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Complete la ficha de ingreso para autorizar al visitante en el sistema digital.
            </CardDescription>
          </CardHeader>
          <Form {...form as any}>
            <form onSubmit={onSubmit} className="space-y-6">
              <CardContent className="space-y-8 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="visitorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Nombre del Visitante</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan Pérez" className="h-12 text-lg font-bold" {...field} />
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
                        <FormLabel className="font-bold text-slate-700">RUT / Identificación</FormLabel>
                        <FormControl>
                          <Input placeholder="12.345.678-9" className="h-12 text-lg font-mono font-bold" {...field} onChange={handleRutChange} />
                        </FormControl>
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
                        <FormLabel className="font-bold text-slate-700">Unidad de Destino</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-lg font-black text-blue-700">
                              <SelectValue placeholder={isLoadingResidents ? "Cargando directorio..." : "Seleccionar depto"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {residents.map((r) => (
                              <SelectItem key={r.id} value={r.apartmentId}>
                                <span className="font-black">Unidad {r.apartmentId}</span> - {r.fullName}
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
                        <FormLabel className="font-bold text-slate-700">Motivo de la Visita</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 font-bold">
                              <SelectValue placeholder="Seleccione motivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VISIT_PURPOSES.map((p) => (
                              <SelectItem key={p} value={p} className="font-medium">{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl border-b-4 border-blue-600 shadow-xl overflow-hidden relative">
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-blue-600/10 skew-x-12 translate-x-10" />
                  <div className="relative space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-400" />
                      <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Verificación Biométrica</p>
                    </div>
                    <h4 className="text-white font-black text-lg">Videollamada con Residente</h4>
                    <p className="text-xs text-slate-400 font-medium">Confirme la identidad del visitante en tiempo real.</p>
                  </div>
                  {videoVerified ? (
                    <Badge className="bg-green-500 text-white font-black px-4 py-2 text-sm rounded-xl">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> VERIFICADO
                    </Badge>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={() => setIsVideoModalOpen(true)}
                      disabled={!apartmentId || !visitorName}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 relative z-10"
                    >
                      Iniciar Llamada
                    </Button>
                  )}
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <ShieldAlert className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Protección de Datos Personales</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Los datos registrados se procesan bajo la Ley 19.628 de protección de vida privada y serán eliminados automáticamente según la política del edificio.
                      </p>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="legalConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 bg-white rounded-xl border shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-6 w-6" />
                        </FormControl>
                        <FormLabel className="text-sm font-black text-slate-700 cursor-pointer select-none">
                          He verificado la identidad y el visitante acepta el registro de sus datos.
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 p-8 flex justify-end gap-4 rounded-b-2xl border-t">
                <Button variant="ghost" type="button" className="h-14 px-8 font-bold text-slate-500" onClick={() => form.reset()}>Limpiar Formulario</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] h-14 text-xl font-black shadow-lg shadow-blue-200" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Validar e Ingresar"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      <VideoCallModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onVerified={handleVideoVerified}
        apartmentId={apartmentId}
        visitorName={visitorName}
      />
    </AppLayout>
  );
}