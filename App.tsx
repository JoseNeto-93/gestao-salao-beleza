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
  Bell,
  Layers,
  Target,
  Crown,
  Play,
  X,
  MousePointer2,
  ArrowUpRight,
  UserCircle2,
  Gem
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Appointment, View, SalonConfig } from './types';
import { INITIAL_SERVICES } from './constants';
import { extractAppointmentFromText, suggestSalonBranding } from './services/geminiService';

const MetricCard = ({ title, value, trend, icon, delay = "0" }: any) => (
  <div 
    className="glass-card p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] relative overflow-hidden group transition-all duration-500 animate-in fade-in slide-in-from-bottom"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
      {React.cloneElement(icon, { size: 48 })}
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#ff007a] border border-white/10 group-hover:scale-110 transition-transform">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        {trend && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-[#ff007a]/10 border border-[#ff007a]/20 rounded-full">
            <TrendingUp size={8} className="text-[#ff007a]" />
            <span className="text-[9px] font-bold text-[#ff007a]">{trend}</span>
          </div>
        )}
      </div>
      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/40 mb-1">{title}</p>
      <h3 className="text-xl sm:text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-400 group ${
      active 
        ? 'bg-gradient-to-r from-[#ff007a] to-[#7000ff] text-white shadow-lg shadow-[#ff007a]/20 border border-white/10' 
        : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-[#ff007a]/60 group-hover:text-[#ff007a]'} transition-colors`}>
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {active && <ArrowUpRight size={14} className="ml-auto opacity-50" />}
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 transition-all ${
      active ? 'text-[#ff007a]' : 'text-white/30'
    }`}
  >
    <div className={`p-1.5 sm:p-2 rounded-xl transition-all ${active ? 'bg-[#ff007a]/10 shadow-[0_0_15px_rgba(255,0,122,0.2)]' : ''}`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[7px] sm:text-[8px] font-black mt-1 uppercase tracking-widest">{label}</span>
  </button>
);

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
        return prev + 0.8;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [scene]);

  const renderScene = () => {
    const commonStyles = "flex flex-col items-center justify-center h-full px-6 sm:px-10 text-center animate-in fade-in duration-1000";
    switch(scene) {
      case 1: return (
        <div className={commonStyles}>
          <div className="relative mb-8 sm:mb-12 animate-subtle-float">
            <MessageCircle className="w-20 h-20 sm:w-28 sm:h-28 text-white/10" />
            <div className="absolute top-0 right-0 bg-[#ff007a] p-2 sm:p-3 rounded-full shadow-xl">
              <AlertTriangle size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
          <h3 className="text-3xl sm:text-5xl font-display font-black text-white mb-4 sm:mb-6 leading-[1.1]">Agendas de papel são <span className="text-red-500 italic underline decoration-wavy">passado.</span></h3>
          <p className="text-white/40 text-base sm:text-lg font-medium">Você está deixando dinheiro na mesa todos os dias.</p>
        </div>
      );
      case 2: return (
        <div className={commonStyles}>
          <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-[#ff007a] to-[#7000ff] rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mb-8 sm:mb-12 shadow-2xl glow-soft border border-white/20 rotate-6">
            <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="currentColor" />
          </div>
          <h3 className="text-3xl sm:text-5xl font-display font-black text-white mb-4 sm:mb-6 leading-tight">O futuro do seu salão <br/> é <span className="luxury-gradient-text italic">Inteligente.</span></h3>
          <p className="text-white/50 text-lg sm:text-xl font-medium">BellaFlow: Gestão de elite com IA oficial.</p>
        </div>
      );
      case 3: return (
        <div className={commonStyles}>
          <div className="w-full max-w-sm glass-card p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] mb-8 sm:mb-12 border-[#ff007a]/30">
            <div className="flex items-center space-x-4 mb-4 sm:mb-6">
               <div className="w-8 h-8 rounded-full bg-[#ff007a]/20 animate-pulse"></div>
               <div className="h-3 w-24 bg-white/10 rounded-full"></div>
            </div>
            <div className="space-y-2">
               <div className="h-2 w-full bg-white/5 rounded-full"></div>
               <div className="h-2 w-4/5 bg-white/5 rounded-full"></div>
            </div>
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
               <div className="flex items-center text-[#ff007a] font-black text-[9px] tracking-[0.3em] uppercase">
                  <Sparkles size={12} className="mr-2" /> Venda Detectada
               </div>
            </div>
          </div>
          <h3 className="text-3xl sm:text-4xl font-display font-black text-white mb-4 sm:mb-6 leading-tight">Extração Automática <br/> via WhatsApp</h3>
          <p className="text-white/40 text-base sm:text-lg">A IA lê, entende e organiza seus lucros.</p>
        </div>
      );
      case 4: return (
        <div className={commonStyles}>
          <div className="relative mb-8 sm:mb-12">
            <div className="w-48 sm:w-56 h-[300px] sm:h-[400px] border-[4px] sm:border-[6px] border-white/10 rounded-[2.5rem] sm:rounded-[3.5rem] p-4 sm:p-6 bg-black/40 backdrop-blur-2xl shadow-2xl">
               <div className="w-16 sm:w-24 h-1 bg-white/10 rounded-full mx-auto mb-6 sm:mb-10"></div>
               <div className="space-y-3 sm:space-y-4">
                  <div className="h-16 sm:h-24 w-full bg-[#ff007a]/5 rounded-[1.5rem] sm:rounded-3xl border border-white/5"></div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                     <div className="h-14 sm:h-20 bg-white/5 rounded-xl sm:rounded-2xl"></div>
                     <div className="h-14 sm:h-20 bg-white/5 rounded-xl sm:rounded-2xl"></div>
                  </div>
               </div>
            </div>
          </div>
          <h3 className="text-3xl sm:text-5xl font-display font-black text-white mb-4 sm:mb-6">Mobile First. <br/><span className="text-[#ff007a]">Elite Only.</span></h3>
          <p className="text-white/40 text-base sm:text-lg">Gerencie tudo na palma da mão.</p>
        </div>
      );
      case 5: return (
        <div className={commonStyles}>
          <Crown className="w-16 h-16 sm:w-24 sm:h-24 text-[#ff007a] mb-8 sm:mb-10 glow-soft animate-bounce" />
          <h3 className="text-4xl sm:text-6xl font-display font-black text-white mb-8 sm:mb-10 leading-[1.1]">Sua nova era <br/> começa hoje.</h3>
          <button 
            onClick={onFinish}
            className="btn-premium text-white px-8 sm:px-14 py-4 sm:py-6 rounded-2xl font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs shadow-2xl"
          >
            Ativar Licença VIP
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#05010d] flex flex-col items-center justify-center overflow-hidden">
      <button onClick={onClose} className="absolute top-6 sm:top-10 right-6 sm:right-10 p-3 sm:p-4 bg-white/5 rounded-full text-white/40 hover:text-white transition-all z-[210] border border-white/10">
        <X size={24} />
      </button>

      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div className="h-full bg-gradient-to-r from-[#ff007a] to-[#7000ff] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="relative z-[205] w-full h-full max-w-xl">
        {renderScene()}
      </div>

      <div className="absolute bottom-10 sm:bottom-16 flex space-x-3 sm:space-x-4">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`h-1 rounded-full transition-all duration-700 ${s === scene ? 'w-10 sm:w-12 bg-[#ff007a]' : 'w-2 sm:w-3 bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [salon, setSalon] = useState<SalonConfig>(() => {
    const saved = localStorage.getItem('bellaflow_pro_v4');
    return saved ? JSON.parse(saved) : { name: '', setupComplete: false, niche: 'Beauty' };
  });

  const [backendUrl, setBackendUrl] = useState(() => {
    // Priority: Saved storage > Environment variable shim > Localhost
    return localStorage.getItem('bellaflow_backend_url') || (window as any).CONFIG_BACKEND_URL || 'http://localhost:3000';
  });

  const [activeView, setActiveView] = useState<View>(() => {
    if (!salon.setupComplete) return 'onboarding';
    return 'dashboard';
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bellaflow_appointments_v4');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [connStatus, setConnStatus] = useState('OFFLINE');
  const [tempBooking, setTempBooking] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('bellaflow_pro_v4', JSON.stringify(salon));
    localStorage.setItem('bellaflow_appointments_v4', JSON.stringify(appointments));
    localStorage.setItem('bellaflow_backend_url', backendUrl);
  }, [salon, appointments, backendUrl]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${backendUrl}/status`);
        const data = await res.json();
        setConnStatus(data.status);
      } catch (e) {
        setConnStatus('OFFLINE');
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 8000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const totalRevenue = useMemo(() => appointments.reduce((sum, a) => sum + a.price, 0), [appointments]);
  
  const revenueChartData = useMemo(() => {
    if (appointments.length === 0) return [{ date: '00:00', valor: 0 }];
    return appointments.slice(-10).map((a) => ({
      date: a.time,
      valor: a.price
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
      alert("Houve um erro na análise de IA.");
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

  if (activeView === 'video_presentation') {
    return <VideoPresentation onClose={() => setActiveView('dashboard')} onFinish={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'onboarding') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[30rem] sm:w-[50rem] h-[30rem] sm:h-[50rem] bg-[#ff007a]/20 rounded-full blur-[100px] sm:blur-[180px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] sm:w-[50rem] h-[30rem] sm:h-[50rem] bg-[#7000ff]/20 rounded-full blur-[100px] sm:blur-[180px]"></div>
        </div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-20">
          <div className="space-y-6 sm:space-y-10 text-center lg:text-left">
             <div className="inline-flex items-center space-x-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full text-white/80">
                <Crown size={12} className="text-[#ff007a]" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">SaaS Management Premium</span>
             </div>
             <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black text-white leading-[1] tracking-tighter">
                A Elite da <br/> <span className="luxury-gradient-text italic">Gestão.</span>
             </h1>
             <p className="text-white/50 text-base sm:text-xl lg:text-2xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Transforme seu salão em uma máquina de lucro com extração automática via WhatsApp.
             </p>
             
             <button 
                onClick={() => setActiveView('video_presentation')}
                className="flex items-center space-x-4 sm:space-x-6 glass-card px-6 py-4 sm:px-10 sm:py-6 rounded-2xl sm:rounded-3xl border border-[#ff007a]/30 hover:bg-[#ff007a]/5 transition-all active:scale-95 group mx-auto lg:mx-0"
             >
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#ff007a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                  <Play className="text-white ml-0.5" fill="currentColor" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#ff007a] mb-0.5">Assista agora</p>
                  <p className="text-sm sm:text-lg font-bold text-white">Como escalar seu salão</p>
                </div>
             </button>
          </div>

          <div className="glass-card p-8 sm:p-20 rounded-[2.5rem] sm:rounded-[4rem] text-center border-t border-white/20 animate-in slide-in-from-bottom lg:slide-in-from-right duration-1000">
             <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#ff007a] to-[#7000ff] rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-10 shadow-2xl glow-soft animate-subtle-float">
                <Scissors className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
             </div>
             <h2 className="text-2xl sm:text-4xl font-display font-bold text-white mb-6 sm:mb-8">Inicie sua Jornada</h2>
             <div className="space-y-4 sm:space-y-6 max-w-md mx-auto">
                <input 
                  type="text" 
                  id="salonInput"
                  placeholder="Nome do seu Espaço Luxo"
                  className="w-full bg-black/40 border border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-medium text-white placeholder:text-white/20 text-center focus:border-[#ff007a]/40 transition-all outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleOnboarding(e.currentTarget.value)}
                />
                <button 
                  onClick={() => handleOnboarding((document.getElementById('salonInput') as HTMLInputElement).value)}
                  className="w-full btn-premium text-white py-4 sm:py-6 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] flex items-center justify-center space-x-3"
                >
                   {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <><span>Entrar no Painel</span> <ChevronRight size={16} /></>}
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden relative">
      <aside className="w-80 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col p-8 hidden lg:flex z-50">
        <div className="flex items-center space-x-4 mb-16 px-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#ff007a] to-[#7000ff] rounded-2xl flex items-center justify-center text-white shadow-xl glow-soft">
            <Layers size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-display font-bold text-white tracking-tight leading-none mb-1">{salon.name}</h1>
            <span className="text-[10px] font-black text-[#ff007a] uppercase tracking-widest">Premium Partner</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-4">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={<Calendar />} label="Agenda de Elite" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <SidebarItem icon={<Target />} label="Extrator IA" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
          <SidebarItem icon={<Smartphone />} label="Conexão Cloud" active={activeView === 'connection'} onClick={() => setActiveView('connection')} />
        </nav>

        <div className="mt-auto pt-10">
           <div className={`p-6 rounded-[2rem] border transition-all ${connStatus === 'CONNECTED' ? 'bg-[#ff007a]/5 border-[#ff007a]/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center justify-between mb-2">
                 <span className={`text-[9px] font-black uppercase tracking-widest ${connStatus === 'CONNECTED' ? 'text-[#ff007a]' : 'text-red-500'}`}>Cloud Instance</span>
                 <div className={`w-2 h-2 rounded-full ${connStatus === 'CONNECTED' ? 'bg-[#ff007a] shadow-[0_0_10px_#ff007a]' : 'bg-red-500'}`}></div>
              </div>
              <p className="text-white font-bold text-xs">{connStatus === 'CONNECTED' ? 'Sincronizado' : 'Offline'}</p>
           </div>
           <p className="mt-4 text-center text-[8px] text-white/20 font-bold uppercase tracking-widest">desenvolvido por DN3J</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto pb-32 lg:pb-0 z-40 bg-black/20 pb-safe">
        <header className="h-20 lg:h-28 bg-black/30 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-6 lg:px-16 sticky top-0 z-[60]">
          <div className="max-w-[60%]">
            <h2 className="text-xl lg:text-4xl font-display font-bold text-white tracking-tight capitalize truncate">{activeView === 'dashboard' ? 'Overview' : activeView}</h2>
            <div className="flex items-center space-x-2 mt-0.5">
               <UserCircle2 size={10} className="text-[#ff007a]" />
               <span className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] truncate">{salon.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
             <div className="hidden sm:block text-right">
                <p className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">Receita Mensal</p>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tighter luxury-gradient-text">R$ {totalRevenue.toLocaleString()}</p>
             </div>
             <button className="w-10 h-10 sm:w-12 sm:h-12 glass-card rounded-xl sm:rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#ff007a] rounded-full border border-[#05010d]"></span>
             </button>
          </div>
        </header>

        <div className="p-4 sm:p-8 lg:p-16 max-w-7xl mx-auto w-full space-y-8 sm:space-y-16">
          {activeView === 'dashboard' && (
            <div className="space-y-8 sm:space-y-16 animate-in fade-in duration-700">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard title="Total Faturado" value={`R$ ${totalRevenue}`} trend="+18%" icon={<DollarSign />} delay="0" />
                <MetricCard title="Agendados" value={appointments.length.toString()} trend="+4" icon={<Calendar />} delay="100" />
                <MetricCard title="IA Performance" value="99%" icon={<Zap />} delay="200" />
                <MetricCard title="Membro" value="VIP" icon={<Gem />} delay="300" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                 <div className="lg:col-span-2 glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] h-[300px] sm:h-[500px]">
                    <div className="flex justify-between items-center mb-6 sm:mb-10">
                       <h4 className="font-black text-white/40 uppercase tracking-[0.3em] text-[9px] sm:text-[10px]">Fluxo de Caixa IA</h4>
                       <TrendingUp className="text-[#ff007a]" size={18} />
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff007a" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#ff007a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={8} axisLine={false} tickLine={false} />
                        <Tooltip 
                           contentStyle={{backgroundColor: '#05010d', border: '1px solid rgba(255,0,122,0.3)', borderRadius: '15px', backdropFilter: 'blur(10px)', fontSize: '10px'}}
                           itemStyle={{color: '#ff007a', fontWeight: 'bold'}}
                        />
                        <Area type="monotone" dataKey="valor" stroke="#ff007a" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="glass-card p-8 sm:p-10 rounded-[2rem] sm:rounded-[3rem] flex flex-col justify-center items-center text-center space-y-6 sm:space-y-8 bg-gradient-to-br from-white/[0.05] to-transparent">
                    <Sparkles className="text-[#ff007a] w-10 h-10 sm:w-14 sm:h-14 glow-soft" />
                    <h5 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">Mestria nos <br/>Detalhes.</h5>
                    <p className="text-white/40 text-xs sm:text-sm leading-relaxed max-w-[200px]">"Sua marca não é o que você vende, mas como você gerencia a experiência."</p>
                    <button 
                      onClick={() => setActiveView('video_presentation')}
                      className="text-[#ff007a] text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center space-x-2 group"
                    >
                      <Play size={10} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                      <span>Ver Masterclass</span>
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeView === 'connection' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
               <div className="glass-card rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 text-center space-y-8 sm:space-y-12 border-t border-white/20">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-[#ff007a] to-[#7000ff] rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl glow-soft">
                     <Smartphone size={28} className="text-white sm:w-10 sm:h-10" />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-2xl sm:text-4xl font-display font-bold text-white">Cloud Integration</h3>
                    <p className="text-white/40 text-sm sm:text-lg">Conecte sua conta oficial Meta e ative a IA extratora.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 text-left">
                     <div className="bg-black/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 space-y-3 sm:space-y-4">
                        <label className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] sm:tracking-[0.4em]">Webhook Endpoint</label>
                        <div className="flex items-center space-x-3 sm:space-x-4 bg-black/60 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#ff007a]/20">
                           <code className="flex-1 text-[#ff007a] font-mono text-xs sm:text-sm truncate">{backendUrl}/webhook</code>
                           <button className="text-white/40 hover:text-[#ff007a] transition-colors"><ChevronRight size={16} /></button>
                        </div>
                     </div>
                  </div>
                  <div className={`p-6 sm:p-8 rounded-[1.5rem] sm:rounded-3xl border-2 flex items-center justify-center space-x-4 sm:space-x-6 ${connStatus === 'CONNECTED' ? 'border-[#ff007a]/30 bg-[#ff007a]/5' : 'border-white/10 bg-white/5'}`}>
                     <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${connStatus === 'CONNECTED' ? 'bg-[#ff007a] shadow-xl' : 'bg-white/10'}`}>
                        {connStatus === 'CONNECTED' ? <CheckCircle2 size={18} className="text-white sm:w-6 sm:h-6" /> : <Loader2 size={18} className="text-white sm:w-6 sm:h-6 animate-spin" />}
                     </div>
                     <div className="text-left">
                        <h4 className="font-bold text-lg sm:text-xl text-white">{connStatus === 'CONNECTED' ? 'Instance Online' : 'Aguardando Link...'}</h4>
                        <p className="text-white/40 text-[9px] sm:text-xs font-black uppercase tracking-widest">v4.0.0 Global Node</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeView === 'whatsapp' && (
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-700">
               <div className="glass-card p-8 sm:p-12 lg:p-20 rounded-[2rem] sm:rounded-[4rem] border-t border-white/20">
                  <div className="flex items-center space-x-4 mb-6 sm:mb-10">
                     <Zap size={24} className="text-[#ff007a] sm:w-8 sm:h-8 glow-soft" fill="currentColor" />
                     <h4 className="text-2xl sm:text-4xl font-display font-bold text-white">Neural Extractor</h4>
                  </div>
                  <textarea 
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Cole aqui o fluxo de mensagens do seu WhatsApp..."
                    className="w-full bg-black/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 text-base sm:text-xl h-60 sm:h-80 outline-none focus:border-[#ff007a]/40 transition-all text-white placeholder:text-white/10 backdrop-blur-3xl"
                  />
                  <button 
                    onClick={() => processMessage(waMessage)}
                    disabled={isProcessing}
                    className="mt-6 sm:mt-10 w-full btn-premium py-5 sm:py-7 rounded-2xl sm:rounded-3xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] shadow-2xl flex items-center justify-center space-x-3 sm:space-x-4"
                  >
                    {isProcessing ? <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6" /> : <><span>Analisar com IA</span> <Sparkles size={16} className="sm:w-5 sm:h-5" /></>}
                  </button>
               </div>
            </div>
          )}

          {activeView === 'appointments' && (
            <div className="glass-card rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden border border-white/5 animate-in slide-in-from-bottom duration-700">
               <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-white/5 text-white/40">
                       <tr>
                          <th className="px-6 sm:px-10 py-6 sm:py-8 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[8px] sm:text-[10px] font-black">Cliente Premium</th>
                          <th className="px-6 sm:px-10 py-6 sm:py-8 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[8px] sm:text-[10px] font-black">Procedimento</th>
                          <th className="px-6 sm:px-10 py-6 sm:py-8 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[8px] sm:text-[10px] font-black text-right">Valor</th>
                          <th className="px-6 sm:px-10 py-6 sm:py-8 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[8px] sm:text-[10px] font-black text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                       {appointments.length > 0 ? appointments.map((app, idx) => (
                          <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-6 sm:px-10 py-6 sm:py-8">
                                <div className="flex items-center space-x-4 sm:space-x-5">
                                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#ff007a] to-[#7000ff] flex items-center justify-center text-base sm:text-lg font-black text-white border border-white/20 group-hover:scale-110 transition-transform">
                                      {app.clientName.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="font-bold text-white text-base sm:text-lg">{app.clientName}</p>
                                      <p className="text-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{app.time} • {app.date}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 sm:px-10 py-6 sm:py-8">
                                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-full text-white/60 text-[10px] sm:text-xs font-bold border border-white/5">{app.serviceName}</span>
                             </td>
                             <td className="px-6 sm:px-10 py-6 sm:py-8 text-right">
                                <span className="text-lg sm:text-xl font-bold text-[#ff007a]">R$ {app.price}</span>
                             </td>
                             <td className="px-6 sm:px-10 py-6 sm:py-8">
                                <div className="flex justify-center">
                                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ff007a]/10 flex items-center justify-center text-[#ff007a]">
                                      <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                   </div>
                                </div>
                             </td>
                          </tr>
                       )) : (
                         <tr>
                           <td colSpan={4} className="px-6 sm:px-10 py-20 sm:py-32 text-center">
                              <div className="flex flex-col items-center space-y-4 opacity-20">
                                 <Calendar size={40} className="sm:w-12 sm:h-12" />
                                 <p className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Nenhum registro encontrado</p>
                              </div>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>

        {tempBooking && (
          <div className="fixed inset-0 z-[100] bg-[#05010d]/95 backdrop-blur-3xl flex items-end sm:items-center justify-center p-4 sm:p-6">
            <div className="glass-card p-8 sm:p-12 lg:p-16 rounded-[2.5rem] sm:rounded-[4rem] max-w-2xl w-full text-center border-[#ff007a]/40 animate-in zoom-in duration-500 shadow-[0_0_100px_rgba(255,0,122,0.2)]">
               <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ff007a] rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-10 shadow-2xl glow-soft">
                  <Sparkles size={28} className="text-white sm:w-8 sm:h-8" />
               </div>
               <h4 className="text-2xl sm:text-4xl font-display font-bold mb-6 sm:mb-10 text-white leading-tight">Sugestão de <br/>Agendamento</h4>
               
               <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-8 sm:mb-12 text-left bg-black/40 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
                     <span className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Cliente</span>
                     <span className="font-bold text-white text-base sm:text-lg">{tempBooking.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
                     <span className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Procedimento</span>
                     <span className="font-bold text-[#ff007a] text-base sm:text-lg">{tempBooking.serviceName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Horário</span>
                     <span className="font-bold text-white text-base sm:text-lg">{tempBooking.date} às {tempBooking.time}</span>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
                  <button onClick={() => setTempBooking(null)} className="flex-1 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px]">Descartar</button>
                  <button onClick={confirmBooking} className="flex-[2] btn-premium text-white py-4 sm:py-6 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] shadow-2xl">Confirmar Venda</button>
               </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 sm:h-24 bg-black/60 backdrop-blur-3xl flex items-center justify-around px-4 sm:px-6 lg:hidden z-[100] border-t border-white/5 pb-safe">
        <MobileNavItem icon={<LayoutDashboard />} label="Início" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <MobileNavItem icon={<Calendar />} label="Agenda" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
        <MobileNavItem icon={<Target />} label="IA" active={activeView === 'whatsapp'} onClick={() => setActiveView('whatsapp')} />
        <MobileNavItem icon={<Play />} label="Vídeo" active={(activeView as string) === 'video_presentation'} onClick={() => setActiveView('video_presentation')} />
      </nav>

      {/* Dn3j Discreet Footer */}
      <footer className="fixed bottom-1 right-2 text-[6px] text-white/5 uppercase tracking-widest pointer-events-none hidden lg:block">
        Proudly crafted by Dn3j
      </footer>
    </div>
  );
}