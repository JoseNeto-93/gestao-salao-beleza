
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageCircle, 
  BarChart3, 
  Plus, 
  Search, 
  Bell, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp,
  User,
  Scissors,
  Smartphone,
  QrCode,
  Zap,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  Settings,
  Code2,
  Sparkles,
  ArrowRight,
  Loader2,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Appointment, Service, View, IncomingMessage, SalonConfig } from './types';
import { INITIAL_SERVICES } from './constants';
import { extractAppointmentFromText, suggestSalonBranding } from './services/geminiService';

// --- Components Premium ---

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-rose-400'} transition-colors`}>
      {icon}
    </div>
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const MetricCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode }> = ({ 
  title, value, trend, icon
}) => (
  <div className="glass-card p-8 rounded-[2.5rem] luxury-shadow relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-slate-900/90 rounded-2xl text-rose-500 shadow-xl">
          {icon}
        </div>
        {value !== "0" && value !== "R$ 0" && (
          <div className="flex flex-col items-end">
            <span className="text-emerald-700 text-xs font-black flex items-center bg-emerald-100/40 px-2 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
              <TrendingUp className="w-3 h-3 mr-1" /> {trend}
            </span>
          </div>
        )}
      </div>
      <h3 className="text-slate-700 text-xs font-bold uppercase tracking-widest">{title}</h3>
      <p className="text-3xl font-display font-bold text-slate-900 mt-2">{value}</p>
    </div>
  </div>
);

export default function App() {
  const [salon, setSalon] = useState<SalonConfig>(() => {
    const saved = localStorage.getItem('bella_salon_config');
    return saved ? JSON.parse(saved) : { name: 'BellaFlow', niche: '', setupComplete: false };
  });
  
  const [activeView, setActiveView] = useState<View>(salon.setupComplete ? 'dashboard' : 'onboarding');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [isProcessingMsg, setIsProcessingMsg] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [showBookingConfirm, setShowBookingConfirm] = useState<any>(null);
  
  // Estados da Conexão WhatsApp
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [notifications, setNotifications] = useState<IncomingMessage[]>([]);
  const [setupInput, setSetupInput] = useState('');

  // Salvar configuração do salão
  useEffect(() => {
    localStorage.setItem('bella_salon_config', JSON.stringify(salon));
  }, [salon]);

  // Mensagem Diária da IA (Lembrete)
  useEffect(() => {
    if (salon.setupComplete) {
      const timer = setTimeout(() => {
        const dailyNotif: IncomingMessage = {
          id: 'daily-report-' + Date.now(),
          sender: 'Bella IA',
          text: `Olá ${salon.name}! O dia começou. Acompanhe seu faturamento em tempo real aqui.`,
          timestamp: new Date().toLocaleTimeString(),
          processed: true
        };
        setNotifications(prev => [dailyNotif, ...prev]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [salon.setupComplete, salon.name]);

  // Fluxo de Simulação de Dados Reais
  useEffect(() => {
    if (isConnected && isSyncing) {
      const interval = setInterval(async () => {
        if (Math.random() > 0.70) {
          const mockClients = ['Mariana Oliveira', 'Juliana Lins', 'Fernanda Santos', 'Carla Mendes', 'Roberta Silva', 'Camila Rocha', 'Bia Nunes'];
          const mockTexts = [
            "Oi, queria marcar um corte pra sábado às 10h",
            "Olá! Tem horário para unha hoje às 15h?",
            "Reserva pra mim uma selagem na terça que vem as 14h?",
            "Queria fazer mechas com a Rose, tem vaga amanhã?",
            "Pode marcar manicure e pedicure pra sexta?",
            "Rose, que horas você tem livre hoje para escova?",
            "Oi! Gostaria de agendar um design de sobrancelha para as 11h"
          ];
          const randomIndex = Math.floor(Math.random() * mockTexts.length);
          const newMsg: IncomingMessage = {
            id: Date.now().toString(),
            sender: mockClients[randomIndex],
            text: mockTexts[randomIndex],
            timestamp: new Date().toLocaleTimeString(),
            processed: false
          };
          setIncomingMessages(prev => [newMsg, ...prev].slice(0, 15));
          
          try {
            const extracted = await extractAppointmentFromText(newMsg.text);
            if (extracted.confidence > 0.5) {
              setNotifications(prev => [{ ...newMsg, detectedBooking: extracted }, ...prev]);
            }
          } catch (e) { console.error("Erro IA:", e); }
        }
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [isConnected, isSyncing]);

  const totalRevenue = useMemo(() => appointments.reduce((sum, app) => sum + app.price, 0), [appointments]);
  
  const revenueData = useMemo(() => {
    if (appointments.length === 0) return [];
    return appointments.map((a, i) => ({ 
      date: a.time, 
      amount: appointments.slice(0, i + 1).reduce((acc, curr) => acc + curr.price, 0) 
    }));
  }, [appointments]);

  const topServices = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    appointments.forEach(app => {
      if (!counts[app.serviceName]) counts[app.serviceName] = { count: 0, revenue: 0 };
      counts[app.serviceName].count += 1;
      counts[app.serviceName].revenue += app.price;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments]);

  const handleOnboarding = async () => {
    if (!setupInput.trim()) return;
    setIsProcessingMsg(true);
    try {
      const result = await suggestSalonBranding(setupInput);
      setSalon({ ...salon, name: result.salonName, setupComplete: true });
      setActiveView('dashboard');
    } catch (e) {
      setSalon({ ...salon, name: setupInput, setupComplete: true });
      setActiveView('dashboard');
    } finally {
      setIsProcessingMsg(false);
    }
  };

  const generateQRCode = () => {
    setIsGeneratingQR(true);
    setQrCodeData(null);
    setTimeout(() => {
      setQrCodeData("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BELLAFLOW-SESSION-" + Date.now());
      setIsGeneratingQR(false);
    }, 1200);
  };

  const simulateScan = () => {
    if (!qrCodeData || isAuthenticating) return;
    setIsAuthenticating(true);
    // Simula o processo de "Handshake" do WhatsApp
    setTimeout(() => {
      setIsConnected(true);
      setIsSyncing(true);
      setQrCodeData(null);
      setIsAuthenticating(false);
      setActiveView('dashboard');
      // Notificação de sucesso
      setNotifications(prev => [{
        id: 'conn-success',
        sender: 'Sistema',
        text: 'Dispositivo vinculado com sucesso! Bella IA começou o monitoramento.',
        timestamp: new Date().toLocaleTimeString(),
        processed: true
      }, ...prev]);
    }, 3000);
  };

  const handleProcessMessage = async () => {
    if (!waMessage.trim()) return;
    setIsProcessingMsg(true);
    try {
      const result = await extractAppointmentFromText(waMessage);
      setShowBookingConfirm(result);
    } catch (error) {
      alert("Erro ao processar mensagem.");
    } finally {
      setIsProcessingMsg(false);
    }
  };

  const confirmBooking = (bookingData: any) => {
    const matchedService = services.find(s => s.name.toLowerCase().includes(bookingData.serviceName.toLowerCase())) || services[0];
    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: bookingData.clientName,
      serviceId: matchedService.id,
      serviceName: matchedService.name,
      date: bookingData.date,
      time: bookingData.time,
      status: 'Confirmado',
      price: matchedService.price
    };
    setAppointments(prev => [newApp, ...prev]);
    setShowBookingConfirm(null);
    setNotifications(prev => prev.filter(n => n.id !== bookingData.id));
    setActiveView('dashboard');
  };

  if (activeView === 'onboarding') {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-md"></div>
        <div className="glass-card max-w-2xl w-full p-16 rounded-[4rem] luxury-shadow relative z-10 animate-in zoom-in-95 duration-700 border-white/30">
           <div className="text-center mb-12">
              <div className="w-20 h-20 bg-rose-500 rounded-[2.2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-rose-500/40 mb-8 animate-bounce-slow">
                 <Sparkles className="w-10 h-10" />
              </div>
              <h1 className="text-5xl font-display font-bold text-slate-900 leading-tight">Olá, eu sou a Bella.</h1>
              <p className="text-slate-700 mt-6 text-xl font-medium px-4">Qual é o nome do seu salão? Vou te ajudar a torná-lo referência.</p>
           </div>
           
           <div className="space-y-8">
              <div className="relative">
                <input 
                  autoFocus
                  type="text" 
                  value={setupInput}
                  onChange={(e) => setSetupInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOnboarding()}
                  placeholder="Ex: Espaço VIP ou Studio Rose..."
                  className="w-full bg-white/60 border-2 border-white/80 p-8 rounded-[2.5rem] text-3xl font-display outline-none focus:ring-8 focus:ring-rose-500/10 transition-all text-slate-900 placeholder:text-slate-400 text-center"
                />
              </div>
              <button 
                onClick={handleOnboarding}
                disabled={!setupInput.trim() || isProcessingMsg}
                className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest py-8 rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center space-x-4 disabled:opacity-50 active:scale-95"
              >
                {isProcessingMsg ? <Loader2 className="w-8 h-8 animate-spin text-rose-500" /> : <><span>Começar Jornada</span> <ArrowRight className="w-6 h-6" /></>}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Notificações Push */}
      <div className="fixed top-6 right-6 z-[100] space-y-4 pointer-events-none">
        {notifications.map(notif => (
          <div key={notif.id} className="pointer-events-auto glass-card border-white shadow-2xl rounded-[2.5rem] p-7 w-96 flex items-center space-x-5 animate-in slide-in-from-right-10 duration-500">
            <div className={`w-14 h-14 ${notif.id.toString().startsWith('daily') || notif.id === 'conn-success' ? 'bg-slate-900' : 'bg-rose-500'} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
              {notif.id.toString().startsWith('daily') ? <Bell className="w-7 h-7" /> : notif.id === 'conn-success' ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <Zap className="w-7 h-7 animate-pulse" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-1">{notif.sender}</p>
              <p className="text-sm font-bold text-slate-900 leading-snug">{notif.detectedBooking ? `Agendamento detectado: ${notif.detectedBooking.clientName}` : notif.text}</p>
            </div>
            <div className="flex flex-col space-y-2">
              {notif.detectedBooking && (
                <button 
                  onClick={() => confirmBooking(notif.detectedBooking)}
                  className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-lg transition-all"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
              <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="w-80 sidebar-dark flex flex-col p-8 hidden lg:flex border-r border-white/5">
        <div className="flex items-center space-x-4 mb-16 px-2">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-rose-500/30">
            <Scissors className="w-8 h-8" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight truncate">{salon.name}</h1>
            <div className="flex items-center space-x-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isConnected ? 'Online' : 'Desconectado'}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          <SidebarItem icon={<LayoutDashboard className="w-6 h-6" />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={<Calendar className="w-6 h-6" />} label="Agenda" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <SidebarItem icon={<MessageCircle className="w-6 h-6" />} label="WhatsApp AI" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
          <SidebarItem icon={<BarChart3 className="w-6 h-6" />} label="Relatórios" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <button 
            onClick={() => setActiveView('connection')}
            className={`w-full group p-6 rounded-[2.5rem] border transition-all flex items-center justify-between ${isConnected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}
          >
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Canal</p>
              <p className={`text-sm font-bold ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>WhatsApp</p>
            </div>
            <div className={`p-2 rounded-xl transition-all ${isConnected ? 'bg-emerald-500 text-white' : 'bg-rose-500/20 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'}`}>
               <Smartphone className="w-5 h-5" />
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-transparent relative">
        <header className="h-24 bg-white/15 backdrop-blur-3xl border-b border-white/20 flex items-center justify-between px-12 sticky top-0 z-50">
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight capitalize">{activeView === 'dashboard' ? 'Início' : activeView}</h2>
          
          <div className="flex items-center space-x-8">
            <button onClick={() => { localStorage.removeItem('bella_salon_config'); window.location.reload(); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Reiniciar Sistema">
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4 bg-white/40 p-2 pr-6 rounded-full border border-white/50">
               <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {salon.name[0]}
               </div>
               <span className="text-sm font-bold text-slate-900">{salon.name}</span>
            </div>
          </div>
        </header>

        <div className="p-12">
          {activeView === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-display font-bold text-slate-900">Salão em Foco</h3>
                  <p className="text-slate-800 font-medium mt-2 text-lg">Métricas geradas a partir das conversas do WhatsApp.</p>
                </div>
                {!isConnected && (
                   <div className="bg-rose-500 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 font-bold text-sm shadow-xl shadow-rose-500/30 animate-pulse cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveView('connection')}>
                      <Zap className="w-5 h-5" />
                      <span>Conectar WhatsApp para Ativar</span>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard title="Faturamento Hoje" value={`R$ ${totalRevenue.toLocaleString()}`} trend="+0%" icon={<DollarSign className="w-7 h-7" />} />
                <MetricCard title="Agendados" value={appointments.length.toString()} trend="+0%" icon={<Calendar className="w-7 h-7" />} />
                <MetricCard title="Mensagens IA" value={incomingMessages.length.toString()} trend="+0%" icon={<MessageCircle className="w-7 h-7" />} />
                <MetricCard title="Conversão" value={appointments.length > 0 ? "94%" : "0%"} trend="+0%" icon={<TrendingUp className="w-7 h-7" />} />
              </div>

              {appointments.length === 0 ? (
                <div className="glass-card p-32 rounded-[4rem] text-center space-y-8 luxury-shadow border-white/40 relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-transparent"></div>
                   <div className="w-24 h-24 bg-white/80 rounded-[2.5rem] flex items-center justify-center text-rose-300 mx-auto shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <BarChart3 className="w-14 h-14" />
                   </div>
                   <div className="relative z-10">
                      <h4 className="text-4xl font-display font-bold text-slate-900">Seu Dashboard está Vazio</h4>
                      <p className="text-slate-700 mt-4 max-w-md mx-auto text-lg font-medium leading-relaxed">
                        Como este é um ambiente de demonstração, você precisa <b>simular a conexão</b> do WhatsApp para começar a receber agendamentos automáticos.
                      </p>
                   </div>
                   <button 
                    onClick={() => setActiveView('connection')} 
                    className="relative z-10 bg-slate-900 hover:bg-black text-white px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95"
                   >
                      Ir para Conexão
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-1000">
                   <div className="lg:col-span-2 glass-card p-12 rounded-[4rem] luxury-shadow">
                      <div className="flex items-center justify-between mb-12">
                        <h3 className="text-2xl font-display font-bold text-slate-900">Fluxo de Faturamento</h3>
                        <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                           <TrendingUp className="w-4 h-4" />
                           <span>Performance Real</span>
                        </div>
                      </div>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 'bold'}} dy={15} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 'bold'}} />
                            <Tooltip 
                              contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', padding: '20px'}}
                              labelClassName="font-black text-rose-500 uppercase text-[10px] mb-2"
                            />
                            <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={5} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="glass-dark p-12 rounded-[4rem] text-white shadow-2xl flex flex-col">
                      <h3 className="text-2xl font-display font-bold mb-12">Principais Serviços</h3>
                      <div className="flex-1 space-y-6">
                         {topServices.map((s, i) => (
                           <div key={i} className="group p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
                              <div className="flex justify-between items-center mb-3">
                                 <span className="font-bold text-sm tracking-wide">{s.name}</span>
                                 <span className="text-rose-400 font-black text-xs px-3 py-1 bg-rose-500/10 rounded-full">{s.count}x</span>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                 <div 
                                  className="h-full bg-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                                  style={{ width: `${(s.count / topServices[0].count) * 100}%` }}
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                      <div className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                         <p className="text-xs text-emerald-400 font-medium leading-relaxed italic">"Dica da Bella: '{topServices[0]?.name}' está em alta. Que tal um combo para fidelizar?"</p>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'whatsapp' && (
             <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8">
                <div className="glass-card p-12 rounded-[3.5rem] border-white/60 flex justify-between items-center shadow-xl">
                   <div>
                      <h3 className="text-4xl font-display font-bold text-slate-900">Mensagens Monitoradas</h3>
                      <p className="text-slate-700 mt-2 text-lg">Bella analisa as intenções de agendamento que chegam pelo seu WhatsApp.</p>
                   </div>
                   {!isConnected && (
                     <button onClick={() => setActiveView('connection')} className="bg-rose-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20">
                       Ativar WhatsApp
                     </button>
                   )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                   <div className="lg:col-span-2 glass-card p-10 rounded-[3.5rem] luxury-shadow max-h-[700px] overflow-y-auto custom-scrollbar">
                      <h4 className="text-xl font-bold mb-8 text-slate-800 flex items-center">
                        <MessageCircle className="w-6 h-6 mr-3 text-rose-500" />
                        Chats em Tempo Real
                      </h4>
                      <div className="space-y-5">
                         {incomingMessages.map(msg => (
                           <div key={msg.id} className="p-6 bg-white/60 rounded-[2.5rem] border border-white hover:border-rose-200 hover:bg-white/90 transition-all cursor-pointer group" onClick={() => setWaMessage(msg.text)}>
                              <div className="flex justify-between mb-3">
                                 <span className="text-xs font-black text-rose-600 uppercase tracking-widest group-hover:scale-105 transition-transform">{msg.sender}</span>
                                 <span className="text-[10px] text-slate-400 font-bold">{msg.timestamp}</span>
                              </div>
                              <p className="text-sm text-slate-800 leading-relaxed font-medium line-clamp-3">{msg.text}</p>
                           </div>
                         ))}
                         {incomingMessages.length === 0 && (
                           <div className="py-32 text-center opacity-40">
                              <MessageCircle className="w-16 h-16 mx-auto mb-6 text-slate-300" />
                              <p className="font-bold uppercase tracking-widest text-sm">Nenhuma mensagem ainda...</p>
                           </div>
                         )}
                      </div>
                   </div>
                   
                   <div className="lg:col-span-3 glass-dark p-12 rounded-[4rem] text-white shadow-2xl flex flex-col min-h-[600px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                      <h4 className="text-2xl font-display font-bold mb-10 flex items-center space-x-4 relative z-10">
                         <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                           <Zap className="text-white w-6 h-6" />
                         </div>
                         <span>Analisador Bella IA</span>
                      </h4>
                      <div className="flex-1 relative z-10">
                        <textarea 
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          placeholder="Selecione um chat ou escreva aqui para testar a extração da IA..."
                          className="w-full h-full bg-transparent border-none text-rose-50 text-3xl font-display outline-none resize-none placeholder:text-white/10 leading-relaxed"
                        />
                      </div>
                      <button 
                        onClick={handleProcessMessage}
                        disabled={!waMessage.trim() || isProcessingMsg}
                        className="mt-10 w-full bg-rose-500 py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-lg shadow-2xl shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-20 flex items-center justify-center space-x-3 active:scale-95"
                      >
                        {isProcessingMsg ? <Loader2 className="w-8 h-8 animate-spin" /> : <span>Confirmar Dados</span>}
                      </button>
                   </div>
                </div>

                {showBookingConfirm && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/75 backdrop-blur-xl">
                     <div className="bg-white rounded-[4rem] p-16 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 border border-white">
                        <div className="flex justify-between items-start mb-12">
                           <div>
                              <h4 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Validar Extração</h4>
                              <p className="text-slate-500 text-sm mt-2 uppercase font-black tracking-widest">Informações identificadas pela IA:</p>
                           </div>
                           <button onClick={() => setShowBookingConfirm(null)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                              <X className="w-10 h-10" />
                           </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                           {[
                             { l: 'Cliente', v: showBookingConfirm.clientName },
                             { l: 'Serviço', v: showBookingConfirm.serviceName },
                             { l: 'Data', v: showBookingConfirm.date },
                             { l: 'Horário', v: showBookingConfirm.time }
                           ].map((it, idx) => (
                             <div key={idx} className="bg-slate-50/80 p-7 rounded-[2.5rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{it.l}</p>
                                <p className="text-2xl font-bold text-slate-900">{it.v}</p>
                             </div>
                           ))}
                        </div>
                        <div className="flex space-x-4">
                           <button onClick={() => setShowBookingConfirm(null)} className="flex-1 py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-600 transition-colors">Descartar</button>
                           <button onClick={() => confirmBooking(showBookingConfirm)} className="flex-[2] bg-rose-500 text-white px-10 py-7 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-rose-500/20 active:scale-95 transition-all">Salvar Agendamento</button>
                        </div>
                     </div>
                  </div>
                )}
             </div>
          )}

          {activeView === 'connection' && (
            <div className="max-w-4xl mx-auto py-12 animate-in zoom-in-95 duration-700">
               <div className="glass-card rounded-[4.5rem] luxury-shadow overflow-hidden border-white/60">
                  <div className="bg-slate-900/95 p-20 text-white text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse"></div>
                     <h3 className="text-5xl font-display font-bold">Conexão Bella IA</h3>
                     <p className="mt-4 text-slate-400 text-xl font-medium">Sincronize seu dispositivo para automação total.</p>
                  </div>
                  
                  <div className="p-20 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                     <div className="space-y-12">
                        {isConnected ? (
                          <div className="text-center space-y-10">
                             <div className="w-24 h-24 bg-emerald-500/20 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-inner animate-pulse">
                                <CheckCircle2 className="w-14 h-14" />
                             </div>
                             <div>
                                <h4 className="text-4xl font-display font-bold text-slate-900">Vínculo Ativo</h4>
                                <p className="text-slate-600 font-medium mt-3 text-lg">Suas mensagens estão sendo processadas.</p>
                             </div>
                             <div className="space-y-4">
                               <button 
                                 onClick={() => setIsSyncing(!isSyncing)}
                                 className={`w-full py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isSyncing ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-100 text-slate-600'}`}
                               >
                                 {isSyncing ? 'Monitoria Ativa' : 'Pausar Escuta'}
                               </button>
                               <button onClick={() => setIsConnected(false)} className="text-slate-300 hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Encerrar Sessão</button>
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-10">
                             <div className="space-y-6">
                               <div className="flex items-start space-x-4 group">
                                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 font-black text-slate-900 group-hover:bg-rose-500 group-hover:text-white transition-colors">1</div>
                                  <p className="text-slate-700 font-medium leading-relaxed">Gere o QR Code de segurança exclusivo para sua conta.</p>
                               </div>
                               <div className="flex items-start space-x-4 group">
                                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 font-black text-slate-900 group-hover:bg-rose-500 group-hover:text-white transition-colors">2</div>
                                  <p className="text-slate-700 font-medium leading-relaxed">Clique no código gerado para <b>simular o escaneamento</b> do seu WhatsApp.</p>
                               </div>
                               <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex space-x-4 items-start">
                                  <Info className="w-6 h-6 text-amber-500 shrink-0" />
                                  <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase tracking-wider">Como este é um ambiente de preview, a conexão real com o aplicativo WhatsApp exige um servidor backend Node.js.</p>
                               </div>
                             </div>
                             
                             {!qrCodeData ? (
                               <button 
                                onClick={generateQRCode} 
                                disabled={isGeneratingQR}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center space-x-4 transition-all active:scale-95"
                               >
                                 {isGeneratingQR ? <Loader2 className="w-8 h-8 animate-spin text-rose-500" /> : <><span>Gerar QR de Sessão</span> <QrCode className="w-6 h-6" /></>}
                               </button>
                             ) : (
                               <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 text-center animate-pulse">
                                  <p className="text-rose-600 font-bold text-sm">Escaneie o código clicando nele!</p>
                               </div>
                             )}
                          </div>
                        )}
                     </div>
                     
                     <div className="flex flex-col items-center">
                        <div 
                          className={`p-5 bg-slate-900/95 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative group overflow-hidden ${!isConnected && qrCodeData ? 'cursor-pointer' : 'cursor-default'}`} 
                          onClick={simulateScan}
                        >
                           <div className="bg-white p-12 rounded-[3rem] relative overflow-hidden flex items-center justify-center min-w-[320px] min-h-[320px]">
                              {isGeneratingQR ? (
                                <div className="text-center space-y-4">
                                   <Loader2 className="w-20 h-20 text-rose-500 animate-spin mx-auto" />
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviando Token...</p>
                                </div>
                              ) : qrCodeData ? (
                                <img src={qrCodeData} alt="WhatsApp QR Code" className="w-64 h-64 animate-in zoom-in-50 duration-500" />
                              ) : isConnected ? (
                                <div className="text-center animate-in zoom-in-50 duration-700">
                                   <Smartphone className="w-32 h-32 text-slate-900 mb-6 mx-auto animate-bounce-slow" />
                                   <div className="bg-emerald-100 text-emerald-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Sincronizado</div>
                                </div>
                              ) : (
                                <div className="text-center opacity-10">
                                   <QrCode className="w-64 h-64 text-slate-900" />
                                   <p className="mt-4 font-black text-xs uppercase tracking-widest">Inativo</p>
                                </div>
                              )}
                              
                              {qrCodeData && !isAuthenticating && (
                                <div className="absolute inset-0 bg-rose-500/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm text-white p-10 text-center">
                                   <Smartphone className="w-16 h-16 mb-4 animate-bounce" />
                                   <p className="font-black uppercase tracking-widest text-sm mb-2">Simular Scan</p>
                                   <p className="text-[10px] font-medium opacity-80">Clique aqui para vincular esta sessão simulada.</p>
                                </div>
                              )}

                              {isAuthenticating && (
                                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white space-y-6 animate-in fade-in duration-500">
                                   <div className="relative">
                                      <RefreshCw className="w-20 h-20 animate-spin text-rose-500" />
                                      <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-0 animate-pulse" />
                                   </div>
                                   <div className="text-center">
                                      <p className="font-black uppercase tracking-[0.3em] text-xs mb-2">Autenticando...</p>
                                      <div className="w-32 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                                         <div className="h-full bg-rose-500 w-1/2 animate-[progress_2s_ease-in-out_infinite]"></div>
                                      </div>
                                   </div>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {(activeView === 'appointments' || activeView === 'analytics') && (
             <div className="flex flex-col items-center justify-center h-[65vh] text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-32 h-32 glass-card rounded-[3.5rem] flex items-center justify-center text-rose-500 luxury-shadow relative">
                   <div className="absolute inset-0 bg-rose-500/10 rounded-[3.5rem] animate-ping opacity-20"></div>
                   <Scissors className="w-16 h-16" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-5xl font-display font-bold text-slate-900 tracking-tight">Recursos Premium</h3>
                  <p className="text-slate-700 max-w-lg mx-auto font-medium text-xl leading-relaxed">
                    Bella está processando os dados históricos. A agenda e os relatórios avançados serão liberados após os primeiros agendamentos.
                  </p>
                </div>
                <button onClick={() => setActiveView('dashboard')} className="bg-white/50 border border-white hover:bg-white px-12 py-5 rounded-[2.5rem] text-slate-900 font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-95">Ir para Dashboard</button>
             </div>
          )}
        </div>

        {/* Créditos Rodapé */}
        <div className="fixed bottom-8 right-10 z-[60] animate-in fade-in duration-1000">
           <div className="glass-card px-6 py-3 rounded-full flex items-center space-x-3 border-white/50 hover:scale-105 transition-transform cursor-default">
              <Code2 className="w-4 h-4 text-rose-500" />
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-[0.25em]">
                desenvolvido por <span className="text-rose-600">dn3j</span>
              </span>
           </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
