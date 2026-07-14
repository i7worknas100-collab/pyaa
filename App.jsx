import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Welcome from './components/Welcome.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import DailyRoutine from './components/DailyRoutine.jsx';
import Goals from './components/Goals.jsx';
import CalendarView from './components/CalendarView.jsx';
import FocusMode from './components/FocusMode.jsx';
import Achievements, { ACHIEVEMENT_DEFS } from './components/Achievements.jsx';
import ReflectionModal from './components/ReflectionModal.jsx';
import EveningReflection from './components/EveningReflection.jsx';
import CoachBanner from './components/CoachBanner.jsx';
import { loadState, saveState, todayKey, uid } from './lib/storage.js';
import { quoteForDay } from './lib/quotes.js';

function computeStreak(tasksByDay) {
  let streak = 0;
  const d = new Date();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = todayKey(d);
    const dayTasks = tasksByDay[key];
    const isToday = key === todayKey();
    if (dayTasks && dayTasks.length > 0 && dayTasks.every((t) => t.done)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (isToday && (!dayTasks || dayTasks.length === 0)) {
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [section, setSection] = useState('dashboard');
  const [focusOpen, setFocusOpen] = useState(false);
  const [reflectOpen, setReflectOpen] = useState(false);

  const [tasksByDay, setTasksByDay] = useState(() => loadState('tasksByDay', {}));
  const [goals, setGoals] = useState(() => loadState('goals', []));
  const [reflectionsByDay, setReflectionsByDay] = useState(() => loadState('reflectionsByDay', {}));
  const [focusByDay, setFocusByDay] = useState(() => loadState('focusByDay', {}));
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => loadState('achievements', []));
  const [userName] = useState(() => loadState('userName', ''));

  const [pendingReflection, setPendingReflection] = useState(null); // task pending "what did you learn"

  const tKey = todayKey();
  const isReturning = Object.keys(tasksByDay).length > 0 || goals.length > 0;
  const quote = useMemo(() => quoteForDay(tKey), [tKey]);

  useEffect(() => saveState('tasksByDay', tasksByDay), [tasksByDay]);
  useEffect(() => saveState('goals', goals), [goals]);
  useEffect(() => saveState('reflectionsByDay', reflectionsByDay), [reflectionsByDay]);
  useEffect(() => saveState('focusByDay', focusByDay), [focusByDay]);
  useEffect(() => saveState('achievements', unlockedAchievements), [unlockedAchievements]);

  const todayTasks = tasksByDay[tKey] || [];
  const todayProgress = todayTasks.length ? (todayTasks.filter((t) => t.done).length / todayTasks.length) * 100 : 0;

  const stats = useMemo(() => {
    const totalCompleted = Object.values(tasksByDay).reduce((sum, list) => sum + list.filter((t) => t.done).length, 0);
    const streak = computeStreak(tasksByDay);
    return { totalCompleted, streak };
  }, [tasksByDay]);

  // Recent completion rates (last 7 days) for coach banner
  const recentRates = useMemo(() => {
    const rates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      const list = tasksByDay[key];
      if (list && list.length > 0) {
        rates.push(list.filter((t) => t.done).length / list.length);
      }
    }
    return rates;
  }, [tasksByDay]);

  // check achievement unlocks
  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENT_DEFS.filter((a) => !unlockedAchievements.includes(a.key) && a.check(stats)).map((a) => a.key);
    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements((prev) => [...prev, ...newlyUnlocked]);
    }
  }, [stats]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusMinutesToday = focusByDay[tKey] || 0;

  const updateTodayTasks = (updater) => {
    setTasksByDay((prev) => {
      const list = prev[tKey] || [];
      return { ...prev, [tKey]: updater(list) };
    });
  };

  const addTask = (data) => {
    updateTodayTasks((list) => [...list, { id: uid(), done: false, learning: '', createdAt: Date.now(), ...data }]);
  };

  const updateTask = (id, data) => {
    updateTodayTasks((list) => list.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTask = (id) => {
    updateTodayTasks((list) => list.filter((t) => t.id !== id));
  };

  const toggleTask = (id) => {
    const task = todayTasks.find((t) => t.id === id);
    if (!task) return;
    const willBeDone = !task.done;
    updateTodayTasks((list) => list.map((t) => (t.id === id ? { ...t, done: willBeDone } : t)));
    if (willBeDone) {
      setPendingReflection(task);
    }
  };

  const saveTaskLearning = (text) => {
    if (pendingReflection) {
      updateTodayTasks((list) => list.map((t) => (t.id === pendingReflection.id ? { ...t, learning: text } : t)));
    }
    setPendingReflection(null);
  };

  const addGoal = (data) => setGoals((prev) => [...prev, { id: uid(), ...data }]);
  const deleteGoal = (id) => setGoals((prev) => prev.filter((g) => g.id !== id));
  const setGoalProgress = (id, progress) => setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress } : g)));

  const saveEveningReflection = (answers) => {
    setReflectionsByDay((prev) => ({ ...prev, [tKey]: answers }));
    setReflectOpen(false);
  };

  const handleFocusComplete = (minutes) => {
    setFocusByDay((prev) => ({ ...prev, [tKey]: (prev[tKey] || 0) + minutes }));
  };

  if (!entered) {
    return <Welcome isReturning={isReturning} quote={quote} onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="min-h-screen flex relative">
      <Sidebar active={section} onChange={setSection} onFocus={() => setFocusOpen(true)} onReflect={() => setReflectOpen(true)} />

      <main className="flex-1 px-5 md:px-10 py-8 md:py-12 pb-28 md:pb-12 relative z-10">
        <CoachBanner recentCompletionRates={recentRates} />

        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {section === 'dashboard' && (
              <Dashboard
                userName={userName}
                tasksToday={todayTasks}
                todayProgress={todayProgress}
                streak={stats.streak}
                focusMinutesToday={focusMinutesToday}
                quote={quote}
                goalsCount={goals.length}
              />
            )}
            {section === 'routine' && (
              <DailyRoutine tasks={todayTasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} onToggle={toggleTask} />
            )}
            {section === 'goals' && <Goals goals={goals} onAdd={addGoal} onDelete={deleteGoal} onProgress={setGoalProgress} />}
            {section === 'calendar' && (
              <CalendarView tasksByDay={tasksByDay} reflectionsByDay={reflectionsByDay} focusByDay={focusByDay} />
            )}
            {section === 'achievements' && <Achievements stats={stats} unlocked={unlockedAchievements} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <FocusMode active={focusOpen} onClose={() => setFocusOpen(false)} onComplete={handleFocusComplete} />

      <ReflectionModal
        open={!!pendingReflection}
        taskTitle={pendingReflection?.title || ''}
        onSave={saveTaskLearning}
        onClose={() => setPendingReflection(null)}
      />

      <EveningReflection
        open={reflectOpen}
        existing={reflectionsByDay[tKey]}
        onSave={saveEveningReflection}
        onClose={() => setReflectOpen(false)}
      />
    </div>
  );
}
