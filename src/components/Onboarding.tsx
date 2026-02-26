import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { db } from '../db';
import { Button } from './UI';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<{
    name: string;
    age: number;
    height: number;
    weight: number;
    goal: 'cut' | 'bulk' | 'maintain' | 'performance';
    level: 'beginner' | 'intermediate' | 'advanced';
    training_days_week: number;
    equipment: string;
    routine_daily: string;
    dietary_restrictions: string;
    study_goal_weekly: number;
    calories_goal: number;
    protein_goal: number;
    training_goal: number;
    study_minutes_goal: number;
    tasks_goal: number;
  }>({
    name: '',
    age: 25,
    height: 175,
    weight: 75,
    goal: 'maintain',
    level: 'intermediate',
    training_days_week: 4,
    equipment: 'Academia Completa',
    routine_daily: 'Sedentário',
    dietary_restrictions: 'Nenhuma',
    study_goal_weekly: 300,
    calories_goal: 2200,
    protein_goal: 150,
    training_goal: 4,
    study_minutes_goal: 60,
    tasks_goal: 5
  });

  const steps = [
    { title: "Qual seu nome?", field: "name", type: "text" },
    { title: "Qual seu objetivo?", field: "goal", type: "select", options: [
      { label: "Cutting (Perda)", value: "cut" },
      { label: "Bulking (Ganho)", value: "bulk" },
      { label: "Manutenção", value: "maintain" },
      { label: "Performance", value: "performance" }
    ]},
    { title: "Nível de experiência?", field: "level", type: "select", options: [
      { label: "Iniciante", value: "beginner" },
      { label: "Intermediário", value: "intermediate" },
      { label: "Avançado", value: "advanced" }
    ]},
    { title: "Como é sua rotina diária?", field: "routine_daily", type: "select", options: [
      { label: "Sedentário (Escritório)", value: "Sedentário" },
      { label: "Levemente Ativo", value: "Leve" },
      { label: "Ativo (Trabalho braçal)", value: "Ativo" },
      { label: "Muito Ativo", value: "Muito Ativo" }
    ]},
    { title: "Ajuste suas metas diárias", type: "goals" }
  ];

  const handleNext = async () => {
    try {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        const existingUser = await db.users.toCollection().first();
        if (existingUser) {
          await db.users.update(existingUser.id!, {
            ...formData,
            schedules: '{}',
            isLoggedIn: true,
            onboarding_completed: true
          });
        } else {
          await db.users.add({
            ...formData,
            schedules: '{}',
            isLoggedIn: true,
            onboarding_completed: true
          } as any);
        }
        onComplete();
      }
    } catch (e) {
      console.error("Onboarding Error:", e);
      alert("Erro ao salvar dados. Tente novamente.");
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col justify-center">
      <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <p className="text-emerald-400 font-mono text-sm uppercase tracking-widest">Passo {step + 1} de {steps.length}</p>
        <h2 className="text-4xl font-bold leading-tight">{currentStep.title}</h2>
        
        {currentStep.type === 'text' && (
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-transparent border-b-2 border-white/20 py-4 text-2xl focus:border-emerald-500 outline-none"
            placeholder="Seu nome"
          />
        )}

        {currentStep.type === 'select' && (
          <div className="grid gap-3">
            {currentStep.options?.map((opt: any) => (
              <button
                key={opt.value} 
                onClick={() => setFormData({ ...formData, [currentStep.field as string]: opt.value })}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${formData[currentStep.field as keyof typeof formData] === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10'}`}
              >
                <span className="text-xl font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {currentStep.type === 'goals' && (
          <div className="space-y-4">
            <GoalAdjuster label="Calorias (kcal)" value={formData.calories_goal} onChange={(v) => setFormData({...formData, calories_goal: v})} step={50} />
            <GoalAdjuster label="Proteína (g)" value={formData.protein_goal} onChange={(v) => setFormData({...formData, protein_goal: v})} step={5} />
            <GoalAdjuster label="Estudo (min)" value={formData.study_minutes_goal} onChange={(v) => setFormData({...formData, study_minutes_goal: v})} step={10} />
          </div>
        )}

        <Button onClick={handleNext} className="w-full text-xl flex items-center justify-center gap-2">
          {step === steps.length - 1 ? 'Finalizar' : 'Continuar'} <ChevronRight className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
}

function GoalAdjuster({ label, value, onChange, step }: any) {
  return (
    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
      <span className="font-bold text-slate-400">{label}</span>
      <div className="flex items-center gap-4">
        <button onClick={() => onChange(value - step)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">-</button>
        <span className="text-xl font-bold w-16 text-center">{value}</span>
        <button onClick={() => onChange(value + step)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">+</button>
      </div>
    </div>
  );
}
