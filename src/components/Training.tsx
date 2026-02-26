import { useState } from 'react';
import { Dumbbell, Plus, Trophy, History } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../db';
import { Card, Button } from './UI';

export default function Training({ log, workouts }: any) {
  const [selectedMuscle, setSelectedMuscle] = useState('Peito');
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(20);
  const [isPr, setIsPr] = useState(false);

  const muscles = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];

  const handleAddWorkout = async () => {
    const date = format(new Date(), 'yyyy-MM-dd');
    
    // In a real app, we'd select from an exercise catalog
    // For MVP, we'll use the text name
    await db.workouts.add({
      date,
      exercise_id: 0, // Placeholder
      sets,
      reps,
      weight,
      is_pr: isPr
    } as any);

    // Update daily log
    const currentLog = await db.dailyLogs.where('date').equals(date).first();
    if (currentLog) {
      await db.dailyLogs.update(currentLog.id!, {
        training_completed: 1,
        training_volume: currentLog.training_volume + (sets * reps * weight)
      });
    }
    
    setExercise('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Treino</h2>

      <Card className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {muscles.map(m => (
            <button 
              key={m} 
              onClick={() => setSelectedMuscle(m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedMuscle === m ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-slate-400'}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Nome do exercício..." 
            value={exercise}
            onChange={e => setExercise(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-black/5"
            style={{ color: '#0f172a' }}
          />
          
          <div className="grid grid-cols-3 gap-3">
            <NumberInput label="Séries" value={sets} onChange={setSets} />
            <NumberInput label="Reps" value={reps} onChange={setReps} />
            <NumberInput label="Peso (kg)" value={weight} onChange={setWeight} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPr} onChange={e => setIsPr(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
            <span className="text-sm font-bold text-slate-600">Novo Recorde Pessoal (PR)?</span>
          </label>

          <Button onClick={handleAddWorkout} className="w-full flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Registrar Exercício
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Sessão de Hoje</h3>
        {workouts?.length === 0 && (
          <p className="text-center py-10 text-slate-400 italic">Nenhum exercício registrado hoje.</p>
        )}
        {workouts?.map((w: any, idx: number) => (
          <Card key={idx} className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold">Exercício #{idx + 1}</p>
                <p className="text-xs text-slate-400">{w.sets} x {w.reps} • {w.weight}kg</p>
              </div>
            </div>
            {w.is_pr && <Trophy className="w-5 h-5 text-amber-500" />}
          </Card>
        ))}
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</span>
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(Number(e.target.value))}
        className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-black/5 font-bold text-center text-slate-900"
      />
    </div>
  );
}
