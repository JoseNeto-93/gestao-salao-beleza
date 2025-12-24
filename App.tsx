
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageCircle, 
  DollarSign, 
  TrendingUp,
  Scissors,
  Smartphone,
  Zap,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Bell,
  User,
  Code2,
  ArrowUpRight,
  Globe,
  Cloud,
  Layers,
  Target,
  Copy,
  ExternalLink,
  Crown,
  Heart,
  Star,
  Play,
  X,
  Smartphone as PhoneIcon,
  MousePointer2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Appointment, View, IncomingMessage, SalonConfig } from './types';
import { INITIAL_SERVICES } from './constants';
import { extractAppointmentFromText, suggestSalonBranding } from './services/geminiService';

// --- Componentes Premium Refinados ---

const MetricCard = ({ title, value, trend, icon, color = "magenta" }: any) => (
  <div className="glass-card p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] luxury-shadow relative overflow-hidden group transition-all border-t border-white/10 active:scale-[0.98]">
    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-[#ff007a]/10 rounded-full blur-2xl transition-all duration-700`}></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className="p-3 bg-white/10 rounded-xl text-[#ff007a] shadow-inner border border-white/10 glow-magenta">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        {trend && (
          <span className="text-[9px] font-black bg-[#ff007a]/20 text-white px-2.5 py-1 rounded-full flex items-center border border-[#ff007a]/30 backdrop-blur-md">
            <TrendingUp className="w-2.5 h-2.5 mr-1" /> {trend}
          </span>
        )}
      </div>
      <p className="text-[8px] sm:text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-0.5 sm:mb-1">{title}</p>
      <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight text-shadow">{value}</h3>
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-gradient-to-r from-[#ff007a] to-[#d40062] text-white shadow-xl shadow-[#ff007a]/30 border border-white/10' 
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-[#ff007a]/60 group-hover:text-[#ff007a]'} transition-colors`}>{icon}</div>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-3 transition-all ${
      active ? 'text-[#ff007a]' : 'text-white/40'
    }`}
  >
    <div className={`${active ? 'animate-pulse' : ''}`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">{label}</span>
  </button>
);

// --- Componente de Vídeo de Apresentação (Motion Graphics) ---

const VideoPresentation = ({ onClose, onFinish }: { onClose: () => void, onFinish: () => void }) => {
  const [scene, setScene] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (scene < 5) {
            setScene(s => s + 1);
            return 0;
          } else {
            clearInterval(timer);
            return 100;
          }
        }
        return prev + 0.5;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [scene]);

  const renderScene = () => {
    switch(scene) {
      case 1: // O Problema
        return (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative mb-12">
              <MessageCircle className="w-24 h-24 text-red-500/50 blur-[2px] animate-pulse" />
              <div className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full animate-bounce">
                <AlertTriangle size={24} />
              </div>
            </div>
            <h3 className="text-4xl font-display font-black text-white mb-6 leading-tight">
              Você perde clientes no <span className="text-red-500">WhatsApp?</span>
            </h3>
            <p className="text-white/40 text-lg">Confusão de horários e anotações manuais estão matando seu lucro.</p>
          </div>
        );
      case 2: // A Solução
        return (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in slide-in-from-bottom duration-700">
            <div className="w-32 h-32 bg-gradient-to-br from-[#ff007a] to-[#d40062] rounded-3xl flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(255,0,122,0.4)] glow-magenta border border-white/20">
              <Layers className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-4xl font-display font-black text-white mb-6 leading-tight">
              Seu WhatsApp agora <br/> <span className="text-[#ff007a] text-glow italic">trabalha por você</span>
            </h3>
            <p className="text-white/60 text-lg">BellaFlow: O cérebro do seu salão.</p>
          </div>
        );
      case 3: // A IA
        return (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-full max-w-xs glass-card p-6 rounded-3xl mb-12 border-[#ff007a]/30 relative overflow-hidden">
               <div className="flex items-center space-x-3 mb-4 opacity-50">
                  <div className="w-8 h-8 rounded-full bg-white/10"></div>
                  <div className="h-3 w-24 bg-white/20 rounded"></div>
               </div>
               <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
               <div className="h-4 w-3/4 bg-white/10 rounded mb-6"></div>
               
               <div className="bg-[#ff007a]/10 border border-[#ff007a]/30 p-4 rounded-2xl animate-pulse">
                  <div className="flex items-center space-x-2 text-[#ff007a] mb-2">
                     <Zap size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">IA Extraindo...</span>
                  </div>
                  <div className="h-3 w-1/2 bg-[#ff007a]/40 rounded"></div>
               </div>
            </div>
            <h3 className="text-3xl font-display font-black text-white mb-6">
              A IA sugere agendamentos <br/> <span className="text-[#ff007a]">em segundos</span>
            </h3>
            <p className="text-white/40 text-base">Extração automática de datas, serviços e preços.</p>
          </div>
        );
      case 4: // Mobile First
        return (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in slide-in-from-right duration-700">
            <div className="relative mb-12">
               <div className="w-48 h-80 border-4 border-white/10 rounded-[3rem] p-4 bg-black/40 backdrop-blur-xl relative overflow-hidden">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full mx-auto mb-6"></div>
                  <div className="space-y-3">
                     <div className="h-20 w-full bg-[#ff007a]/5 rounded-2xl border border-white/5"></div>
                     <div className="grid grid-cols-2 gap-2">
                        <div className="h-16 bg-white/5 rounded-xl"></div>
                        <div className="h-16 bg-white/5 rounded-xl"></div>
                     </div>
                  </div>
                  <MousePointer2 className="absolute bottom-10 right-10 text-[#ff007a] animate-bounce" />
               </div>
            </div>
            <h3 className="text-4xl font-display font-bold text-white mb-6">
              Funciona 100% <br/> <span className="text-[#ff007a]">no celular</span>
            </h3>
            <p className="text-white/40 text-lg">Sem computador. Sem burocracia.</p>
          </div>
        );
      case 5: // CTA
        return (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in zoom-in duration-700">
            <Crown className="w-20 h-20 text-[#ff007a] mb-8 glow-magenta" />
            <h3 className="text-5xl font-display font-black text-white mb-8 leading-tight">
              Organize seu <br/> salão hoje
            </h3>
            <button 
              onClick={onFinish}
              className="btn-magenta text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl animate-float"
            >
              Começar Agora
            </button>
            <div className="mt-16 opacity-30 text-[10px] font-black uppercase tracking-[0.4em]">
              Desenvolvido por DN3J
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0118] flex flex-col items-center justify-center overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-[#ff007a]/15 rounded-full blur-[120px]"></div>
      </div>

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white transition-all z-[210]"
      >
        <X size={24} />
      </button>

      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div 
          className="h-full bg-gradient-to-r from-[#ff007a] to-[#d40062] transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="relative z-[205] w-full h-full max-w-lg aspect-[9/16]">
        {renderScene()}
      </div>

      {/* Scene Indicators */}
      <div className="absolute bottom-12 flex space-x-3">
        {[1, 2, 3, 4, 5].map(s => (
          <div 
            key={s}
            className={`h-1 rounded-full transition-all duration-500 ${
              s === scene ? 'w-8 bg-[#ff007a]' : 'w-2 bg-white/10'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [salon, setSalon] = useState<SalonConfig>(() => {
    const saved = localStorage.getItem('bellaflow_pro_v3');
    return saved ? JSON.parse(saved) : { name: '', setupComplete: false, niche: 'Beauty' };
  });

  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('bellaflow_backend_url') || 'http://localhost:3001';
  });

  const [activeView, setActiveView] = useState<View>(() => {
    if (!salon.setupComplete) return 'onboarding';
    return 'dashboard';
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bellaflow_appointments_v3');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [connStatus, setConnStatus] = useState('OFFLINE');
  const [tempBooking, setTempBooking] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('bellaflow_pro_v3', JSON.stringify(salon));
    localStorage.setItem('bellaflow_appointments_v3', JSON.stringify(appointments));
    localStorage.setItem('bellaflow_backend_url', backendUrl);
  }, [salon, appointments, backendUrl]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${backendUrl}/status`);
        const data = await res.json();
        setConnStatus(data.status);
      } catch (e) {
        setConnStatus('OFFLINE_SERVER');
      }
    };
    const interval = setInterval(checkConnection, 5000);
    checkConnection();
    return () => clearInterval(interval);
  }, [backendUrl]);

  const totalRevenue = useMemo(() => appointments.reduce((sum, a) => sum + a.price, 0), [appointments]);
  
  const revenueChartData = useMemo(() => {
    if (appointments.length === 0) return [{ date: 'Inicio', valor: 0 }];
    return appointments.map((a, i) => ({
      date: a.time,
      valor: appointments.slice(0, i + 1).reduce((acc, curr) => acc + curr.price, 0)
    }));
  }, [appointments]);

  const handleOnboarding = async (val: string) => {
    if (!val.trim()) return;
    setIsProcessing(true);
    try {
      const result = await suggestSalonBranding(val);
      setSalon({ name: result.salonName, setupComplete: true, niche: 'Beauty' });
      setActiveView('dashboard');
    } catch (e) {
      setSalon({ name: val, setupComplete: true, niche: 'Beauty' });
      setActiveView('dashboard');
    } finally {
      setIsProcessing(false);
    }
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const result = await extractAppointmentFromText(text);
      setTempBooking(result);
    } catch (e) {
      alert("Erro ao analisar mensagem.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmBooking = () => {
    if (!tempBooking) return;
    const service = INITIAL_SERVICES.find(s => 
      s.name.toLowerCase().includes(tempBooking.serviceName.toLowerCase())
    ) || INITIAL_SERVICES[0];

    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: tempBooking.clientName,
      serviceId: service.id,
      serviceName: service.name,
      date: tempBooking.date,
      time: tempBooking.time,
      status: 'Confirmado',
      price: service.price,
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [...prev, newApp]);
    setTempBooking(null);
    setWaMessage('');
    setActiveView('dashboard');
  };

  // Use a temporary variable or cast to bypass unintentional narrowing if early returns confuse the compiler
  const isVideoView = (activeView as string) === 'video_presentation';

  if (isVideoView) {
    return (
      <VideoPresentation 
        onClose={() => setActiveView(salon.setupComplete ? 'dashboard' : 'onboarding')} 
        onFinish={() => {
          if (salon.setupComplete) setActiveView('dashboard');
          else setActiveView('onboarding');
        }}
      />
    );
  }

  if (activeView === 'onboarding') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative z-10 overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-[#ff007a]/30 rounded-full blur-[100px] sm:blur-[150px]"></div>
        </div>

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-20">
          <div className="text-center lg:text-left space-y-6 lg:space-y-8 animate-in slide-in-from-bottom lg:slide-in-from-left duration-1000">
             <div className="flex items-center justify-center lg:justify-start space-x-3 text-[#ff007a]">
                <Crown className="w-5 h-5 glow-magenta" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Management SaaS</span>
             </div>
             <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-white leading-[1.2] lg:leading-[1.1] tracking-tight">
                Seu Salão <br/> 
                <span className="text-[#ff007a] text-glow italic">Magnetizado</span>
             </h1>
             <p className="text-white/70 text-base sm:text-lg lg:text-xl font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed backdrop-blur-sm p-4 rounded-2xl bg-black/10">
                Atraia mais clientes e escale seu faturamento com gestão de elite pelo celular.
             </p>
             
             <div className="flex justify-center lg:justify-start pt-4">
                <button 
                  onClick={() => setActiveView('video_presentation')}
                  className="flex items-center space-x-4 glass-card px-8 py-5 rounded-2xl border border-[#ff007a]/30 hover:border-[#ff007a]/60 transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 bg-[#ff007a] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,122,0.4)] group-hover:scale-110 transition-transform">
                    <Play className="text-white ml-1" fill="currentColor" size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#ff007a]">Vídeo Importante</p>
                    <p className="text-sm font-bold text-white">Sua transformação começa aqui</p>
                  </div>
                </button>
             </div>
          </div>

          <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] text-center border-t border-white/20 relative overflow-hidden group animate-in slide-in-from-bottom duration-1000">
             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#ff007a] to-[#d40062] rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 glow-magenta animate-float border border-white/20">
                <Scissors className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-6">Comece Agora</h2>
             
             <div className="space-y-4 text-left max-w-sm mx-auto">
                <input 
                  type="text" 
                  id="salonInput"
                  placeholder="Nome do seu Espaço"
                  className="w-full bg-black/40 border border-white/20 p-5 rounded-2xl text-lg font-medium outline-none focus:border-[#ff007a]/60 transition-all text-center text-white placeholder:text-white/30 backdrop-blur-md"
                  onKeyDown={(e) => e.key === 'Enter' && handleOnboarding(e.currentTarget.value)}
                />
                <button 
                  onClick={() => handleOnboarding((document.getElementById('salonInput') as HTMLInputElement).value)}
                  className="w-full btn-magenta text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center justify-center space-x-3"
                >
                   {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <><span>Acessar Painel VIP</span> <ChevronRight className="w-4 h-4" /></>}
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden relative z-10">
      {/* Sidebar Desktop */}
      <aside className="w-72 sidebar-dark flex flex-col p-8 hidden lg:flex relative z-30">
        <div className="flex items-center space-x-3 mb-14 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#ff007a] to-[#d40062] rounded-xl flex items-center justify-center text-white glow-magenta border border-white/10">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-display font-bold text-white truncate tracking-tight">{salon.name}</h1>
        </div>
        <nav className="flex-1 space-y-3">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Faturamento" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={<Calendar size={20} />} label="Agenda IA" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <SidebarItem icon={<Target size={20} />} label="Extrair Vendas" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
          <SidebarItem icon={<Smartphone size={20} />} label="Conectar WA" active={activeView === 'connection'} onClick={() => setActiveView('connection')} />
          <SidebarItem icon={<Play size={20} />} label="Apresentação" active={(activeView as any) === 'video_presentation'} onClick={() => setActiveView('video_presentation')} />
        </nav>
        <div className="mt-auto space-y-6">
          <div className={`p-5 rounded-2xl transition-colors backdrop-blur-md ${connStatus === 'CONNECTED' ? 'bg-[#ff007a]/10 border border-[#ff007a]/30' : 'bg-red-500/10 border border-red-500/30'}`}>
             <div className="flex items-center justify-between">
                <span className={`text-[8px] font-black uppercase tracking-widest ${connStatus === 'CONNECTED' ? 'text-[#ff007a]' : 'text-red-400'}`}>
                   {connStatus === 'CONNECTED' ? 'CLOUD API: ONLINE' : 'CLOUD API: OFFLINE'}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${connStatus === 'CONNECTED' ? 'bg-[#ff007a] shadow-[0_0_8px_#ff007a]' : 'bg-red-500'}`}></div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-20 pb-24 lg:pb-0">
        <header className="h-20 lg:h-24 bg-black/40 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
          <div className="flex flex-col">
            <h2 className="text-xl lg:text-3xl font-display font-bold text-white tracking-tight capitalize drop-shadow-sm">{activeView}</h2>
            <span className="text-[8px] lg:hidden font-black text-white/30 uppercase tracking-widest">{salon.name}</span>
          </div>
          <div className="flex items-center space-x-4 lg:space-x-8">
             <div className="text-right">
                <p className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-0.5 sm:mb-1">Total</p>
                <p className="text-lg lg:text-2xl font-bold text-white glow-text">R$ {totalRevenue.toLocaleString()}</p>
             </div>
             <button className="p-2.5 bg-white/5 border border-white/10 rounded-full active:bg-white/10 transition-colors backdrop-blur-md">
                <Bell size={18} className="text-white/70" />
             </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 lg:p-12 space-y-8 lg:space-y-12">
          {activeView === 'dashboard' && (
            <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <MetricCard title="Receita" value={`R$ ${totalRevenue.toLocaleString()}`} trend="+24%" icon={<DollarSign />} />
                <MetricCard title="Agenda" value={appointments.length.toString()} icon={<Calendar />} />
                <MetricCard title="IA" value="Premium" icon={<Zap />} />
                <MetricCard title="Eficácia" value="99.8%" icon={<TrendingUp />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                 <div className="lg:col-span-2 glass-card p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] h-[300px] sm:h-[450px]">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                       <h4 className="font-bold text-white/70 tracking-wide uppercase text-[8px] sm:text-[10px]">Crescimento</h4>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff007a" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#ff007a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <Tooltip 
                           contentStyle={{backgroundColor: 'rgba(22, 8, 41, 0.95)', border: '1px solid rgba(255,0,122,0.4)', borderRadius: '12px', backdropFilter: 'blur(20px)'}}
                           itemStyle={{color: '#ff007a', fontWeight: '800'}}
                        />
                        <Area type="monotone" dataKey="valor" stroke="#ff007a" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="glass-card p-8 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col justify-center items-center text-center space-y-4 sm:space-y-6">
                    <Heart className="text-[#ff007a] w-8 h-8 drop-shadow-md glow-magenta" />
                    <h5 className="text-lg font-display font-bold text-white">Mindset Premium</h5>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">"O luxo está nos detalhes da sua gestão."</p>
                    <button 
                      onClick={() => setActiveView('video_presentation')}
                      className="text-[#ff007a] text-[10px] font-black uppercase tracking-widest flex items-center space-x-2"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Ver Apresentação</span>
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeView === 'connection' && (
            <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500">
              <div className="glass-card rounded-[2rem] sm:rounded-[4rem] overflow-hidden text-center p-8 sm:p-16">
                <Smartphone className="w-12 h-12 mx-auto mb-6 text-[#ff007a] glow-magenta" />
                <h3 className="text-2xl sm:text-4xl font-display font-bold text-white mb-2 sm:mb-4">Link Cloud</h3>
                <p className="text-white/50 text-sm sm:text-lg mb-8 sm:mb-12">WhatsApp via API Oficial Meta.</p>
                <div className="space-y-6 text-left">
                   <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                      <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-2">Endpoint Webhook</label>
                      <code className="block text-[#ff007a] bg-black/60 p-4 rounded-xl text-[10px] font-mono break-all border border-[#ff007a]/20">
                        {backendUrl}/webhook
                      </code>
                      <button className="mt-4 w-full text-center text-[#ff007a] font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-transform">Copiar Link</button>
                   </div>
                   <div className={`p-6 rounded-2xl border flex items-center space-x-4 ${connStatus === 'CONNECTED' ? 'border-[#ff007a]/30 bg-[#ff007a]/5' : 'border-white/10 bg-white/5'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${connStatus === 'CONNECTED' ? 'bg-[#ff007a] glow-magenta' : 'bg-white/10'}`}>
                         {connStatus === 'CONNECTED' ? <CheckCircle2 size={18} className="text-white" /> : <Loader2 size={18} className="text-white animate-spin" />}
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-white">{connStatus === 'CONNECTED' ? 'Ativo' : 'Verificando...'}</h4>
                         <p className="text-white/40 text-[9px] uppercase tracking-wide">Cloud API v3.0</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'whatsapp' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
               <div className="glass-card p-6 sm:p-16 rounded-[2rem] sm:rounded-[4rem]">
                  <h4 className="text-xl sm:text-2xl font-display font-bold mb-6 flex items-center text-white">
                     <Zap className="mr-2 text-[#ff007a] glow-magenta" /> Extrator IA
                  </h4>
                  <textarea 
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Cole as mensagens..."
                    className="w-full bg-black/30 border border-white/10 rounded-2xl p-6 text-base h-48 sm:h-64 outline-none focus:border-[#ff007a]/50 transition-all text-white placeholder:text-white/20 backdrop-blur-xl"
                  />
                  <button 
                    onClick={() => processMessage(waMessage)}
                    disabled={isProcessing}
                    className="mt-6 w-full btn-magenta py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center space-x-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <span>Processar IA</span>}
                  </button>
               </div>
            </div>
          )}

          {activeView === 'appointments' && (
            <div className="glass-card rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden border border-white/10 animate-in slide-in-from-right duration-500">
               <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-black/60 text-white/50 backdrop-blur-xl">
                       <tr>
                          <th className="px-6 py-5 uppercase tracking-[0.2em] text-[8px] font-black">Cliente</th>
                          <th className="px-6 py-5 uppercase tracking-[0.2em] text-[8px] font-black">Procedimento</th>
                          <th className="px-6 py-5 uppercase tracking-[0.2em] text-[8px] font-black">Valor</th>
                          <th className="px-6 py-5 uppercase tracking-[0.2em] text-[8px] font-black">Sinc</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                       {appointments.length > 0 ? appointments.map(app => (
                          <tr key={app.id} className="active:bg-white/5 transition-colors">
                             <td className="px-6 py-6">
                                <div className="flex items-center space-x-3">
                                   <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff007a] to-purple-600 flex items-center justify-center text-[10px] font-black border border-white/10">
                                      {app.clientName.charAt(0)}
                                   </div>
                                   <span className="font-bold text-white/90 text-sm">{app.clientName}</span>
                                </div>
                             </td>
                             <td className="px-6 py-6 text-white/60 text-xs">{app.serviceName}</td>
                             <td className="px-6 py-6 font-black text-[#ff007a] text-sm">R$ {app.price}</td>
                             <td className="px-6 py-6">
                                <CheckCircle2 size={16} className="text-[#ff007a]" />
                             </td>
                          </tr>
                       )) : (
                         <tr>
                           <td colSpan={4} className="px-6 py-20 text-center text-white/20 text-xs uppercase font-bold tracking-widest">Aguardando dados...</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>

        {/* Modal de confirmação mobile-friendly */}
        {tempBooking && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-end sm:items-center justify-center p-4">
            <div className="glass-card p-8 sm:p-12 rounded-t-[2.5rem] sm:rounded-[3rem] max-w-lg w-full text-center border-[#ff007a]/30 animate-in slide-in-from-bottom duration-500">
               <Sparkles className="w-10 h-10 text-[#ff007a] mx-auto mb-6 glow-magenta" />
               <h4 className="text-2xl font-display font-bold mb-6 text-white">Venda Detectada</h4>
               <div className="space-y-3 mb-8 text-left bg-black/40 p-6 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/70 tracking-wide"><b className="text-[#ff007a] uppercase text-[8px] block mb-1">Cliente</b> {tempBooking.clientName}</p>
                  <p className="text-xs text-white/70 tracking-wide"><b className="text-[#ff007a] uppercase text-[8px] block mb-1">Serviço</b> {tempBooking.serviceName}</p>
                  <p className="text-xs text-white/70 tracking-wide"><b className="text-[#ff007a] uppercase text-[8px] block mb-1">Horário</b> {tempBooking.date} às {tempBooking.time}</p>
               </div>
               <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button onClick={() => setTempBooking(null)} className="py-4 rounded-xl font-bold text-white/40 active:text-white order-2 sm:order-1">Cancelar</button>
                  <button onClick={confirmBooking} className="flex-1 btn-magenta text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl order-1 sm:order-2">Confirmar Venda</button>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 mobile-nav-glass flex items-center justify-around px-4 lg:hidden z-[60] pb-env(safe-area-inset-bottom)">
        <MobileNavItem icon={<LayoutDashboard />} label="Painel" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <MobileNavItem icon={<Calendar />} label="Agenda" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
        <MobileNavItem icon={<Target />} label="Vendas" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
        <MobileNavItem icon={<Play />} label="Vídeo" active={(activeView as any) === 'video_presentation'} onClick={() => setActiveView('video_presentation')} />
      </nav>
    </div>
  );
}
