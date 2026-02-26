import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card } from './UI';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function Reports({ user }: any) {
  const history = useLiveQuery(() => db.dailyLogs.orderBy('date').reverse().limit(30).toArray());

  const statusColors = {
    green: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    yellow: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]',
    red: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
  };

  // Generate last 30 days grid
  const today = new Date();
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  });

  const getLogForDate = (date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    return history?.find(h => h.date === dStr);
  };

  const failures = [
    { label: 'Proteína Baixa', count: history?.filter(h => h.protein_consumed < 120)?.length || 0, color: 'text-rose-500' },
    { label: 'Faltou Treino', count: history?.filter(h => h.training_completed === 0)?.length || 0, color: 'text-orange-500' },
    { label: 'Meta de Estudo', count: history?.filter(h => h.study_minutes < 30)?.length || 0, color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#E6EDF7]">Relatórios</h2>

      <Card className="bg-[#101826] border-[#223047]">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#98A2B3] mb-6">Consistência (30 dias)</h3>
        <div className="grid grid-cols-7 gap-2">
          {last30Days.map(date => {
            const log = getLogForDate(date);
            return (
              <div key={date.toISOString()} className="flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-md ${log ? statusColors[log.status as keyof typeof statusColors] : 'bg-[#1a2436] border border-[#223047]'}`} />
                <span className="text-[8px] font-bold text-[#98A2B3]">{format(date, 'dd')}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-[#101826] border-[#223047]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#98A2B3] mb-1">Média Score</p>
          <p className="text-3xl font-black text-emerald-500">
            {history?.length ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length) : 0}
          </p>
        </Card>
        <Card className="p-4 bg-[#101826] border-[#223047]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#98A2B3] mb-1">Dias Ativos</p>
          <p className="text-3xl font-black text-[#3B82F6]">{history?.length || 0}</p>
        </Card>
      </div>

      <Card className="space-y-4 bg-[#101826] border-[#223047]">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#98A2B3]">Principais Falhas</h3>
        <div className="space-y-3">
          {failures.map(f => (
            <div key={f.label} className="flex justify-between items-center">
              <span className="font-bold text-[#98A2B3]">{f.label}</span>
              <span className={`font-black ${f.color}`}>{f.count} dias</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
