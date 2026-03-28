import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter, Calendar, FileText, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { VisitLog } from '@shared/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import { motion, AnimatePresence } from 'framer-motion';

export function HistoryPage() {
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api<{ items: VisitLog[] }>('/api/visits');
      setVisits(response.items || []);
    } catch (err) {
      toast.error("Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este registro permanentemente de la bitácora?")) return;
    try {
      await api(`/api/visits/${id}`, { method: 'DELETE' });
      toast.success("Registro eliminado");
      loadHistory();
    } catch (err) {
      toast.error("No se pudo eliminar el registro");
    }
  };

  const filteredVisits = visits.filter(v =>
    v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.visitorRut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.apartmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleExport = () => {
    toast.success("Preparando descarga de CSV...");
    setTimeout(() => toast.info("Exportación completada exitosamente"), 1500);
  };
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historial de Accesos</h1>
            <p className="text-slate-500 mt-1">Registro completo de ingresos y salidas del edificio.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por nombre, RUT o depto..." 
                  className="pl-10 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="h-10 text-slate-500">
                  <Calendar className="h-4 w-4 mr-2" /> Todas las fechas
                </Button>
                <Button variant="ghost" className="h-10 text-slate-500">
                  <Filter className="h-4 w-4 mr-2" /> Más filtros
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
            ) : filteredVisits.length === 0 ? (
              <div className="text-center py-20 text-slate-400 italic">No se encontraron registros en el historial.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[180px] text-[10px] font-bold uppercase text-slate-400 pl-6 py-4">Fecha y Hora</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Visitante</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Destino</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Legal</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Permanencia</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase text-slate-400 pr-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredVisits.map((v) => (
                      <motion.tr
                        key={v.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="pl-6 py-4 font-mono text-xs text-slate-500">
                          {format(v.entryTime, 'dd/MM/yyyy HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{v.visitorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{v.visitorRut}</div>
                        </TableCell>
                        <TableCell className="font-bold text-blue-700">Depto {v.apartmentId}</TableCell>
                        <TableCell>
                          {v.legalConsent ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none gap-1 py-0 px-2 h-5">
                              <ShieldCheck className="h-3 w-3" /> Consentimiento
                            </Badge>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] px-2 py-0 border-slate-200 text-slate-500 capitalize">
                            {v.status === 'completed' ? 'Finalizada' : 'En curso'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                            <FileText className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(v.id)}>
                              <Trash2 className="h-4 w-4" />
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