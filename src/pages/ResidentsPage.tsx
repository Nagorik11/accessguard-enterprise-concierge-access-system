import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, Phone, User } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Resident } from '@shared/types';
import { cn } from '@/lib/utils';
export function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadResidents() {
      try {
        const response = await api<{ items: Resident[] }>('/api/residents');
        setResidents(response.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResidents();
  }, []);
  const filteredResidents = residents.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.apartmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Residents Directory</h1>
            <p className="text-slate-500 mt-1">Authorized building occupants and notification preferences.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or apartment..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Card className="shadow-sm border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Occupancy List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading directory...</div>
            ) : filteredResidents.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No residents found matching your search.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Full Name</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Apartment</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Contact</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px]">WhatsApp Opt-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.map((resident) => (
                    <TableRow key={resident.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{resident.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 font-mono text-xs">
                          {resident.apartmentId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs flex items-center gap-2 py-4">
                        <Phone className="h-3 w-3" /> {resident.phone}
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
                          {resident.whatsappOptIn ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}