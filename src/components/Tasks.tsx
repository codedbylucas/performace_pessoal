import { useState } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../db';
import { Card, Button } from './UI';

export default function Tasks({ log, tasks }: any) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState(15);

  const handleAddTask = async () => {
    if (!title.trim()) return;
    const date = format(new Date(), 'yyyy-MM-dd');

    await db.tasks.add({
      date,
      title,
      priority,
      status: 'pending',
      duration_est: duration
    });

    const currentLog = await db.dailyLogs.where('date').equals(date).first();
    if (currentLog) {
      await db.dailyLogs.update(currentLog.id!, {
        tasks_total: currentLog.tasks_total + 1
      });
    }

    setTitle('');
  };

  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await db.tasks.update(task.id, { status: newStatus });

    const date = format(new Date(), 'yyyy-MM-dd');
    const currentLog = await db.dailyLogs.where('date').equals(date).first();
    if (currentLog) {
      await db.dailyLogs.update(currentLog.id!, {
        tasks_completed: currentLog.tasks_completed + (newStatus === 'completed' ? 1 : -1)
      });
    }
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-500',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-rose-100 text-rose-600'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tarefas</h2>

      <Card className="space-y-4">
        <input 
          type="text" 
          placeholder="O que precisa ser feito?" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-black/5 text-slate-900"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Prioridade</span>
            <select 
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-black/5 font-bold text-slate-900"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tempo (min)</span>
            <input 
              type="number" 
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-black/5 font-bold text-slate-900"
            />
          </div>
        </div>

        <Button onClick={handleAddTask} className="w-full bg-blue-500 shadow-blue-200">
          Adicionar Tarefa
        </Button>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Checklist de Hoje</h3>
        {tasks?.map((t: any) => (
          <Card 
            key={t.id} 
            onClick={() => toggleTask(t)}
            className={`flex items-center gap-4 py-4 cursor-pointer transition-all ${t.status === 'completed' ? 'opacity-50' : ''}`}
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${t.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
              {t.status === 'completed' && <CheckSquare className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <p className={`font-bold ${t.status === 'completed' ? 'line-through' : ''}`}>{t.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColors[t.priority as keyof typeof priorityColors]}`}>
                  {t.priority === 'low' ? 'Baixa' : t.priority === 'medium' ? 'Média' : 'Alta'}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.duration_est}min
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
