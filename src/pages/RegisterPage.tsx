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
import { ShieldAlert, Send, CheckCircle2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api-client';
import type { Resident, VisitLog } from '@shared/types';
const formSchema = z.object({
  visitorName: z.string().min(3, "Full name is required"),
  visitorRut: z.string().refine((val) => isValidRut(val), {
    message: "Invalid Chilean RUT",
  }),
  apartmentId: z.string().min(1, "Please select an apartment"),
  purpose: z.string().min(1, "Please enter visit purpose"),
  legalConsent: z.boolean().refine((val) => val === true, {
    message: "Legal consent is mandatory for access",
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
      legalConsent: false,
    },
  });
  useEffect(() => {
    async function loadResidents() {
      try {
        const response = await api<{ items: Resident[] }>('/api/residents');
        setResidents(response.items);
      } catch (err) {
        console.error("Failed to load residents", err);
        toast.error("Failed to load resident directory");
      } finally {
        setIsLoadingResidents(false);
      }
    }
    loadResidents();
  }, []);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await api<VisitLog>('/api/visits', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      setSubmittedData(result);
      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("Visit registered successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 pt-12"
          >
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Access Granted</h1>
              <p className="text-slate-500">Visitor <b>{submittedData.visitorName}</b> has been cleared for entry to <b>Apt {submittedData.apartmentId}</b>.</p>
            </div>
            <Card className="bg-slate-900 text-white text-left border-none shadow-xl overflow-hidden">
              <div className="bg-green-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Send className="h-3 w-3" /> WhatsApp Template Sent
              </div>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-slate-300">Resident notification preview:</p>
                <div className="bg-slate-800 rounded p-3 text-sm italic border-l-2 border-green-500">
                  "Hola Resident, AccessGuard informa: El visitante {submittedData.visitorName} con RUT {submittedData.visitorRut} está ingresando a su depto {submittedData.apartmentId}. Motivo: {submittedData.purpose}."
                </div>
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full" onClick={() => { setIsSuccess(false); form.reset(); setSubmittedData(null); }}>
              Register Another Visit
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              New Visitor Registration
            </CardTitle>
            <CardDescription>
              Enter visitor details. All fields are required for legal compliance.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visitorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Juan Pérez" {...field} />
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
                        <FormLabel>RUT (ID Number)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12.345.678-9"
                            {...field}
                            onChange={handleRutChange}
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Automatic Modulo 11 validation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="apartmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Apartment</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingResidents ? "Loading units..." : "Select unit"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {residents.map((r) => (
                              <SelectItem key={r.id} value={r.apartmentId}>
                                {r.apartmentId} ({r.fullName})
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
                        <FormLabel>Purpose of Visit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Delivery, Guest, Maintenance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Legal Disclosure</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        By registering this visit, you confirm the visitor has been informed about our data privacy policy.
                        Data is stored for security purposes for 30 days and then anonymized.
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
                          <FormLabel className="text-xs font-medium cursor-pointer">
                            I confirm that legal consent was obtained for data processing.
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-6 flex justify-end gap-3 rounded-b-lg border-t">
                <Button variant="ghost" type="button" onClick={() => form.reset()}>Clear Form</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Validating..." : "Grant Access"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}