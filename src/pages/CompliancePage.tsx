import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MessageSquare, Scale, Save, Loader2, Info, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import type { ComplianceSettings } from '@shared/types';
import { toast } from 'sonner';
export function CompliancePage() {
  const [settings, setSettings] = useState<ComplianceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const user = useAuthStore(s => s.user);
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
    if (!settings) return;
    setSaving(true);
    try {
      await api('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      toast.success("Configuración actualizada correctamente");
    } catch (err) {
      toast.error("Fallo al guardar configuración");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </AppLayout>
    );
  }
  const isAdmin = user?.role === 'admin';
  return (
    <AppLayout container>
      <div className="space-y-8">
        {!isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">Modo Solo Lectura: Solo los administradores pueden modificar estas políticas.</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cumplimiento y Legal</h1>
            <p className="text-slate-500 mt-1">Gestione retención de datos, políticas y comunicaciones.</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            disabled={saving || !isAdmin}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Cambios
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                Política de Retención de Datos
              </CardTitle>
              <CardDescription>
                Configure el tiempo de almacenamiento de datos antes de la anonimización.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Auto-eliminación de Registros</Label>
                  <p className="text-xs text-slate-500">Limpieza automática de datos personales.</p>
                </div>
                <Switch
                  disabled={!isAdmin}
                  checked={settings?.autoDeleteEnabled}
                  onCheckedChange={(val) => setSettings(s => s ? { ...s, autoDeleteEnabled: val } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="retention" className="text-sm font-semibold">Periodo de Retención (Días)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="retention"
                    type="number"
                    disabled={!isAdmin}
                    className="max-w-[120px]"
                    value={settings?.retentionDays}
                    onChange={(e) => setSettings(s => s ? { ...s, retentionDays: parseInt(e.target.value) || 0 } : null)}
                  />
                  <span className="text-sm text-slate-500">días tras finalizar visita.</span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Recomendado: Mínimo 15 días para auditorías de seguridad.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Estado WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Estado de Plantilla:</span>
                <Badge className="bg-green-100 text-green-700 border-none capitalize">
                  {settings?.whatsappTemplateStatus === 'approved' ? 'aprobado' : settings?.whatsappTemplateStatus}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded text-[11px] font-mono text-slate-500 border border-slate-100 leading-relaxed">
                "Hola {`{residente}`}, AccessGuard informa: El visitante {`{visitante}`} está ingresando..."
              </div>
              <Button variant="outline" className="w-full text-xs h-8" disabled={!isAdmin}>Probar Integración</Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-slate-600" />
                Avisos de Privacidad y Legales
              </CardTitle>
              <CardDescription>
                Documentos legales accesibles para los visitantes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="policy-url" className="text-sm font-semibold">URL Política de Privacidad</Label>
                <Input
                  id="policy-url"
                  disabled={!isAdmin}
                  placeholder="https://ejemplo.com/privacidad"
                  value={settings?.privacyPolicyUrl}
                  onChange={(e) => setSettings(s => s ? { ...s, privacyPolicyUrl: e.target.value } : null)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Este enlace aparece en la declaración legal del formulario de registro.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}