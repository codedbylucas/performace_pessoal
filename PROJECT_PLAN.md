# Painel de Performance Pessoal - Documentação Técnica

## 1. Backlog

### MVP (Versão 1)
- [ ] **Autenticação & Onboarding**: Fluxo de login e formulário de perfil completo.
- [ ] **Dashboard**: Visão geral do dia com progresso circular de calorias, proteína, treino e estudos.
- [ ] **Módulo Alimentação**: Registro de refeições com busca (mock/simples) e cálculo de macros.
- [ ] **Módulo Treino**: Registro de sessões de treino (exercícios, séries, carga).
- [ ] **Módulo Estudos**: Timer/Registro de tempo por assunto.
- [ ] **Módulo Tarefas**: Checklist diário de produtividade.
- [ ] **Cálculo de Performance**: Lógica de "Dia Verde/Vermelho" baseada em metas.

### Versão 2
- [ ] **Sugestões IA**: Integração com Gemini para sugerir treinos e refeições baseadas no histórico.
- [ ] **Relatórios Avançados**: Gráficos de evolução de carga e tempo de estudo mensal.
- [ ] **Gamificação**: Sistema de pontos e streaks de consistência.
- [ ] **Notificações PWA**: Lembretes de refeição e treino.

## 2. Arquitetura
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion.
- **Backend**: Express.js rodando no mesmo processo (Full-stack).
- **Banco de Dados**: SQLite (better-sqlite3) para persistência local e performance.
- **IA**: Google Gemini API para análise de performance e sugestões.

## 3. Modelo de Dados (SQLite)

### Users
- id (PK)
- name, age, height, weight, goal
- training_frequency, level, equipment
- dietary_restrictions, schedule_json
- study_goals_json, productivity_goals_json

### DailyLogs (Performance)
- id (PK)
- user_id (FK)
- date (Unique)
- calories_consumed, protein_consumed
- training_completed (boolean)
- study_minutes
- tasks_completed_count, tasks_total_count
- status (green/red)

### Meals
- id (PK)
- user_id (FK)
- date
- name, calories, protein, carbs, fats

### Workouts
- id (PK)
- user_id (FK)
- date
- exercise_name, sets, reps, weight_kg

### StudySessions
- id (PK)
- user_id (FK)
- date
- subject, duration_minutes

### Tasks
- id (PK)
- user_id (FK)
- date
- title, completed (boolean)

## 4. Regras de Cálculo
- **Meta de Proteína**: 2g/kg de peso.
- **Meta de Calorias**: Calculada via TMB (Harris-Benedict) + Fator de Atividade.
- **Dia Verde**: 
  - Calorias dentro de +/- 10% da meta.
  - Proteína >= 90% da meta.
  - Treino realizado (se for dia de treino).
  - Pelo menos 70% das tarefas concluídas.
  - Meta de estudo atingida.
