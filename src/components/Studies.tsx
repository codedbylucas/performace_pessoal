import { useState } from 'react';
import { BookOpen, Timer, Star, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../db';
import { Card, Button } from './UI';

export default function Studies({ log, studies }: any) {
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState<'reading' | 'practice' | 'review'>('practice');
  const [evaluation, setEvaluation] = useState(5);

  const handleAddSession = async () => {
    if (!subject.trim()) return;
    const date = format(new Date(), 'yyyy-MM-dd');

    await db.studySessions.add({
      date,
      subject,
      type,
      duration,
      evaluation
    });

    const currentLog = await db.dailyLogs.where('date').equals(date).first();
    if (currentLog) {
      await db.dailyLogs.update(currentLog.id!, {
        study_minutes: currentLog.study_minutes + duration
      });
    }

    setSubject('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Estudos</h2>

      <Card className="space-y-4">
        <input 
          type="text" 
          placeholder="O que você estudou?" 
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-black/5 text-slate-900"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Duração (min)</span>
            <input 
              type="number" 
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-black/5 font-bold text-slate-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo</span>
            <select 
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-black/5 font-bold text-slate-900"
            >
              <option value="reading">Leitura</option>
              <option value="practice">Prática</option>
              <option value="review">Revisão</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Autoavaliação</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(v => (
              <button 
                key={v} 
                onClick={() => setEvaluation(v)}
                className={`flex-1 py-3 rounded-xl border-2 transition-all ${evaluation === v ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-black/5 text-slate-300'}`}
              >
                <Star className={`w-5 h-5 mx-auto ${evaluation >= v ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleAddSession} className="w-full bg-indigo-500 shadow-indigo-200">
          Registrar Sessão
        </Button>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Sessões de Hoje</h3>
        {studies?.map((s: any) => (
          <Card key={s.id} className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold">{s.subject}</p>
                <p className="text-xs text-slate-400">{s.duration}min • {s.type === 'reading' ? 'Leitura' : s.type === 'practice' ? 'Prática' : 'Revisão'}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: s.evaluation }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
