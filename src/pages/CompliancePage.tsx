import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MessageSquare, Scale, Save, Loader2, AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import type { ComplianceSettings } from '@shared/types';
import { toast } from 'sonner';
export function CompliancePage() {
  const [settings, setSettings] = useState<ComplianceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api<ComplianceSettings>('/api/settings');
        setSettings(data);
      } catch (err) {
        toast.error("Error al cargar configuración de cumplimiento");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);
  const handleSave = async () => {
    if (!settings || !isAdmin) return;
    setSaving(true);
    try {
      await api('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      toast.success("Políticas de privacidad actualizadas");
    } catch (err) {
      toast.error("Fallo al guardar configuración");
    } finally {
      setSaving(false);
    }
  };
  const handleManualCleanup = async () => {
    if (!window.confirm("ADVERTENCIA: ¿Ejecutar purga de datos ahora? Esta acción eliminará permanentemente los registros que exceden el plazo de retención.")) return;
    setCleaning(true);
    try {
      const res = await api<any>('/api/settings/cleanup', { method: 'POST' });
      toast.success(`Limpieza completada: ${res.visitsDeleted} visitas, ${res.parkingDeleted} parking y ${res.itemsDeleted} paquetes purgados.`);
    } catch (err) {
      toast.error("Error durante el proceso de purga manual");
    } finally {
      setCleaning(false);
    }
  };
  if (loading) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container className="bg-slate-50">
      <div className="space-y-8 max-w-5xl mx-auto">
        {!isAdmin && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-lg flex items-center gap-4 text-amber-900 shadow-sm">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-black text-sm uppercase tracking-tight">Acceso de Solo Lectura</p>
              <p className="text-xs font-medium">Solo administradores pueden modificar parámetros de seguridad.</p>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Políticas de Privacidad</h1>
            <p className="text-slate-500 font-medium">Gestión de cumplimiento normativo y retención de datos.</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-8 shadow-lg shadow-blue-100"
            onClick={handleSave}
            disabled={saving || !isAdmin}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            Aplicar Cambios
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="shadow-sm border-none lg:col-span-8 overflow-hidden">
            <CardHeader className="bg-white border-b p-6">
              <CardTitle className="text-lg font-black flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                Ciclo de Vida de los Datos
              </CardTitle>
              <CardDescription>Defina cuánto tiempo se almacenarán los registros personales.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <div className="space-y-1">
                  <Label className="text-base font-black text-slate-900">Purga Automática de Registros</Label>
                  <p className="text-xs text-slate-500 font-medium">Eliminación sistemática de bitácoras antiguas.</p>
                </div>
                <Switch
                  disabled={!isAdmin}
                  className="data-[state=checked]:bg-blue-600"
                  checked={settings?.autoDeleteEnabled ?? false}
                  onCheckedChange={(val) => setSettings(s => s ? { ...s, autoDeleteEnabled: val } : null)}
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="retention" className="text-sm font-black uppercase text-slate-500 tracking-widest">Plazo de Retención</Label>
                <div className="flex items-center gap-6">
                  <div className="relative max-w-[160px]">
                    <Input
                      id="retention"
                      type="number"
                      disabled={!isAdmin}
                      className="h-14 text-2xl font-black text-center pr-12"
                      value={settings?.retentionDays ?? 30}
                      onChange={(e) => setSettings(s => s ? { ...s, retentionDays: parseInt(e.target.value) || 0 } : null)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Días</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none lg:col-span-4 h-fit">
            <CardHeader className="border-b bg-green-50/30">
              <CardTitle className="text-lg font-black flex items-center gap-3 text-green-800">
                <MessageSquare className="h-6 w-6 text-green-600" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Badge className="bg-green-100 text-green-700 font-black border-none uppercase text-[10px] px-3">
                SISTEMA ACTIVO
              </Badge>
              <div className="p-4 bg-slate-900 rounded-xl font-mono text-[10px] text-green-400 border border-slate-800 leading-relaxed shadow-inner">
                <p>"Visita autorizada para Unidad {settings?.id || '---'}."</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-2 border-red-100 lg:col-span-12 bg-red-50/20 overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-red-900">Mantenimiento de Datos</h3>
                  <p className="text-sm font-medium text-red-700/80 leading-relaxed max-w-2xl">
                    La purga manual fuerza la eliminación inmediata de registros fuera del plazo legal de {settings?.retentionDays ?? 30} días.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleManualCleanup}
                disabled={cleaning || !isAdmin}
                className="h-14 px-10 font-black text-lg shadow-xl"
              >
                {cleaning ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Trash2 className="h-6 w-6 mr-2" />}
                PURGAR BITÁCORA
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none lg:col-span-12">
            <CardHeader className="border-b p-6">
              <CardTitle className="text-lg font-black flex items-center gap-3">
                <Scale className="h-6 w-6 text-slate-600" />
                Información Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-4">
                <Label htmlFor="policy-url" className="text-sm font-black uppercase text-slate-500">URL Privacidad</Label>
                <Input
                  id="policy-url"
                  disabled={!isAdmin}
                  className="h-12 bg-slate-50"
                  placeholder="https://..."
                  value={settings?.privacyPolicyUrl ?? ''}
                  onChange={(e) => setSettings(s => s ? { ...s, privacyPolicyUrl: e.target.value } : null)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}