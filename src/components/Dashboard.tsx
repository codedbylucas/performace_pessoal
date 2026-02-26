import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, Sparkles } from 'lucide-react';
import { Card, ProgressBar } from './UI';

export default function Dashboard({ log, user }: any) {
  const score = log?.score || 0;
  const status = log?.status || 'red';
  
  const coachMessages = useMemo(() => ([
    {
      immediateAction: "Beba 400ml de água agora e alongue por 2 minutos.",
      workoutSuggestion: "Faça 3 séries de flexões e agachamentos para ativar o corpo.",
      studyTip: "Use um temporizador de 25 minutos para concluir uma leitura rápida.",
      motivation: "Consistência vence intensidade."
    },
    {
      immediateAction: "Adicione 20g de proteína na próxima refeição (ex: 1 iogurte + 1 ovo).",
      workoutSuggestion: "Complete uma caminhada de 10 minutos pós-almoço.",
      studyTip: "Resuma em 3 tópicos o que aprendeu hoje.",
      motivation: "Pequenos ajustes, grandes resultados."
    },
    {
      immediateAction: "Faça 10 respirações profundas e organize sua lista de tarefas.",
      workoutSuggestion: "Tente 3 sprints de 20 segundos na próxima ida à academia.",
      studyTip: "Revise algo difícil do ontem por 10 minutos.",
      motivation: "Você controla o ritmo."
    },
    {
      immediateAction: "Inclua uma fruta agora para manter energia estável.",
      workoutSuggestion: "Inclua um exercício unilateral extra (ex: avanço).",
      studyTip: "Feche notificações por 30 minutos e ataque o foco.",
      motivation: "Movimento gera clareza."
    }
  ]), []);

  const coachTip = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = Number(today) - Number(start);
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    return coachMessages[day % coachMessages.length];
  }, [coachMessages]);

  const statusConfig = {
    green: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Ritmo sólido' },
    yellow: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Ainda dá pra virar' },
    red: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Modo mínimo. Salva o dia.' }
  };

  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.red;

  const stats = [
    { label: 'Nutrição', value: log?.calories_consumed || 0, max: user?.calories_goal || 2000, unit: 'kcal', color: 'bg-orange-500', weight: '40%' },
    { label: 'Treino', value: log?.training_completed ? 1 : 0, max: 1, unit: '', color: 'bg-emerald-500', weight: '25%' },
    { label: 'Estudos', value: log?.study_minutes || 0, max: user?.study_minutes_goal || 60, unit: 'min', color: 'bg-indigo-500', weight: '20%' },
    { label: 'Tarefas', value: log?.tasks_completed || 0, max: log?.tasks_total || 1, unit: '', color: 'bg-blue-500', weight: '15%' },
  ];

  return (
    <div className="space-y-6">
      {/* Score Circle */}
      <Card className="flex flex-col items-center justify-center py-12 relative overflow-hidden border-none bg-gradient-to-b from-[#161f30] to-[#101826]">
        <div className="absolute top-6 right-6">
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
            {currentStatus.label}
          </div>
        </div>
        
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${status === 'green' ? 'bg-emerald-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
          
          <svg className="w-full h-full transform -rotate-90 relative z-10">
            <circle cx="112" cy="112" r="100" stroke="#1a2436" strokeWidth="14" fill="transparent" />
            <motion.circle 
              cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="14" fill="transparent" 
              strokeDasharray={2 * Math.PI * 100}
              initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - score / 100) }}
              className={status === 'green' ? 'text-emerald-500' : status === 'yellow' ? 'text-amber-400' : 'text-rose-500'}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          
          <motion.div 
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute flex flex-col items-center z-20"
          >
            <span className="text-6xl font-black tracking-tighter text-[#E6EDF7] drop-shadow-2xl">{score}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#98A2B3]">Performance</span>
          </motion.div>
        </div>
      </Card>

      {/* Most Efficient Action Card */}
      <Card className="bg-[#3B82F6] border-none p-6 shadow-[0_20px_50px_rgba(59,130,246,0.3)] relative overflow-hidden group">
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-100" />
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-100">Ação mais eficiente agora</h3>
            </div>
            <p className="text-xl font-bold text-white leading-tight">
              {score < 50 ? "Registre um treino agora" : score < 80 ? "Bata sua meta de proteína" : "Complete suas tarefas pendentes"}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 text-center min-w-[70px]">
            <p className="text-xs font-bold text-blue-50 text-white/70 uppercase">Ganhe</p>
            <p className="text-xl font-black text-white">+{score < 50 ? "25" : score < 80 ? "15" : "10"}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      </Card>

      {/* Coach */}
      <Card className="bg-[#101826] border-[#223047] overflow-hidden relative p-6">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">COACH</h3>
            </div>
            <Sparkles className="w-4 h-4 text-emerald-500/50" />
          </div>

          <div className="space-y-4">
            <p className="text-lg font-medium leading-tight text-emerald-50 italic">"{coachTip.immediateAction}"</p>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Treino</p>
                <p className="text-[10px] text-slate-300 line-clamp-2">{coachTip.workoutSuggestion}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Dica</p>
                <p className="text-[10px] text-slate-300 line-clamp-2">{coachTip.studyTip}</p>
              </div>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">{coachTip.motivation}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
      </Card>

      {/* Domain Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
              <span className="text-[10px] font-bold text-slate-300">{stat.weight}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}{stat.unit}</p>
            <div className="mt-2">
              <ProgressBar value={stat.value} max={stat.max} color={stat.color} />
            </div>
          </Card>
        ))}
      </div>

      {/* Future Projection */}
      <Card className="p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Projeção 90 Dias</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">Estimativa</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-black text-emerald-600">+4.2kg</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Massa Muscular Est.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-600">85%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Aderência Prevista</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-3/4" />
          </div>
        </div>
      </Card>
    </div>
  );
}
