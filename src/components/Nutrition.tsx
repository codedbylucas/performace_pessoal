import { useState } from 'react';
import { Search, Leaf, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../db';
import { Card, Button } from './UI';

type Preset = {
  label: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

export default function Nutrition({ log, meals }: any) {
  const [mealName, setMealName] = useState('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  const [fiber, setFiber] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');
  const [isQuality, setIsQuality] = useState(true);

  const computedCalories =
    calories !== ''
      ? Number(calories)
      : Math.max(
          0,
          Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fats) || 0) * 9)
        );

  const presets: Preset[] = [
    { label: 'Frango + Arroz', protein: 35, carbs: 45, fats: 8, fiber: 4 },
    { label: 'Iogurte + Frutas + Granola', protein: 18, carbs: 40, fats: 9, fiber: 5 },
    { label: 'Omelete 3 ovos + queijo', protein: 24, carbs: 2, fats: 18, fiber: 0 },
    { label: 'Whey + Banana', protein: 25, carbs: 30, fats: 2, fiber: 3 }
  ];

  const dailyPresets: Preset[] = [
    {
      label: 'Café da manhã padrão',
      protein: 24,    // 2 ovos + pão integral + café com leite
      carbs: 36,
      fats: 15,
      fiber: 4
    },
    {
      label: 'Almoço/Janta padrão',
      protein: 28,    // 100g carne + 100g arroz + coca zero
      carbs: 28,
      fats: 8,
      fiber: 1
    },
    {
      label: 'Ceia padrão',
      protein: 24,    // repete café da manhã
      carbs: 36,
      fats: 15,
      fiber: 4
    }
  ];

  const applyPreset = (preset: Preset) => {
    setMealName(preset.label);
    setProtein(preset.protein);
    setCarbs(preset.carbs);
    setFats(preset.fats);
    setFiber(preset.fiber);
    setCalories('');
    setIsQuality(true);
  };

  const handleAddMeal = async () => {
    if (!mealName.trim()) {
      alert('Dê um nome para a refeição.');
      return;
    }

    const date = format(new Date(), 'yyyy-MM-dd');
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fats) || 0;
    const fi = Number(fiber) || 0;

    await db.meals.add({
      date,
      name: mealName,
      raw_text: mealName,
      calories: computedCalories,
      protein: p,
      carbs: c,
      fats: f,
      fiber: fi,
      is_quality: isQuality
    });

    const currentLog = await db.dailyLogs.where('date').equals(date).first();
    if (currentLog) {
      await db.dailyLogs.update(currentLog.id!, {
        calories_consumed: currentLog.calories_consumed + computedCalories,
        protein_consumed: currentLog.protein_consumed + p,
        carbs_consumed: currentLog.carbs_consumed + c,
        fats_consumed: currentLog.fats_consumed + f,
        fiber_consumed: currentLog.fiber_consumed + fi,
        ultraprocessed_count: currentLog.ultraprocessed_count + (isQuality ? 0 : 1)
      });
    }

    setMealName('');
    setProtein('');
    setCarbs('');
    setFats('');
    setFiber('');
    setCalories('');
    setIsQuality(true);
  };

  const addWater = async (amount: number) => {
    const date = format(new Date(), 'yyyy-MM-dd');
    const currentLog = await db.dailyLogs.where('date').equals(date).first();
    if (currentLog) {
      await db.dailyLogs.update(currentLog.id!, {
        water_liters: currentLog.water_liters + amount
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Nutrição</h2>
      
      {/* Water Tracking */}
      <Card className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Hidratação</p>
          <p className="text-2xl font-bold">{log?.water_liters?.toFixed(1) || 0}L</p>
        </div>
        <div className="flex gap-2">
          {[0.25, 0.5].map(v => (
            <button key={v} onClick={() => addWater(v)} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm">+{v}L</button>
          ))}
        </div>
      </Card>

      {/* Manual input */}
      <Card className="space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-500" />
          Registro Manual de Refeição
        </h3>

        <input
          type="text"
          placeholder="Ex: Frango com arroz e salada"
          value={mealName}
          onChange={e => setMealName(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-black/5 text-slate-900"
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Proteína (g)" value={protein} onChange={setProtein} />
          <NumberField label="Carboidratos (g)" value={carbs} onChange={setCarbs} />
          <NumberField label="Gorduras (g)" value={fats} onChange={setFats} />
          <NumberField label="Fibras (g)" value={fiber} onChange={setFiber} />
        </div>

        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-slate-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Calorias estimadas</p>
            <p className="text-xl font-black">{computedCalories} kcal</p>
            <p className="text-[11px] text-emerald-700">Se quiser, digite manualmente abaixo.</p>
          </div>
          <Flame className="w-6 h-6 text-emerald-500" />
        </div>

        <input
          type="number"
          placeholder="Calorias (kcal) - opcional"
          value={calories}
          onChange={e => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-black/5 text-slate-900"
        />

        <div className="flex gap-2 flex-wrap">
          {dailyPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {presets.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsQuality(true)}
            className={`flex-1 px-3 py-3 rounded-xl font-bold text-sm border ${isQuality ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-50 text-slate-700 border-black/5'}`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Leaf className="w-4 h-4" />
              Comida natural
            </div>
          </button>
          <button
            onClick={() => setIsQuality(false)}
            className={`flex-1 px-3 py-3 rounded-xl font-bold text-sm border ${!isQuality ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-50 text-slate-700 border-black/5'}`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Flame className="w-4 h-4" />
              Ultraprocessado
            </div>
          </button>
        </div>

        <Button 
          onClick={handleAddMeal}
          className="w-full"
        >
          Salvar refeição
        </Button>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Refeições de Hoje</h3>
        {meals?.map((meal: any) => (
          <Card key={meal.id} className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-10 rounded-full ${meal.is_quality ? 'bg-emerald-500' : 'bg-orange-400'}`} />
              <div>
                <p className="font-bold">{meal.name}</p>
                <p className="text-xs text-slate-400">{meal.protein}g Prot | {meal.carbs}g Carb | {meal.fats}g Gord</p>
              </div>
            </div>
            <p className="font-bold text-emerald-600">{meal.calories} kcal</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-black/5 font-bold text-slate-900"
      />
    </div>
  );
}
