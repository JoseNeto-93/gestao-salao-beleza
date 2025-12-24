
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
  Info,
  ShieldCheck,
  Lock,
  Globe,
  AlertTriangle
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
    return saved ? JSON.parse(saved) : { name: '', niche: '', setupComplete: false };
  });
  
  const [activeView, setActiveView] = useState<View>(salon.setupComplete ? 'dashboard' : 'onboarding');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [isProcessingMsg, setIsProcessingMsg] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [showBookingConfirm, setShowBookingConfirm] = useState<any>(null);
  
  // Estados da Conexão WhatsApp Real
  const [backendUrl, setBackendUrl] = useState('http://localhost:3001');
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'generating' | 'waiting' | 'authenticating' | 'ready' | 'error'>('idle');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [notifications, setNotifications] = useState<IncomingMessage[]>([]);
  const [setupInput, setSetupInput] = useState('');

  // Sincronização de Estado
  useEffect(() => {
    localStorage.setItem('bella_salon_config', JSON.stringify(salon));
  }, [salon]);

  // Polling para Verificar Backend e Status WA
  useEffect(() => {
    const pollBackend = async () => {
      try {
        const response = await fetch(`${backendUrl}/status`);
        const data = await response.json();
        setIsBackendOnline(true);
        
        if (data.status === 'CONNECTED') {
          setIsConnected(true);
          setConnStatus('ready');
          setQrCodeData(null);
        } else if (data.status === 'WAITING_FOR_SCAN') {
          setConnStatus('waiting');
          setIsConnected(false);
          // Busca o QR se estiver esperando scan
          fetchQr();
        } else if (data.status === 'AUTHENTICATING') {
          setConnStatus('authenticating');
        } else {
          setConnStatus('idle');
          setIsConnected(false);
        }
      } catch (err) {
        setIsBackendOnline(false);
        setConnStatus('error');
      }
    };

    const fetchQr = async () => {
      try {
        const response = await fetch(`${backendUrl}/qr`);
        const data = await response.json();
        if (data.qr) setQrCodeData(data.qr);
      } catch (err) {
        console.error("Erro ao buscar QR:", err);
      }
    };

    const interval = setInterval(pollBackend, 3000);
    pollBackend();
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Simulação de Mensagens (Só quando conectado)
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(async () => {
        if (Math.random() > 0.7) {
          const clients = ['Juliana', 'Bia', 'Fernanda', 'Carla', 'Patricia'];
          const texts = ["Quero manicure", "Tem vaga pra corte?", "Agendar luzes sabado", "Quanto é a escova?"];
          const newMsg: IncomingMessage = {
            id: Date.now().toString(),
            sender: clients[Math.floor(Math.random()*clients.length)],
            text: texts[Math.floor(Math.random()*texts.length)],
            timestamp: new Date().toLocaleTimeString(),
            processed: false
          };
          setIncomingMessages(prev => [newMsg, ...prev].slice(0, 10));
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const totalRevenue = useMemo(() => appointments.reduce((sum, app) => sum + app.price, 0), [appointments]);
  const revenueData = useMemo(() => {
    return appointments.map((a, i) => ({ 
      date: a.time, 
      amount: appointments.slice(0, i + 1).reduce((acc, curr) => acc + curr.price, 0) 
    }));
  }, [appointments]);

  const topServices = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(app => counts[app.serviceName] = (counts[app.serviceName] || 0) + 1);
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 5);
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
    setActiveView('dashboard');
  };

  if (activeView === 'onboarding') {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xl"></div>
        <div className="glass-card max-w-2xl w-full p-16 rounded-[4rem] luxury-shadow relative z-10">
           <div className="text-center mb-12">
              <Sparkles className="w-16 h-16 text-rose-500 mx-auto mb-8" />
              <h1 className="text-5xl font-display font-bold text-slate-900 leading-tight">BellaFlow</h1>
              <p className="text-slate-700 mt-6 text-xl">Nome do seu negócio para começarmos:</p>
           </div>
           <input 
             autoFocus
             type="text" 
             value={setupInput}
             onChange={(e) => setSetupInput(e.target.value)}
             className="w-full bg-white/60 border-2 border-white/80 p-8 rounded-[2.5rem] text-3xl font-display outline-none text-slate-900 text-center mb-8"
             placeholder="Ex: Studio VIP..."
           />
           <button 
             onClick={handleOnboarding}
             disabled={!setupInput.trim() || isProcessingMsg}
             className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center space-x-4"
           >
             {isProcessingMsg ? <Loader2 className="animate-spin" /> : <span>Iniciar Jornada</span>}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-80 sidebar-dark flex flex-col p-8 hidden lg:flex border-r border-white/5">
        <div className="flex items-center space-x-4 mb-16">
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-xl">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold text-white truncate">{salon.name}</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={<Calendar />} label="Agenda" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <SidebarItem icon={<MessageCircle />} label="WhatsApp AI" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
          <SidebarItem icon={<Smartphone />} label="Conexão" active={activeView === 'connection'} onClick={() => setActiveView('connection')} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto bg-transparent relative custom-scrollbar">
        <header className="h-20 bg-white/20 backdrop-blur-3xl border-b border-white/30 flex items-center justify-between px-10 sticky top-0 z-50">
           <h2 className="text-2xl font-display font-bold text-slate-900 capitalize">{activeView}</h2>
           <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                 <span>{isConnected ? 'WhatsApp Ativo' : 'Offline'}</span>
              </div>
           </div>
        </header>

        <div className="p-10">
          {activeView === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Receita de Hoje" value={`R$ ${totalRevenue.toLocaleString()}`} trend="+12%" icon={<DollarSign />} />
                <MetricCard title="Agendamentos" value={appointments.length.toString()} trend="+5%" icon={<Calendar />} />
                <MetricCard title="Mensagens" value={incomingMessages.length.toString()} trend="+8%" icon={<MessageCircle />} />
                <MetricCard title="Status Backend" value={isBackendOnline ? 'Online' : 'Offline'} trend="" icon={<Globe />} />
              </div>

              {!isConnected && (
                <div className="glass-card p-12 rounded-[3rem] text-center bg-rose-500/5 border-rose-500/20">
                   <h4 className="text-2xl font-display font-bold text-slate-900 mb-4">Ação Necessária</h4>
                   <p className="text-slate-600 mb-8 max-w-md mx-auto">Você ainda não conectou o WhatsApp. Sem a conexão, a Bella IA não consegue monitorar agendamentos automaticamente.</p>
                   <button onClick={() => setActiveView('connection')} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-bold shadow-xl">Conectar WhatsApp Real</button>
                </div>
              )}

              {appointments.length > 0 && (
                <div className="glass-card p-10 rounded-[3rem] luxury-shadow">
                   <h3 className="text-xl font-display font-bold text-slate-900 mb-8">Fluxo Financeiro</h3>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="date" hide />
                            <Tooltip />
                            <Area type="monotone" dataKey="amount" stroke="#f43f5e" fill="rgba(244, 63, 94, 0.1)" strokeWidth={4} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'connection' && (
            <div className="max-w-4xl mx-auto py-10">
               <div className="bg-white rounded-[4rem] luxury-shadow overflow-hidden">
                  <div className="bg-[#075e54] p-16 text-white text-center">
                     <Smartphone className="w-16 h-16 mx-auto mb-6" />
                     <h3 className="text-4xl font-display font-bold">Conectar WhatsApp Real</h3>
                     <p className="mt-4 opacity-80 text-lg">Use seu celular para escanear o código gerado pelo seu servidor.</p>
                  </div>
                  
                  <div className="p-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                     <div className="space-y-8">
                        <div className={`p-6 rounded-3xl border flex items-center space-x-4 ${isBackendOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                           {isBackendOnline ? <CheckCircle2 /> : <AlertTriangle />}
                           <div>
                              <p className="font-black text-[10px] uppercase tracking-widest">Status do Servidor Local</p>
                              <p className="text-sm font-bold">{isBackendOnline ? 'Backend Conectado (Porta 3001)' : 'Backend não encontrado'}</p>
                           </div>
                        </div>

                        {!isBackendOnline && (
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                <b>Atenção:</b> Para conexão real, você deve rodar o arquivo <code>server.js</code> em sua máquina.
                             </p>
                          </div>
                        )}

                        <div className="space-y-4">
                           <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Configurações Avançadas</p>
                           <input 
                             type="text" 
                             value={backendUrl}
                             onChange={(e) => setBackendUrl(e.target.value)}
                             placeholder="URL do Backend"
                             className="w-full bg-slate-100 p-4 rounded-2xl text-xs font-mono outline-none border focus:border-rose-500 transition-all"
                           />
                        </div>

                        {isConnected && (
                           <div className="text-center p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 animate-in zoom-in-95">
                              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                              <h4 className="text-2xl font-display font-bold text-slate-900">Dispositivo Vinculado</h4>
                              <p className="text-slate-600 mt-2">Seu WhatsApp Business está sincronizado com a Bella IA.</p>
                           </div>
                        )}
                     </div>

                     <div className="flex flex-col items-center">
                        <div className="bg-slate-900 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden min-w-[340px] min-h-[340px] flex items-center justify-center">
                           {isConnected ? (
                             <div className="text-center">
                                <Smartphone className="w-24 h-24 text-white/20 mx-auto mb-4 animate-bounce" />
                                <span className="text-emerald-400 font-black text-xs uppercase tracking-widest">Ativo e Pronto</span>
                             </div>
                           ) : qrCodeData ? (
                             <div className="bg-white p-6 rounded-3xl animate-in fade-in duration-1000">
                                <img src={qrCodeData} alt="WhatsApp QR Code Real" className="w-64 h-64" />
                             </div>
                           ) : (
                             <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto" />
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Aguardando Servidor...</p>
                             </div>
                           )}
                           
                           {connStatus === 'authenticating' && (
                             <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white p-10 text-center">
                                <RefreshCw className="w-16 h-16 animate-spin text-[#075e54] mb-6" />
                                <p className="font-bold">Autenticando sessão...</p>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeView === 'whatsapp' && (
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in">
               <div className="glass-card p-10 rounded-[3rem] flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-slate-900">Monitor de Conversas</h3>
                    <p className="text-slate-600">Bella IA analisa estas conversas em busca de horários.</p>
                  </div>
                  {!isConnected && <button onClick={() => setActiveView('connection')} className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold">Ativar WhatsApp</button>}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-2 glass-card rounded-[3rem] p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                     <div className="space-y-4">
                        {incomingMessages.map(msg => (
                          <div key={msg.id} className="p-6 bg-white/50 rounded-3xl border border-white hover:border-rose-200 transition-all cursor-pointer" onClick={() => setWaMessage(msg.text)}>
                             <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{msg.sender}</span>
                                <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                             </div>
                             <p className="text-sm text-slate-800 font-medium">{msg.text}</p>
                          </div>
                        ))}
                        {incomingMessages.length === 0 && <div className="py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">Nenhuma mensagem...</div>}
                     </div>
                  </div>
                  
                  <div className="lg:col-span-3 glass-dark p-10 rounded-[3rem] text-white flex flex-col min-h-[500px]">
                     <h4 className="text-lg font-display font-bold mb-8 flex items-center space-x-3">
                        <Zap className="text-rose-500" />
                        <span>Análise Bella IA</span>
                     </h4>
                     <textarea 
                       value={waMessage}
                       onChange={(e) => setWaMessage(e.target.value)}
                       placeholder="Selecione uma mensagem ou digite aqui para testar o reconhecimento..."
                       className="flex-1 bg-transparent border-none text-rose-50 text-2xl font-display outline-none resize-none placeholder:text-white/10"
                     />
                     <button 
                       onClick={async () => {
                         setIsProcessingMsg(true);
                         const res = await extractAppointmentFromText(waMessage);
                         setShowBookingConfirm(res);
                         setIsProcessingMsg(false);
                       }}
                       disabled={!waMessage.trim() || isProcessingMsg}
                       className="mt-8 w-full bg-rose-500 py-6 rounded-3xl font-black uppercase text-sm shadow-xl hover:bg-rose-600 disabled:opacity-20 transition-all"
                     >
                        {isProcessingMsg ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar e Agendar'}
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {showBookingConfirm && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
              <div className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full animate-in zoom-in-95">
                 <h4 className="text-3xl font-display font-bold text-slate-900 mb-8">Confirmar Reserva</h4>
                 <div className="space-y-4 mb-10">
                    {[
                      { l: 'Cliente', v: showBookingConfirm.clientName },
                      { l: 'Serviço', v: showBookingConfirm.serviceName },
                      { l: 'Data/Hora', v: `${showBookingConfirm.date} às ${showBookingConfirm.time}` }
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.l}</p>
                         <p className="text-xl font-bold text-slate-800">{item.v}</p>
                      </div>
                    ))}
                 </div>
                 <div className="flex space-x-4">
                    <button onClick={() => setShowBookingConfirm(null)} className="flex-1 py-6 rounded-3xl font-bold text-slate-400">Cancelar</button>
                    <button onClick={() => confirmBooking(showBookingConfirm)} className="flex-[2] bg-rose-500 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl">Salvar na Agenda</button>
                 </div>
              </div>
           </div>
        )}
      </main>

      <div className="fixed bottom-6 right-8 z-[60]">
         <div className="glass-card px-5 py-2 rounded-full flex items-center space-x-3 border-white/40">
            <Code2 className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">BellaFlow v2.0 - <span className="text-rose-600">Real WA Engine</span></span>
         </div>
      </div>

      <style>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
}
