
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
  ArrowRight
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
        {value !== "0" && (
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
  const [salon, setSalon] = useState<SalonConfig>({ name: 'BellaFlow', niche: '', setupComplete: false });
  const [activeView, setActiveView] = useState<View>('onboarding');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [isProcessingMsg, setIsProcessingMsg] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [showBookingConfirm, setShowBookingConfirm] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [notifications, setNotifications] = useState<IncomingMessage[]>([]);
  const [setupStep, setSetupStep] = useState(0);
  const [setupInput, setSetupInput] = useState('');

  // Notificação Diária IA (Simulação ao entrar no app)
  useEffect(() => {
    if (salon.setupComplete) {
      setTimeout(() => {
        const dailyNotif: IncomingMessage = {
          id: 'daily-report',
          sender: 'Bella IA',
          text: `Bom dia! Acompanhe o seu salão hoje em: https://gestao-salao-beleza.vercel.app/`,
          timestamp: new Date().toLocaleTimeString(),
          processed: true
        };
        setNotifications(prev => [dailyNotif, ...prev]);
      }, 3000);
    }
  }, [salon.setupComplete]);

  // Simulação de Dados Reais após Conexão
  useEffect(() => {
    if (isConnected && isSyncing) {
      const interval = setInterval(async () => {
        if (Math.random() > 0.85) {
          const mockClients = ['Mariana Oliveira', 'Juliana Lins', 'Fernanda Santos', 'Carla Mendes', 'Roberta Silva'];
          const mockTexts = [
            "Oi, queria marcar um corte pra sábado às 10h",
            "Olá! Tem horário para unha hoje à tarde?",
            "Reserva pra mim uma selagem na terça que vem as 14h?",
            "Queria fazer mechas com a Rose, tem vaga?",
            "Pode marcar manicure e pedicure pra amanhã?"
          ];
          const randomIndex = Math.floor(Math.random() * mockTexts.length);
          const newMsg: IncomingMessage = {
            id: Date.now().toString(),
            sender: mockClients[randomIndex],
            text: mockTexts[randomIndex],
            timestamp: new Date().toLocaleTimeString(),
            processed: false
          };
          setIncomingMessages(prev => [newMsg, ...prev].slice(0, 10));
          
          try {
            const extracted = await extractAppointmentFromText(newMsg.text);
            if (extracted.confidence > 0.6) {
              setNotifications(prev => [{ ...newMsg, detectedBooking: extracted }, ...prev]);
            }
          } catch (e) { console.error(e); }
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, isSyncing]);

  const totalRevenue = useMemo(() => appointments.reduce((sum, app) => sum + app.price, 0), [appointments]);
  
  const revenueData = useMemo(() => {
    if (appointments.length === 0) return [];
    // Simular gráfico baseado nos agendamentos reais
    return appointments.map((a, i) => ({ date: a.date, amount: a.price * (i + 1) }));
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
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
        <div className="glass-card max-w-2xl w-full p-16 rounded-[4rem] luxury-shadow relative z-10 animate-in zoom-in-95 duration-700">
           <div className="text-center mb-12">
              <div className="w-20 h-20 bg-rose-500 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-rose-500/40 mb-8">
                 <Sparkles className="w-10 h-10" />
              </div>
              <h1 className="text-5xl font-display font-bold text-slate-900">Bem-vinda ao Futuro</h1>
              <p className="text-slate-700 mt-4 text-lg font-medium">Eu sou a Bella. Como você gostaria de chamar o seu império da beleza?</p>
           </div>
           
           <div className="space-y-8">
              <input 
                autoFocus
                type="text" 
                value={setupInput}
                onChange={(e) => setSetupInput(e.target.value)}
                placeholder="Ex: Espaço Glamour ou Rose Boutique..."
                className="w-full bg-white/50 border-2 border-white/80 p-6 rounded-3xl text-2xl font-display outline-none focus:ring-4 focus:ring-rose-500/20 transition-all text-slate-900 placeholder:text-slate-400"
              />
              <button 
                onClick={handleOnboarding}
                disabled={!setupInput.trim() || isProcessingMsg}
                className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest py-7 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center space-x-3"
              >
                {isProcessingMsg ? <RefreshCw className="w-6 h-6 animate-spin" /> : <><span>Configurar com IA</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Notifications */}
      <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
        {notifications.map(notif => (
          <div key={notif.id} className="pointer-events-auto glass-card border-rose-200/50 shadow-2xl rounded-[2rem] p-6 w-80 flex items-center space-x-4 animate-in slide-in-from-right-10">
            <div className={`w-12 h-12 ${notif.id === 'daily-report' ? 'bg-slate-900' : 'bg-rose-500'} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
              {notif.id === 'daily-report' ? <Bell className="w-6 h-6" /> : <Zap className="w-6 h-6 animate-pulse" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{notif.sender}</p>
              <p className="text-sm font-bold text-slate-900 truncate">{notif.detectedBooking ? `Novo Agendamento: ${notif.detectedBooking.clientName}` : notif.text}</p>
            </div>
            {notif.detectedBooking && (
              <button 
                onClick={() => confirmBooking(notif.detectedBooking)}
                className="p-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} className="text-slate-300 hover:text-slate-600">
               <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="w-80 sidebar-dark flex flex-col p-8 hidden lg:flex border-r border-white/10">
        <div className="flex items-center space-x-3 mb-16 px-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-rose-500 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/40">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight truncate">{salon.name}</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={<Calendar />} label="Agenda" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <SidebarItem icon={<MessageCircle />} label="WhatsApp AI" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
          <SidebarItem icon={<BarChart3 />} label="Faturamento" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">WhatsApp</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
            </div>
            <button 
              onClick={() => setActiveView('connection')}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-3 rounded-xl transition-all border border-rose-500/20"
            >
              {isConnected ? 'Ver Conexão' : 'Conectar Agora'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-transparent relative">
        <header className="h-24 bg-white/20 backdrop-blur-2xl border-b border-white/30 flex items-center justify-between px-12 sticky top-0 z-50">
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{salon.name}</h2>
          <div className="flex items-center space-x-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-rose-600 transition-colors" />
              <input type="text" placeholder="Pesquisar..." className="pl-12 pr-6 py-3 bg-white/30 rounded-2xl text-sm border border-white/20 focus:bg-white/60 focus:border-rose-400/30 w-64 transition-all outline-none" />
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
               {salon.name[0]}
            </div>
          </div>
        </header>

        <div className="p-12">
          {activeView === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-display font-bold text-slate-900">Visão Geral</h3>
                  <p className="text-slate-800 font-medium mt-2">Acompanhe seu desempenho em tempo real.</p>
                </div>
                {!isConnected && (
                   <div className="bg-rose-100/50 border border-rose-200 px-6 py-3 rounded-2xl flex items-center space-x-3 text-rose-700 font-bold text-sm">
                      <Zap className="w-4 h-4" />
                      <span>Conecte o WhatsApp para ver dados reais</span>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard title="Faturamento Bruto" value={`R$ ${totalRevenue.toLocaleString()}`} trend="+0%" icon={<DollarSign className="w-6 h-6" />} />
                <MetricCard title="Agendamentos" value={appointments.length.toString()} trend="+0%" icon={<Calendar className="w-6 h-6" />} />
                <MetricCard title="Conversas IA" value={incomingMessages.length.toString()} trend="+0%" icon={<MessageCircle className="w-6 h-6" />} />
                <MetricCard title="Taxa de Conversão" value={appointments.length > 0 ? "82%" : "0%"} trend="+0%" icon={<TrendingUp className="w-6 h-6" />} />
              </div>

              {appointments.length === 0 ? (
                <div className="glass-card p-32 rounded-[4rem] text-center space-y-8 luxury-shadow border-white/50">
                   <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto">
                      <BarChart3 className="w-12 h-12" />
                   </div>
                   <div>
                      <h4 className="text-3xl font-display font-bold text-slate-900">Seu dashboard está aguardando...</h4>
                      <p className="text-slate-600 mt-2 max-w-md mx-auto">Os dados aparecerão aqui automaticamente assim que você começar a receber agendamentos via WhatsApp.</p>
                   </div>
                   <button onClick={() => setActiveView('connection')} className="bg-rose-500 hover:bg-rose-600 text-white px-12 py-5 rounded-[2rem] font-bold shadow-xl transition-all">
                      Configurar WhatsApp
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-2 glass-card p-10 rounded-[3.5rem] luxury-shadow">
                      <h3 className="text-2xl font-display font-bold text-slate-900 mb-10">Histórico de Crescimento</h3>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="date" hide />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11}} />
                            <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                            <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={4} fill="rgba(244, 63, 94, 0.1)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="glass-dark p-10 rounded-[3.5rem] text-white">
                      <h3 className="text-2xl font-display font-bold mb-10">Serviços Mais Pedidos</h3>
                      <div className="space-y-6">
                         {topServices.map((s, i) => (
                           <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                              <span className="font-bold text-sm">{s.name}</span>
                              <span className="text-rose-400 font-black text-xs">{s.count}x</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'whatsapp' && (
             <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8">
                <div className="glass-card p-10 rounded-[3rem] border-white/60 flex justify-between items-center">
                   <div>
                      <h3 className="text-4xl font-display font-bold text-slate-900">Conversas IA</h3>
                      <p className="text-slate-600 mt-2">Mensagens sendo analisadas em tempo real.</p>
                   </div>
                   {!isConnected && <button onClick={() => setActiveView('connection')} className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold">Conectar</button>}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="glass-card p-8 rounded-[3rem] luxury-shadow max-h-[600px] overflow-y-auto custom-scrollbar">
                      <h4 className="text-xl font-bold mb-8 text-slate-800">Mensagens Recebidas</h4>
                      <div className="space-y-4">
                         {incomingMessages.map(msg => (
                           <div key={msg.id} className="p-6 bg-white/50 rounded-[2rem] border border-white hover:bg-white/80 transition-all cursor-pointer" onClick={() => setWaMessage(msg.text)}>
                              <div className="flex justify-between mb-2">
                                 <span className="text-xs font-black text-rose-600">{msg.sender}</span>
                                 <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                              </div>
                              <p className="text-sm text-slate-800 leading-relaxed">{msg.text}</p>
                           </div>
                         ))}
                         {incomingMessages.length === 0 && <div className="py-20 text-center opacity-30 font-bold uppercase tracking-widest text-xs">Nenhuma mensagem ainda</div>}
                      </div>
                   </div>
                   
                   <div className="glass-dark p-10 rounded-[4rem] text-white shadow-2xl flex flex-col min-h-[500px]">
                      <h4 className="text-xl font-display font-bold mb-10 flex items-center space-x-3">
                         <Zap className="text-rose-500" />
                         <span>Processador Gemini</span>
                      </h4>
                      <textarea 
                        value={waMessage}
                        onChange={(e) => setWaMessage(e.target.value)}
                        placeholder="Clique em uma mensagem ou digite aqui..."
                        className="flex-1 bg-transparent border-none text-rose-100 placeholder:text-white/20 text-2xl font-display outline-none resize-none"
                      />
                      <button 
                        onClick={handleProcessMessage}
                        disabled={!waMessage.trim() || isProcessingMsg}
                        className="mt-10 w-full bg-rose-500 py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-30"
                      >
                        {isProcessingMsg ? <RefreshCw className="animate-spin mx-auto" /> : 'Confirmar Intenção'}
                      </button>
                   </div>
                </div>

                {showBookingConfirm && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                     <div className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-2xl animate-in zoom-in-95">
                        <h4 className="text-3xl font-display font-bold text-slate-900 mb-8">Validar Atendimento</h4>
                        <div className="space-y-6 mb-12">
                           {[
                             { l: 'Cliente', v: showBookingConfirm.clientName },
                             { l: 'Serviço', v: showBookingConfirm.serviceName },
                             { l: 'Horário', v: `${showBookingConfirm.date} às ${showBookingConfirm.time}` }
                           ].map((it, idx) => (
                             <div key={idx} className="bg-slate-50 p-6 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{it.l}</p>
                                <p className="text-xl font-bold text-slate-900">{it.v}</p>
                             </div>
                           ))}
                        </div>
                        <div className="flex space-x-4">
                           <button onClick={() => setShowBookingConfirm(null)} className="flex-1 py-5 rounded-2xl font-bold text-slate-400">Cancelar</button>
                           <button onClick={() => confirmBooking(showBookingConfirm)} className="flex-2 bg-rose-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-rose-500/30">Agendar Agora</button>
                        </div>
                     </div>
                  </div>
                )}
             </div>
          )}

          {activeView === 'connection' && (
            <div className="max-w-4xl mx-auto py-12 animate-in zoom-in-95">
               <div className="glass-card rounded-[4rem] luxury-shadow overflow-hidden border-white/60">
                  <div className="bg-slate-900/95 p-16 text-white text-center">
                     <h3 className="text-5xl font-display font-bold">Conexão WhatsApp</h3>
                     <p className="mt-4 text-slate-400 text-lg">Vincule seu número para automatizar a gestão.</p>
                  </div>
                  
                  <div className="p-20 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                     <div className="space-y-10">
                        {isConnected ? (
                          <div className="text-center space-y-8">
                             <div className="w-24 h-24 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                                <CheckCircle2 className="w-12 h-12" />
                             </div>
                             <h4 className="text-3xl font-display font-bold text-slate-900">Dispositivo Ativo</h4>
                             <p className="text-slate-600 font-medium">Sincronizando mensagens criptografadas.</p>
                             <button 
                               onClick={() => setIsSyncing(!isSyncing)}
                               className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${isSyncing ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-100 text-slate-600'}`}
                             >
                               {isSyncing ? 'Análise em Tempo Real' : 'Pausar Monitoramento'}
                             </button>
                          </div>
                        ) : (
                          <div className="space-y-8">
                             <p className="text-slate-700 font-medium leading-relaxed">Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código para liberar a IA Bella.</p>
                             <button onClick={() => setIsConnected(true)} className="w-full bg-slate-900 text-white font-black py-7 rounded-[2rem] shadow-2xl">Gerar QR Code Seguro</button>
                          </div>
                        )}
                     </div>
                     <div className="flex flex-col items-center">
                        <div className="p-4 bg-slate-900/90 rounded-[3rem] shadow-2xl relative">
                           <div className="bg-white p-10 rounded-[2.5rem] relative overflow-hidden">
                              {isConnected ? (
                                <div className="w-56 h-56 flex items-center justify-center">
                                   <Smartphone className="w-24 h-24 text-slate-100 animate-bounce" />
                                </div>
                              ) : (
                                <QrCode className="w-56 h-56 text-slate-900" />
                              )}
                              {isConnected && <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center font-black text-emerald-600 uppercase tracking-widest text-[10px]">Vinculado</div>}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {(activeView === 'appointments' || activeView === 'analytics') && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8">
                <div className="w-24 h-24 glass-card rounded-[2rem] flex items-center justify-center text-rose-500">
                   <Scissors className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Módulo em Refinamento</h3>
                <p className="text-slate-600 max-w-sm mx-auto font-medium">Estamos polindo as ferramentas de agenda e relatórios avançados.</p>
                <button onClick={() => setActiveView('dashboard')} className="text-rose-600 font-black uppercase tracking-widest text-xs hover:underline">Voltar ao Painel</button>
             </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="fixed bottom-6 right-8 z-[60] animate-in fade-in duration-1000">
           <div className="glass-card px-5 py-2.5 rounded-full flex items-center space-x-3 border-white/40">
              <Code2 className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
                desenvolvido por <span className="text-rose-600">dn3j</span>
              </span>
           </div>
        </div>
      </main>
    </div>
  );
}
