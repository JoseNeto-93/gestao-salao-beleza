
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
  AlertTriangle,
  Server,
  Key,
  Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Appointment, Service, View, IncomingMessage, SalonConfig, InstanceConfig } from './types';
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
    const saved = localStorage.getItem('bella_salon_config_v3');
    return saved ? JSON.parse(saved) : { 
      name: '', 
      niche: '', 
      setupComplete: false,
      instance: {
        apiUrl: 'http://localhost:3001',
        apiKey: '',
        instanceName: 'bella_default',
        provider: 'cloud-demo'
      }
    };
  });
  
  const [activeView, setActiveView] = useState<View>(salon.setupComplete ? 'dashboard' : 'onboarding');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [isProcessingMsg, setIsProcessingMsg] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [showBookingConfirm, setShowBookingConfirm] = useState<any>(null);
  
  // Estado da Conexão
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connStatus, setConnStatus] = useState<'idle' | 'connecting' | 'waiting' | 'ready' | 'error'>('idle');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [setupInput, setSetupInput] = useState('');

  // Persistência
  useEffect(() => {
    localStorage.setItem('bella_salon_config_v3', JSON.stringify(salon));
  }, [salon]);

  // Monitor de API (Polling)
  useEffect(() => {
    if (salon.instance?.provider === 'cloud-demo') {
      setIsApiOnline(true);
      return;
    }

    const checkApi = async () => {
      try {
        const response = await fetch(`${salon.instance?.apiUrl}/status`);
        const data = await response.json();
        setIsApiOnline(true);
        if (data.status === 'CONNECTED') {
          setIsConnected(true);
          setConnStatus('ready');
          setQrCodeData(null);
        } else if (data.status === 'WAITING_FOR_SCAN') {
          setConnStatus('waiting');
          fetchQr();
        }
      } catch (err) {
        setIsApiOnline(false);
        setConnStatus('error');
      }
    };

    const fetchQr = async () => {
      try {
        const response = await fetch(`${salon.instance?.apiUrl}/qr`);
        const data = await response.json();
        if (data.qr) setQrCodeData(data.qr);
      } catch (e) {}
    };

    const timer = setInterval(checkApi, 5000);
    checkApi();
    return () => clearInterval(timer);
  }, [salon.instance]);

  // Simulador de Mensagens (Só quando conectado)
  useEffect(() => {
    if (isConnected || salon.instance?.provider === 'cloud-demo') {
      const interval = setInterval(async () => {
        if (Math.random() > 0.8) {
          const clients = ['Juliana Oliveira', 'Bia Nunes', 'Fernanda Lima', 'Carla Santos'];
          const texts = [
            "Oi, quero marcar um corte para amanhã às 10h",
            "Olá! Tem horário para manicure hoje?",
            "Pode agendar uma selagem para sexta às 14h?",
            "Quanto está a escova hoje?"
          ];
          const newMsg: IncomingMessage = {
            id: Date.now().toString(),
            sender: clients[Math.floor(Math.random()*clients.length)],
            text: texts[Math.floor(Math.random()*texts.length)],
            timestamp: new Date().toLocaleTimeString(),
            processed: false
          };
          setIncomingMessages(prev => [newMsg, ...prev].slice(0, 10));
        }
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isConnected, salon.instance?.provider]);

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
  };

  if (activeView === 'onboarding') {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xl"></div>
        <div className="glass-card max-w-2xl w-full p-16 rounded-[4rem] luxury-shadow relative z-10 animate-in zoom-in-95 border-white/40">
           <div className="text-center mb-12">
              <Sparkles className="w-16 h-16 text-rose-500 mx-auto mb-8 animate-pulse" />
              <h1 className="text-5xl font-display font-bold text-slate-900">BellaFlow SaaS</h1>
              <p className="text-slate-700 mt-6 text-xl font-medium">Bem-vinda! Como se chama o seu salão?</p>
           </div>
           <input 
             autoFocus
             type="text" 
             value={setupInput}
             onChange={(e) => setSetupInput(e.target.value)}
             className="w-full bg-white/60 border-2 border-white/80 p-8 rounded-[2.5rem] text-3xl font-display outline-none text-slate-900 text-center mb-8 focus:ring-8 focus:ring-rose-500/10 transition-all"
             placeholder="Ex: Studio Bella..."
           />
           <button 
             onClick={handleOnboarding}
             disabled={!setupInput.trim() || isProcessingMsg}
             className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center space-x-4 active:scale-95 transition-all"
           >
             {isProcessingMsg ? <Loader2 className="animate-spin" /> : <span>Começar Agora</span>}
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
          <SidebarItem icon={<MessageCircle />} label="Mensagens IA" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
          <SidebarItem icon={<Smartphone />} label="Conexão WA" active={activeView === 'connection'} onClick={() => setActiveView('connection')} />
          <SidebarItem icon={<Settings />} label="Ajustes API" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
           <div className={`flex items-center space-x-3 p-4 rounded-2xl ${isConnected || salon.instance?.provider === 'cloud-demo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected || salon.instance?.provider === 'cloud-demo' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest">{isConnected || salon.instance?.provider === 'cloud-demo' ? 'Link Ativo' : 'Sem Link'}</span>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto bg-transparent relative custom-scrollbar">
        <header className="h-20 bg-white/20 backdrop-blur-3xl border-b border-white/30 flex items-center justify-between px-10 sticky top-0 z-50">
           <h2 className="text-2xl font-display font-bold text-slate-900 capitalize">{activeView}</h2>
           <div className="flex items-center space-x-4">
              <button onClick={() => {localStorage.clear(); window.location.reload();}} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><RefreshCw className="w-5 h-5" /></button>
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">{salon.name[0]}</div>
           </div>
        </header>

        <div className="p-10">
          {activeView === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Receita Hoje" value={`R$ ${totalRevenue.toLocaleString()}`} trend="+R$ 0" icon={<DollarSign />} />
                <MetricCard title="Agendados" value={appointments.length.toString()} trend="0" icon={<Calendar />} />
                <MetricCard title="Conversas" value={incomingMessages.length.toString()} trend="0" icon={<MessageCircle />} />
                <MetricCard title="Conversão" value={appointments.length > 0 ? "92%" : "0%"} trend="0%" icon={<Zap />} />
              </div>

              {appointments.length === 0 ? (
                <div className="glass-card p-24 rounded-[3.5rem] text-center border-white/50 bg-white/30 luxury-shadow">
                   <div className="w-20 h-20 bg-white/60 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <Database className="w-10 h-10 text-slate-300" />
                   </div>
                   <h3 className="text-3xl font-display font-bold text-slate-900 mb-4">Seu Painel está Pronto</h3>
                   <p className="text-slate-600 max-w-md mx-auto mb-10 text-lg leading-relaxed">Conecte seu WhatsApp para que a Bella comece a capturar agendamentos e gerar seu faturamento automaticamente.</p>
                   <button onClick={() => setActiveView('connection')} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">Configurar Canal de Entrada</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] luxury-shadow">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-8">Evolução do Faturamento</h3>
                      <div className="h-[350px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                               <XAxis dataKey="date" hide />
                               <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                               <Area type="monotone" dataKey="amount" stroke="#f43f5e" fill="rgba(244, 63, 94, 0.08)" strokeWidth={4} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="glass-dark p-10 rounded-[3rem] text-white shadow-2xl">
                      <h3 className="text-xl font-display font-bold mb-8">Ranking de Serviços</h3>
                      <div className="space-y-5">
                         {topServices.map((s, i) => (
                           <div key={i} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10">
                              <span className="font-bold text-sm tracking-tight">{s.name}</span>
                              <span className="text-rose-400 font-black text-xs px-3 py-1 bg-rose-500/10 rounded-full">{s.count}x</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'settings' && (
            <div className="max-w-4xl mx-auto py-10 animate-in zoom-in-95 duration-500">
               <div className="bg-white rounded-[3.5rem] luxury-shadow overflow-hidden border border-slate-100">
                  <div className="bg-slate-900 p-12 text-white">
                     <h3 className="text-3xl font-display font-bold flex items-center">
                        <Server className="mr-4 text-rose-500" />
                        Configurações da API SaaS
                     </h3>
                     <p className="mt-2 opacity-60">Escolha como sua instância do WhatsApp será gerenciada.</p>
                  </div>
                  
                  <div className="p-12 space-y-10">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { id: 'cloud-demo', label: 'Cloud Demo', icon: <Globe className="w-5 h-5" />, desc: 'Simulação via nuvem Bella.' },
                          { id: 'local', label: 'Servidor Local', icon: <Smartphone className="w-5 h-5" />, desc: 'Usa seu backend node pessoal.' },
                          { id: 'evolution', label: 'Evolution API', icon: <Zap className="w-5 h-5" />, desc: 'API profissional em VPS.' }
                        ].map((provider) => (
                          <button 
                            key={provider.id}
                            onClick={() => setSalon({ ...salon, instance: { ...salon.instance!, provider: provider.id as any } })}
                            className={`p-6 rounded-[2.5rem] border-2 text-left transition-all ${salon.instance?.provider === provider.id ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${salon.instance?.provider === provider.id ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {provider.icon}
                             </div>
                             <p className="font-bold text-slate-900">{provider.label}</p>
                             <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">{provider.desc}</p>
                          </button>
                        ))}
                     </div>

                     {salon.instance?.provider !== 'cloud-demo' && (
                       <div className="space-y-6 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 animate-in slide-in-from-top-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">URL da API do Provedor</label>
                                <input 
                                  type="text" 
                                  value={salon.instance?.apiUrl}
                                  onChange={(e) => setSalon({...salon, instance: {...salon.instance!, apiUrl: e.target.value}})}
                                  className="w-full bg-white p-6 rounded-3xl border border-slate-200 outline-none focus:border-rose-500 font-mono text-xs"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome da Instância</label>
                                <input 
                                  type="text" 
                                  value={salon.instance?.instanceName}
                                  onChange={(e) => setSalon({...salon, instance: {...salon.instance!, instanceName: e.target.value}})}
                                  className="w-full bg-white p-6 rounded-3xl border border-slate-200 outline-none focus:border-rose-500 font-mono text-xs"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">API Key / Token de Acesso</label>
                             <div className="relative">
                                <input 
                                  type="password" 
                                  value={salon.instance?.apiKey}
                                  onChange={(e) => setSalon({...salon, instance: {...salon.instance!, apiKey: e.target.value}})}
                                  className="w-full bg-white p-6 rounded-3xl border border-slate-200 outline-none focus:border-rose-500 font-mono text-xs pr-16"
                                />
                                <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                             </div>
                          </div>
                       </div>
                     )}

                     <div className="flex justify-end">
                        <button onClick={() => setActiveView('dashboard')} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-bold shadow-xl active:scale-95 transition-all">Salvar Configurações</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeView === 'connection' && (
            <div className="max-w-5xl mx-auto py-10 animate-in zoom-in-95">
               <div className="bg-white rounded-[4rem] luxury-shadow overflow-hidden border border-slate-100">
                  <div className="bg-[#128C7E] p-16 text-white text-center">
                     <Smartphone className="w-16 h-16 mx-auto mb-6" />
                     <h3 className="text-4xl font-display font-bold">Vincular Canal WhatsApp</h3>
                     <p className="mt-4 opacity-80 text-xl font-medium">Capture agendamentos diretamente do seu número.</p>
                  </div>
                  
                  <div className="p-16 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                     <div className="space-y-10">
                        <div className="space-y-6">
                           {[
                             "Abra o WhatsApp no seu celular principal.",
                             "Vá em Aparelhos Conectados > Conectar um Aparelho.",
                             "Escaneie o QR Code ao lado para iniciar a Bella IA."
                           ].map((step, i) => (
                             <div key={i} className="flex items-start space-x-6">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 font-black text-slate-900 border border-slate-200">{i+1}</div>
                                <p className="text-slate-700 font-medium text-lg leading-relaxed">{step}</p>
                             </div>
                           ))}
                        </div>

                        {salon.instance?.provider === 'cloud-demo' && (
                           <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 flex items-start space-x-4">
                              <Info className="w-6 h-6 text-rose-500 shrink-0 mt-1" />
                              <div className="space-y-2">
                                 <p className="font-bold text-rose-800">Modo Cloud Demo Ativo</p>
                                 <p className="text-xs text-rose-600 leading-relaxed">Você está usando o provedor de demonstração. O QR Code abaixo é simulado para teste de interface. Para um QR Code real, mude para <b>Evolution API</b> ou <b>Servidor Local</b> em Ajustes.</p>
                              </div>
                           </div>
                        )}

                        <div className={`p-6 rounded-3xl border flex items-center space-x-4 ${isApiOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                           {isApiOnline ? <CheckCircle2 /> : <AlertTriangle />}
                           <div>
                              <p className="font-black text-[10px] uppercase tracking-widest opacity-60">Status da API Gateway</p>
                              <p className="text-sm font-bold">{isApiOnline ? 'Gateway Online & Pronto' : 'Gateway Desconectado'}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-center">
                        <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl relative min-w-[360px] min-h-[360px] flex items-center justify-center">
                           {isConnected || salon.instance?.provider === 'cloud-demo' ? (
                             <div className="text-center space-y-6 animate-in zoom-in-50">
                                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                                   <Smartphone className="w-12 h-12 text-emerald-400 animate-bounce" />
                                </div>
                                <div>
                                   <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em]">Dispositivo Ativo</p>
                                   <p className="text-white/60 text-[10px] mt-2 font-medium">Instância: {salon.instance?.instanceName}</p>
                                </div>
                                <button onClick={() => setIsConnected(false)} className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:underline">Desconectar</button>
                             </div>
                           ) : qrCodeData ? (
                             <div className="bg-white p-6 rounded-[2.5rem] animate-in fade-in">
                                <img src={qrCodeData} alt="WhatsApp QR Code" className="w-64 h-64" />
                             </div>
                           ) : (
                             <div className="text-center space-y-6">
                                <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto" />
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em]">Sincronizando Gateway...</p>
                             </div>
                           )}
                           
                           {connStatus === 'connecting' && (
                             <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white rounded-[4rem] z-10">
                                <RefreshCw className="w-16 h-16 animate-spin text-rose-500 mb-6" />
                                <p className="font-bold tracking-tight">Vibrando servidor...</p>
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
               <div className="glass-card p-12 rounded-[3.5rem] flex justify-between items-center shadow-xl border-white/50">
                  <div>
                    <h3 className="text-3xl font-display font-bold text-slate-900">Monitor de Conversas IA</h3>
                    <p className="text-slate-600 mt-2 font-medium">As conversas abaixo estão sendo analisadas pela Bella em tempo real.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-2 glass-card rounded-[3rem] p-8 max-h-[650px] overflow-y-auto custom-scrollbar border-white/40 shadow-inner">
                     <div className="space-y-5">
                        {incomingMessages.map(msg => (
                          <div key={msg.id} className="p-7 bg-white/60 rounded-[2.5rem] border border-white hover:border-rose-200 transition-all cursor-pointer group" onClick={() => setWaMessage(msg.text)}>
                             <div className="flex justify-between mb-3">
                                <span className="text-xs font-black text-rose-600 uppercase tracking-widest group-hover:scale-105 transition-transform">{msg.sender}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{msg.timestamp}</span>
                             </div>
                             <p className="text-sm text-slate-800 font-semibold leading-relaxed line-clamp-2">{msg.text}</p>
                          </div>
                        ))}
                        {incomingMessages.length === 0 && <div className="py-32 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.3em]">Aguardando mensagens...</div>}
                     </div>
                  </div>
                  
                  <div className="lg:col-span-3 glass-dark p-12 rounded-[4rem] text-white flex flex-col min-h-[550px] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] -mr-32 -mt-32"></div>
                     <h4 className="text-xl font-display font-bold mb-10 flex items-center space-x-4 relative z-10">
                        <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                           <Zap className="text-white w-6 h-6" />
                        </div>
                        <span>Análise da Bella IA</span>
                     </h4>
                     <textarea 
                       value={waMessage}
                       onChange={(e) => setWaMessage(e.target.value)}
                       placeholder="Selecione um chat ou digite uma intenção de agendamento aqui..."
                       className="flex-1 bg-transparent border-none text-rose-50 text-3xl font-display outline-none resize-none placeholder:text-white/10 leading-relaxed relative z-10"
                     />
                     <button 
                       onClick={async () => {
                         setIsProcessingMsg(true);
                         try {
                           const res = await extractAppointmentFromText(waMessage);
                           setShowBookingConfirm(res);
                         } catch (e) {}
                         setIsProcessingMsg(false);
                       }}
                       disabled={!waMessage.trim() || isProcessingMsg}
                       className="mt-10 w-full bg-rose-500 py-8 rounded-[2.5rem] font-black uppercase text-sm shadow-2xl hover:bg-rose-600 disabled:opacity-20 active:scale-95 transition-all relative z-10"
                     >
                        {isProcessingMsg ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar Extração'}
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {showBookingConfirm && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/85 backdrop-blur-xl">
              <div className="bg-white rounded-[4rem] p-16 max-w-2xl w-full animate-in zoom-in-95 luxury-shadow">
                 <h4 className="text-4xl font-display font-bold text-slate-900 mb-10 tracking-tight">Confirmar Agendamento</h4>
                 <div className="space-y-6 mb-12">
                    {[
                      { l: 'Cliente', v: showBookingConfirm.clientName },
                      { l: 'Serviço Identificado', v: showBookingConfirm.serviceName },
                      { l: 'Data Sugerida', v: `${showBookingConfirm.date} às ${showBookingConfirm.time}` }
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.l}</p>
                            <p className="text-2xl font-bold text-slate-800">{item.v}</p>
                         </div>
                         <CheckCircle2 className="text-emerald-500 w-8 h-8 opacity-20" />
                      </div>
                    ))}
                 </div>
                 <div className="flex space-x-6">
                    <button onClick={() => setShowBookingConfirm(null)} className="flex-1 py-7 rounded-[2.5rem] font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                    <button onClick={() => confirmBooking(showBookingConfirm)} className="flex-[2] bg-rose-500 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-rose-600 transition-all active:scale-95">Confirmar na Agenda</button>
                 </div>
              </div>
           </div>
        )}

        <div className="fixed bottom-8 right-10 z-[60]">
           <div className="glass-card px-6 py-3 rounded-full flex items-center space-x-4 border-white/50 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.25em]">SaaS Cloud Engine v3.0 - <span className="text-rose-600">dn3j</span></span>
           </div>
        </div>
      </main>

      <style>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
