import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, PhoneOff, Mic, MicOff, CheckCircle2, Loader2, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api-client';
import type { VideoRoom } from '@shared/types';
import { toast } from 'sonner';
interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (roomId: string) => void;
  apartmentId: string;
  visitorName: string;
}
export function VideoCallModal({ isOpen, onClose, onVerified, apartmentId, visitorName }: VideoCallModalProps) {
  const [room, setRoom] = useState<VideoRoom | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const currentRoomIdRef = useRef<string>('');
  useEffect(() => {
    if (isOpen) {
      startCall();
    } else {
      stopCall();
    }
    return () => stopCall();
  }, [isOpen, startCall, stopCall]);
  const startCall = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(userStream);
      if (videoRef.current) videoRef.current.srcObject = userStream;
      const newRoom = await api<VideoRoom>('/api/video/rooms', {
        method: 'POST',
        body: JSON.stringify({ apartmentId, visitorName })
      });
      setRoom(newRoom);
      currentRoomIdRef.current = newRoom.id;
      // Signaling Polling
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          if (!currentRoomIdRef.current) return;
          const updatedRoom = await api<VideoRoom>(`/api/video/rooms/${currentRoomIdRef.current}`);
          setRoom(updatedRoom);
          if (updatedRoom.status === 'connected') {
            setTimer(prev => prev + 1);
          }
          if (updatedRoom.status === 'rejected' || updatedRoom.status === 'completed') {
            stopCall();
            onClose();
            toast.error("La llamada fue finalizada por el residente");
          }
        } catch (e) {
          console.error("Signaling error", e);
        }
      }, 2000);
    } catch (err) {
      toast.error("Error al acceder a cámara/micrófono");
      onClose();
    }
  };
  const stopCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    currentRoomIdRef.current = '';
    setRoom(null);
    setTimer(0);
  };
  const handleVerify = async () => {
    if (!room) return;
    try {
      await api(`/api/video/rooms/${room.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' })
      });
      onVerified(room.id);
      stopCall();
      onClose();
      toast.success("Identidad Verificada Digitalmente");
    } catch (e) {
      toast.error("Error al finalizar verificación");
    }
  };
  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-slate-950 border-slate-800">
        <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          <div className="absolute top-4 left-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none uppercase tracking-widest">Conserjería Digital</p>
              <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-tighter">Canal Seguro Verificado</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20 font-mono text-xs px-3">
              {room?.status === 'connected' ? formatTimer(timer) : 'LLAMANDO...'}
            </Badge>
            {room?.status === 'connected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-400 uppercase">Residente Conectado</span>
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {room?.status === 'calling' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                  <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-blue-500 shadow-2xl">
                    <User className="h-12 w-12 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mt-6 uppercase tracking-widest">Llamando a Unidad {apartmentId}</h3>
                <p className="text-sm text-slate-400 font-medium mt-2">Esperando respuesta del residente via WhatsApp...</p>
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin mt-8" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-6">
            {room?.status === 'connected' && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Button 
                  onClick={handleVerify}
                  className="bg-green-600 hover:bg-green-700 text-white h-14 px-10 rounded-full text-lg font-black shadow-2xl shadow-green-500/30 group"
                >
                  <CheckCircle2 className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                  VERIFICAR IDENTIDAD
                </Button>
              </motion.div>
            )}
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-12 w-12 rounded-full", isMuted ? "bg-red-500/20 text-red-500" : "text-white hover:bg-white/10")}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-lg"
                onClick={onClose}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Seguridad</p>
              <h4 className="text-white font-bold">Verificación de Visita: {visitorName}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Destino</p>
              <p className="text-blue-400 font-black">Unidad {apartmentId}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}