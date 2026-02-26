import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  Dumbbell, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { Button } from './components/UI';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import DashboardView from './components/Dashboard';
import NutritionView from './components/Nutrition';
import TrainingView from './components/Training';
import StudiesView from './components/Studies';
import TasksView from './components/Tasks';
import ReportsView from './components/Reports';
import { motion, AnimatePresence } from 'motion/react';
import { logout as apiLogout } from './services/authService';
import { syncData } from './services/syncService';

export default function App() {
  const [hasError, setHasError] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global Error:", event.error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      console.error("Unhandled Rejection:", event.reason);
      setHasError(true);
    });
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Sync Loop
  useEffect(() => {
    const interval = setInterval(async () => {
      setSyncing(true);
      await syncData();
      setSyncing(false);
    }, 30000); // Every 30s
    
    syncData(); // Initial sync
    return () => clearInterval(interval);
  }, []);

  const user = useLiveQuery(() => db.users.limit(1).first().then(u => u || null));
  const [activeTab, setActiveTab] = useState('dashboard');
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayLog = useLiveQuery(
    () => db.dailyLogs.where('date').equals(today).first().then(l => l || null),
    [today]
  );

  useEffect(() => {
    async function ensureLog() {
      if (user && todayLog === null) {
        try {
          await db.dailyLogs.add({
            date: today,
            score: 0,
            status: 'red',
            calories_consumed: 0,
            protein_consumed: 0,
            carbs_consumed: 0,
            fats_consumed: 0,
            fiber_consumed: 0,
            water_liters: 0,
            fruit_portions: 0,
            veg_portions: 0,
            ultraprocessed_count: 0,
            training_completed: 0,
            training_volume: 0,
            study_minutes: 0,
            tasks_completed: 0,
            tasks_total: 0
          });
        } catch (e) {
          console.error("Failed to create daily log:", e);
        }
      }
    }
    ensureLog();
  }, [today, user, todayLog]);

  const meals = useLiveQuery(() => db.meals.where('date').equals(today).toArray(), [today]);
  const workouts = useLiveQuery(() => db.workouts.where('date').equals(today).toArray(), [today]);
  const studies = useLiveQuery(() => db.studySessions.where('date').equals(today).toArray(), [today]);
  const tasks = useLiveQuery(() => db.tasks.where('date').equals(today).toArray(), [today]);

  useEffect(() => {
    if (todayLog && user) {
      calculateAndSaveScore(todayLog, user);
    }
  }, [todayLog, user, meals, workouts, studies, tasks]);

  async function calculateAndSaveScore(log: any, user: any) {
    try {
      let nutritionScore = 0;
      let trainingScore = 0;
      let studyScore = 0;
      let taskScore = 0;

      const calDiff = Math.abs(log.calories_consumed - user.calories_goal);
      const calPct = Math.max(0, 100 - (calDiff / user.calories_goal) * 100);
      const protPct = Math.min(100, (log.protein_consumed / user.protein_goal) * 100);
      nutritionScore = (calPct * 0.5 + protPct * 0.5);

      trainingScore = log.training_completed ? 100 : 0;
      studyScore = Math.min(100, (log.study_minutes / user.study_minutes_goal) * 100);
      taskScore = log.tasks_total > 0 ? (log.tasks_completed / log.tasks_total) * 100 : 100;

      const totalScore = Math.round(
        nutritionScore * 0.4 + 
        trainingScore * 0.25 + 
        studyScore * 0.2 + 
        taskScore * 0.15
      );

      let status: 'green' | 'yellow' | 'red' = 'red';
      if (totalScore >= 80) status = 'green';
      else if (totalScore >= 50) status = 'yellow';

      if (log.score !== totalScore || log.status !== status) {
        await db.dailyLogs.update(log.id, { score: totalScore, status });
      }
    } catch (e) {
      console.error("Score calculation error:", e);
    }
  }

  const handleLogout = async () => {
    if (user) {
      await db.users.update(user.id!, { isLoggedIn: false });
      apiLogout();
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h1>
        <p className="text-slate-400 mb-8">Ocorreu um erro inesperado. Tente recarregar a página.</p>
        <Button onClick={() => window.location.reload()} className="bg-rose-500 shadow-rose-500/20">Recarregar</Button>
      </div>
    );
  }

  if (user === undefined || (user && user.isLoggedIn && user.onboarding_completed && todayLog === undefined)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-500 font-bold animate-pulse">Sincronizando com a Nuvem...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isLoggedIn) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  if (!user.onboarding_completed) {
    return <Onboarding onComplete={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] pb-24 font-sans text-[#E6EDF7]">
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="w-12 h-12 bg-[#101826] rounded-2xl flex items-center justify-center border border-[#223047] shadow-sm active:scale-95 transition-all"
          >
            <User className="w-6 h-6 text-[#98A2B3]" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#98A2B3] flex items-center gap-2">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              {syncing && <RefreshCw className="w-3 h-3 animate-spin text-[#3B82F6]" />}
            </p>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Olá, {user.name}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#98A2B3]">Acesso completo liberado</p>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardView log={todayLog} user={user} />}
            {activeTab === 'nutrition' && <NutritionView log={todayLog} user={user} meals={meals} />}
            {activeTab === 'training' && <TrainingView log={todayLog} workouts={workouts} />}
            {activeTab === 'studies' && <StudiesView log={todayLog} studies={studies} />}
            {activeTab === 'tasks' && <TasksView log={todayLog} tasks={tasks} />}
            {activeTab === 'reports' && <ReportsView user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-[#101826]/80 backdrop-blur-xl border border-[#223047] rounded-3xl p-2 shadow-2xl flex justify-around items-center z-50">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Início" />
        <NavButton active={activeTab === 'nutrition'} onClick={() => setActiveTab('nutrition')} icon={<Utensils />} label="Nutrição" />
        <NavButton active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<Dumbbell />} label="Treino" />
        <NavButton active={activeTab === 'studies'} onClick={() => setActiveTab('studies')} icon={<BookOpen />} label="Estudos" />
        <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare />} label="Tarefas" />
        <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 />} label="Relatórios" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-2xl transition-all ${active ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'text-[#98A2B3] hover:text-[#E6EDF7]'}`}
    >
      {active ? icon : <div className="opacity-70">{icon}</div>}
      <span className={`text-[10px] mt-1 font-bold uppercase tracking-tighter ${active ? 'block' : 'hidden'}`}>{label}</span>
    </button>
  );
}
