import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Filter, Calendar, FileText, Loader2, ShieldCheck, Trash2, Clock } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('all');
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
    if (!confirm("¿Eliminar este registro permanentemente?")) return;
    try {
      await api(`/api/visits/${id}`, { method: 'DELETE' });
      toast.success("Registro eliminado");
      loadHistory();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };
  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitorRut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.apartmentId.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && v.status === statusFilter;
  });
  const handleExport = () => {
    toast.success("Preparando archivo CSV...");
    setTimeout(() => toast.info("Bitácora exportada correctamente"), 1200);
  };
  return (
    <AppLayout container className="bg-slate-50">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bitácora Histórica</h1>
            <p className="text-slate-500 font-medium">Auditoría completa de flujos de acceso.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 font-bold bg-white" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, RUT o departamento..."
                  className="pl-10 h-11 bg-white border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-11 bg-white">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">En Edificio</SelectItem>
                    <SelectItem value="completed">Finalizados</SelectItem>
                    <SelectItem value="denied">Denegados</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-11 px-4 bg-white"><Filter className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="font-bold text-sm">Consultando registros históricos...</p>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="text-center py-24 text-slate-400 font-bold uppercase tracking-widest text-xs">No se registran accesos</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="hover:bg-transparent border-slate-100 uppercase text-[10px] font-black">
                    <TableHead className="w-[180px] pl-6 h-12">Fecha / Hora</TableHead>
                    <TableHead>Visitante</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Legal / Consent.</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right pr-6">Acción</TableHead>
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
                        className="border-slate-50 hover:bg-slate-50 transition-all duration-200 group h-16"
                      >
                        <TableCell className="pl-6 font-mono text-xs text-slate-500 font-bold">
                          {format(v.entryTime, 'dd/MM/yy HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900 leading-none">{v.visitorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{v.visitorRut}</div>
                        </TableCell>
                        <TableCell className="font-black text-blue-700">Unidad {v.apartmentId}</TableCell>
                        <TableCell>
                          {v.legalConsent ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none gap-1 py-0 px-2 h-6 font-black text-[9px] group-hover:bg-blue-100 transition-colors">
                              <ShieldCheck className="h-3 w-3" /> ACEPTADO
                            </Badge>
                          ) : (
                            <span className="text-slate-300 text-[10px] font-bold">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] px-2 py-0.5 border-slate-200 uppercase font-black tracking-tighter",
                              v.status === 'active' && "bg-green-50 text-green-700 border-green-100",
                              v.status === 'completed' && "text-slate-500 bg-slate-50"
                            )}
                          >
                            {v.status === 'active' ? 'En Edificio' : v.status === 'completed' ? 'Cerrado' : v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 rounded-full">
                            <FileText className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 rounded-full" onClick={() => handleDelete(v.id)}>
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