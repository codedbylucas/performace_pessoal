import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, UserPlus, LogIn } from 'lucide-react';
import { db } from '../db';
import { Button, Card } from './UI';
import { signup, login as apiLogin } from '../services/authService';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      let userData;
      if (mode === 'signup') {
        if (!email || !password || !name) {
          setError('Preencha todos os campos');
          return;
        }
        userData = await signup(name, email, password);
      } else {
        userData = await apiLogin(email, password);
      }

      // Sync with local DB
      const existingUser = await db.users.where('email').equals(email).first();
      if (existingUser) {
        await db.users.update(existingUser.id!, {
          ...userData,
          server_id: userData.id,
          isLoggedIn: true
        });
      } else {
        await db.users.add({
          ...userData,
          server_id: userData.id,
          isLoggedIn: true,
          onboarding_completed: false,
          age: 25, height: 175, weight: 75, goal: 'maintain', level: 'beginner',
          training_days_week: 3, equipment: '', routine_daily: '', dietary_restrictions: '',
          study_goal_weekly: 0, schedules: '', calories_goal: 2000, protein_goal: 150,
          training_goal: 3, study_minutes_goal: 30, tasks_goal: 3
        } as any);
      }
      onAuthSuccess();
    } catch (e: any) {
      console.error("Auth Error:", e);
      setError(e?.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-6 text-[#E6EDF7]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-[#3B82F6] rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Performance Pro</h1>
          <p className="text-[#98A2B3] font-medium">Seu arquiteto de performance pessoal</p>
        </div>

        <Card className="bg-[#101826] border-[#223047] p-8 space-y-6 shadow-2xl">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98A2B3] ml-1">Nome</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#223047] rounded-2xl p-4 outline-none focus:border-[#3B82F6] text-[#E6EDF7] transition-all placeholder:text-[#223047]"
                placeholder="Seu nome completo"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98A2B3] ml-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#223047] rounded-2xl p-4 outline-none focus:border-[#3B82F6] text-[#E6EDF7] transition-all placeholder:text-[#223047]"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98A2B3] ml-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#223047] rounded-2xl p-4 outline-none focus:border-[#3B82F6] text-[#E6EDF7] transition-all placeholder:text-[#223047]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

          <Button onClick={handleAuth} disabled={loading} className="w-full py-5 text-lg font-black uppercase tracking-widest">
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </Button>
        </Card>

        <div className="text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[#3B82F6] font-black text-xs uppercase tracking-widest hover:text-blue-400 transition-colors"
          >
            {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
