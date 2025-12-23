
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
  Code2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Appointment, Service, View, IncomingMessage } from './types';
import { INITIAL_SERVICES, MOCK_REVENUE } from './constants';
import { extractAppointmentFromText } from './services/geminiService';

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
        <div className="flex flex-col items-end">
          <span className="text-emerald-700 text-xs font-black flex items-center bg-emerald-100/40 px-2 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <TrendingUp className="w-3 h-3 mr-1" /> {trend}
          </span>
        </div>
      </div>
      <h3 className="text-slate-700 text-xs font-bold uppercase tracking-widest">{title}</h3>
      <p className="text-3xl font-display font-bold text-slate-900 mt-2">{value}</p>
    </div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [isProcessingMsg, setIsProcessingMsg] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [showBookingConfirm, setShowBookingConfirm] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState<IncomingMessage[]>([]);
  const [notifications, setNotifications] = useState<IncomingMessage[]>([]);

  useEffect(() => {
    const mockApps: Appointment[] = [
      { id: '1', clientName: 'Ana Silva', serviceId: '1', serviceName: 'Corte Feminino', date: '2024-05-15', time: '14:00', status: 'Confirmado', price: 120 },
      { id: '2', clientName: 'Beatriz Costa', serviceId: '4', serviceName: 'Manicure & Pedicure', date: '2024-05-15', time: '15:30', status: 'Confirmado', price: 70 },
      { id: '3', clientName: 'Carla Souza', serviceId: '3', serviceName: 'Mechas/Luzes', date: '2024-05-15', time: '09:00', status: 'Concluído', price: 450 },
    ];
    setAppointments(mockApps);
  }, []);

  useEffect(() => {
    if (isConnected && isSyncing) {
      const interval = setInterval(async () => {
        if (Math.random() > 0.8) {
          const mockClients = ['Mariana Oliveira', 'Juliana Lins', 'Fernanda Santos'];
          const mockTexts = [
            "Oi Rose, queria marcar um corte pra sábado às 10h",
            "Olá! Tem horário para unha hoje à tarde?",
            "Rose, reserva pra mim uma selagem na terça que vem as 14h?"
          ];
          const randomIndex = Math.floor(Math.random() * mockTexts.length);
          const newMsg: IncomingMessage = {
            id: Date.now().toString(),
            sender: mockClients[randomIndex].split(' ')[0],
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
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isConnected, isSyncing]);

  const totalRevenue = useMemo(() => appointments.reduce((sum, app) => sum + app.price, 0), [appointments]);

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
      status: 'Pendente',
      price: matchedService.price
    };
    setAppointments(prev => [newApp, ...prev]);
    setShowBookingConfirm(null);
    setNotifications(prev => prev.filter(n => n.detectedBooking !== bookingData));
    setActiveView('appointments');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Premium Notifications Overlay - Glass Style */}
      <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
        {notifications.map(notif => (
          <div key={notif.id} className="pointer-events-auto glass-card border-rose-200/50 shadow-2xl rounded-[2rem] p-6 w-80 flex items-center space-x-4 animate-in slide-in-from-right-10">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/30">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-rose-600 uppercase tracking-widest">IA Detection</p>
              <p className="text-sm font-bold text-slate-900 truncate">{notif.sender}: {notif.detectedBooking?.serviceName}</p>
            </div>
            <button 
              onClick={() => confirmBooking(notif.detectedBooking)}
              className="p-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar Dark Luxury */}
      <aside className="w-80 sidebar-dark flex flex-col p-8 hidden lg:flex border-r border-white/10">
        <div className="flex items-center space-x-3 mb-16 px-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-rose-500 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/40">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">BellaFlow</h1>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarItem icon={<Calendar />} label="Agendamentos" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <SidebarItem icon={<MessageCircle />} label="WhatsApp AI" active={activeView === 'whatsapp' || activeView === 'connection'} onClick={() => setActiveView('whatsapp')} />
          <SidebarItem icon={<BarChart3 />} label="Faturamento" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Link</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'}`}></div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">Rose IA analisando em tempo real.</p>
            <button 
              onClick={() => setActiveView('connection')}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-3 rounded-xl transition-all border border-rose-500/20"
            >
              Conexão
            </button>
          </div>
          
          <div className="flex items-center space-x-4 px-2">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">R</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Rose Boutique</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Admin</p>
            </div>
            <Settings className="w-4 h-4 text-slate-600 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-transparent relative">
        <header className="h-24 bg-white/20 backdrop-blur-2xl border-b border-white/30 flex items-center justify-between px-12 sticky top-0 z-50">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900 capitalize tracking-tight">{activeView}</h2>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-rose-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="pl-12 pr-6 py-3 bg-white/30 rounded-2xl text-sm border border-white/20 focus:bg-white/60 focus:border-rose-400/30 focus:ring-4 focus:ring-rose-500/10 w-64 transition-all outline-none"
              />
            </div>
            <button className="relative p-3 bg-white/30 rounded-2xl text-slate-600 hover:text-rose-600 transition-all border border-white/20 shadow-sm">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-12 pb-24">
          {activeView === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-4xl font-display font-bold text-slate-900">Salão em Foco</h3>
                  <p className="text-slate-800 font-medium mt-2 text-lg">Visão imersiva da sua operação de luxo.</p>
                </div>
                <button 
                  onClick={() => setActiveView('whatsapp')}
                  className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-bold flex items-center space-x-3 shadow-2xl transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Atendimento</span>
                </button>
              </div>

              {/* Metrics with prominent glass effect */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard title="Faturamento Total" value={`R$ ${totalRevenue.toLocaleString()}`} trend="+14.2%" icon={<DollarSign className="w-6 h-6" />} />
                <MetricCard title="Agendamentos" value={appointments.length.toString()} trend="+5.4%" icon={<Calendar className="w-6 h-6" />} />
                <MetricCard title="Clientes Ativos" value="242" trend="+12.8%" icon={<User className="w-6 h-6" />} />
                <MetricCard title="Precisão IA" value="99.2%" trend="+0.8%" icon={<Zap className="w-6 h-6" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 glass-card p-10 rounded-[3.5rem] luxury-shadow">
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Histórico de Receita</h3>
                      <p className="text-sm text-slate-600 mt-1 uppercase font-black tracking-widest">Performance da Semana</p>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_REVENUE}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 800}} dy={20} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 800}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '24px', border: 'none', padding: '16px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)'}}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-dark p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                   <h3 className="text-2xl font-display font-bold mb-10 relative z-10 tracking-tight">Serviços Star</h3>
                   <div className="space-y-8 relative z-10">
                      {topServices.map((service, idx) => (
                        <div key={idx} className="group cursor-pointer">
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors tracking-wide">{service.name}</span>
                            <span className="text-xs text-rose-300 font-black">{service.count}x</span>
                          </div>
                          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                              style={{ width: topServices[0].count > 0 ? `${(service.count / topServices[0].count) * 100}%` : '0%' }}
                            />
                          </div>
                        </div>
                      ))}
                   </div>
                   <div className="mt-16 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                      <p className="text-xs text-slate-300 leading-relaxed italic">"Corte e Hidratação estão gerando 60% da sua receita recorrente."</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'whatsapp' && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex justify-between items-center glass-card p-10 rounded-[3rem] border-white/50">
                  <div>
                    <h3 className="text-4xl font-display font-bold text-slate-900">IA de Atendimento</h3>
                    <p className="text-slate-800 font-medium mt-2">Extração automática de agendamentos via conversas.</p>
                  </div>
                  {!isConnected && (
                    <button 
                      onClick={() => setActiveView('connection')}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-5 rounded-2xl font-bold flex items-center space-x-3 shadow-xl"
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>Conectar Dispositivo</span>
                    </button>
                  )}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="glass-card p-10 rounded-[3rem] luxury-shadow">
                        <h4 className="text-xl font-display font-bold mb-8 flex items-center">
                           <MessageCircle className="w-6 h-6 mr-3 text-rose-500" />
                           Atividade Recente
                        </h4>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                           {incomingMessages.map(msg => (
                             <div key={msg.id} className="p-6 bg-white/40 rounded-3xl border border-white/50 hover:bg-white/70 transition-all cursor-pointer group" onClick={() => setWaMessage(msg.text)}>
                                <div className="flex justify-between mb-2">
                                   <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{msg.sender}</span>
                                   <span className="text-[10px] text-slate-600 font-bold">{msg.timestamp}</span>
                                </div>
                                <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed">{msg.text}</p>
                             </div>
                           ))}
                           {incomingMessages.length === 0 && (
                             <div className="py-20 text-center opacity-40">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest">Sem mensagens</p>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-3">
                     <div className="glass-dark rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                           <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
                              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Gemini AI Active</span>
                           </div>
                           <button onClick={() => setWaMessage('')} className="text-slate-500 hover:text-white transition-colors">
                             <RefreshCw className="w-5 h-5" />
                           </button>
                        </div>

                        <div className="flex-1 flex flex-col">
                           <textarea 
                             value={waMessage}
                             onChange={(e) => setWaMessage(e.target.value)}
                             placeholder="Aguardando texto da conversa..."
                             className="flex-1 bg-transparent border-none text-rose-100 placeholder:text-slate-800 text-3xl font-display outline-none resize-none leading-relaxed"
                           />
                           <div className="mt-8">
                              <button 
                                onClick={handleProcessMessage}
                                disabled={isProcessingMsg || !waMessage.trim()}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest py-7 rounded-[2rem] shadow-2xl transition-all disabled:opacity-20 flex items-center justify-center space-x-3"
                              >
                                {isProcessingMsg ? <RefreshCw className="w-6 h-6 animate-spin" /> : <span>Processar Intenção</span>}
                              </button>
                           </div>
                        </div>

                        {showBookingConfirm && (
                          <div className="absolute inset-0 glass-dark z-20 flex items-center justify-center p-12">
                             <div className="bg-white rounded-[3rem] w-full p-12 shadow-2xl animate-in zoom-in-95">
                                <div className="flex justify-between items-start mb-10">
                                   <div>
                                      <h4 className="text-3xl font-display font-bold text-slate-900">Validar Dados</h4>
                                      <p className="text-slate-500 text-sm mt-1 uppercase font-black tracking-widest">A IA identificou um agendamento</p>
                                   </div>
                                   <button onClick={() => setShowBookingConfirm(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                      <X className="w-7 h-7" />
                                   </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 mb-10">
                                   {[
                                     { label: 'Cliente', value: showBookingConfirm.clientName },
                                     { label: 'Serviço', value: showBookingConfirm.serviceName },
                                     { label: 'Data', value: showBookingConfirm.date },
                                     { label: 'Horário', value: showBookingConfirm.time }
                                   ].map((item, idx) => (
                                     <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className="text-lg font-bold text-slate-900">{item.value}</p>
                                     </div>
                                   ))}
                                </div>

                                <button 
                                  onClick={() => confirmBooking(showBookingConfirm)}
                                  className="w-full bg-rose-500 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl hover:bg-rose-600 transition-all"
                                >
                                  Confirmar Agora
                                </button>
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeView === 'connection' && (
            <div className="max-w-4xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
               <div className="glass-card rounded-[4rem] luxury-shadow overflow-hidden border-white/60">
                  <div className="bg-slate-900/90 p-16 text-white text-center">
                     <h3 className="text-6xl font-display font-bold">Link Biométrico</h3>
                     <p className="mt-4 text-slate-400 text-xl font-medium">Automação profunda com seu smartphone.</p>
                  </div>
                  
                  <div className="p-20 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12">
                       {!isConnected ? (
                         <div className="space-y-10">
                            <p className="text-slate-700 font-medium leading-relaxed">Escaneie o código ao lado para que a IA Bella comece a gerenciar suas mensagens instantaneamente.</p>
                            <button 
                             onClick={() => setIsConnected(true)}
                             className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-7 rounded-[2rem] hover:bg-black transition-all shadow-2xl"
                            >
                              Gerar QR Code
                            </button>
                         </div>
                       ) : (
                         <div className="text-center space-y-10">
                            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/30">
                               <CheckCircle2 className="w-14 h-14" />
                            </div>
                            <h4 className="text-4xl font-display font-bold text-slate-900">Conectado</h4>
                            <button 
                              onClick={() => setIsSyncing(!isSyncing)}
                              className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${isSyncing ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-200 text-slate-600'}`}
                            >
                              {isSyncing ? 'Análise Ativa' : 'Iniciar Monitoramento'}
                            </button>
                         </div>
                       )}
                    </div>
                    
                    <div className="flex flex-col items-center">
                       {!isConnected ? (
                         <div className="p-4 bg-slate-900/95 rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]">
                            <div className="bg-white p-10 rounded-[2.5rem]">
                               <QrCode className="w-56 h-56 text-slate-900" />
                            </div>
                         </div>
                       ) : (
                         <div className="w-full glass-dark rounded-[3rem] p-10 shadow-2xl border-t-8 border-rose-500 font-mono text-[11px] text-rose-100/60 leading-relaxed">
                            <p className="text-emerald-400">» [WA_DAEMON] SECURE_CONNECTION_STABLE</p>
                            <p>» [IO_PIPE] METADATA_SYNCING_72%</p>
                            <p className="mt-4 animate-pulse text-white font-bold">» [CORE] LISTENING_TO_PROTOCOLS...</p>
                         </div>
                       )}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {(activeView === 'appointments' || activeView === 'analytics') && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-10">
               <div className="w-32 h-32 glass-card rounded-[3rem] flex items-center justify-center text-rose-500 luxury-shadow">
                 <Calendar className="w-12 h-12" />
               </div>
               <div>
                 <h3 className="text-5xl font-display font-bold text-slate-900 tracking-tight">Elegância em Construção</h3>
                 <p className="text-slate-700 font-semibold mt-4 text-xl">Este módulo de luxo está sendo polido para sua melhor experiência.</p>
               </div>
               <button onClick={() => setActiveView('dashboard')} className="bg-white/40 border border-white/50 px-10 py-4 rounded-2xl text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-white/60 transition-all">Voltar ao Centro de Controle</button>
            </div>
          )}
        </div>

        {/* Footer Credit - Bottom Right */}
        <div className="fixed bottom-6 right-8 z-[60] animate-in fade-in slide-in-from-right-4 duration-1000">
           <div className="glass-card px-5 py-2.5 rounded-full flex items-center space-x-3 border-white/20 hover:scale-105 transition-transform cursor-default">
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
