import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
const loginSchema = z.object({
  username: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});
export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "staff",
      password: "staff123",
    },
  });
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const response = await api<{ user: any; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setSession(response.user, response.token);
      toast.success(`Bienvenido, ${response.user.fullName}`);
      navigate('/');
    } catch (error) {
      toast.error("Error de autenticación. Verifique sus credenciales.");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200 mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Conserjería Digital</h1>
          <p className="text-slate-500 font-medium">Control de Acceso y Seguridad</p>
        </div>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Panel Operativo</CardTitle>
            <CardDescription>Ingrese sus credenciales para gestionar el recinto.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identificador de Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clave de Seguridad</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : "Acceder al Sistema"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <p className="text-center text-xs text-slate-400">
          Software de gestión inmobiliaria exclusivo para personal autorizado.
        </p>
      </div>
    </div>
  );
}