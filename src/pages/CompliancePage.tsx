import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MessageSquare, Scale, Save, Loader2, Info } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { ComplianceSettings } from '@shared/types';
import { toast } from 'sonner';
export function CompliancePage() {
  const [settings, setSettings] = useState<ComplianceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api<ComplianceSettings>('/api/settings');
        setSettings(data);
      } catch (err) {
        toast.error("Failed to load compliance settings");
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
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to save settings");
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
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Compliance & Legal</h1>
            <p className="text-slate-500 mt-1">Manage data retention, privacy policies, and communications.</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                Data Retention Policy
              </CardTitle>
              <CardDescription>
                Configure how long visitor personal data is stored before automatic anonymization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Auto-delete Records</Label>
                  <p className="text-xs text-slate-500">Automatically scrub personal data from the database.</p>
                </div>
                <Switch 
                  checked={settings?.autoDeleteEnabled} 
                  onCheckedChange={(val) => setSettings(s => s ? { ...s, autoDeleteEnabled: val } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="retention" className="text-sm font-semibold">Retention Period (Days)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="retention"
                    type="number" 
                    className="max-w-[120px]"
                    value={settings?.retentionDays}
                    onChange={(e) => setSettings(s => s ? { ...s, retentionDays: parseInt(e.target.value) || 0 } : null)}
                  />
                  <span className="text-sm text-slate-500">days after visit completion.</span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Minimum recommended period for security audits is 15 days.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Template Status:</span>
                <Badge className="bg-green-100 text-green-700 border-none capitalize">
                  {settings?.whatsappTemplateStatus}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
                "Hola {{resident_name}}, AccessGuard informa: El visitante {{visitor_name}} está ingresando..."
              </div>
              <Button variant="outline" className="w-full text-xs h-8">Test Integration</Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-slate-600" />
                Privacy & Legal Notices
              </CardTitle>
              <CardDescription>
                Publicly accessible legal documents for visitors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="policy-url" className="text-sm font-semibold">Privacy Policy URL</Label>
                <Input 
                  id="policy-url"
                  placeholder="https://example.com/privacy"
                  value={settings?.privacyPolicyUrl}
                  onChange={(e) => setSettings(s => s ? { ...s, privacyPolicyUrl: e.target.value } : null)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  This URL is linked in the visitor registration form disclosure.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}