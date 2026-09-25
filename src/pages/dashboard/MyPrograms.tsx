import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Dumbbell, Apple } from 'lucide-react';
import type { ExercisePlan } from '../../types/exercisePlan';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type Meal = {
  id: string;
  name: string;
  items: string;
  notes: string;
};

type DietPlan = {
  id: string;
  clientId: string;
  clientName: string;
  coachName: string;
  dayOfWeek: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
};

export default function MyPrograms() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'EXERCISE' | 'DIET'>('EXERCISE');
  
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrograms = async () => {
      if (!db?.app || !user) return;
      setLoading(true);
      try {
        const [exSnap, dietSnap] = await Promise.all([
          getDocs(query(collection(db, 'exercisePlans'), where('clientId', '==', user.uid))),
          getDocs(query(collection(db, 'dietPlans'), where('clientId', '==', user.uid)))
        ]);

        const loadedEx = exSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ExercisePlan));
        loadedEx.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
        setExercisePlans(loadedEx);

        const loadedDiet = dietSnap.docs.map((d) => ({ id: d.id, ...d.data() } as DietPlan));
        const dayOrder = Object.fromEntries(DAYS_OF_WEEK.map((d, i) => [d, i]));
        loadedDiet.sort((a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]);
        setDietPlans(loadedDiet);

      } catch (err) {
        console.error(err);
        setError('Failed to load your programs.');
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading programs...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-2">My Programs</h1>
      <p className="text-gray-400 mb-8">View your assigned workout routines and diet plans from your coach.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">
          {error}
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab('EXERCISE')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'EXERCISE' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <Dumbbell size={16} />
          Exercise Plans
        </button>
        <button
          onClick={() => setActiveTab('DIET')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'DIET' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <Apple size={16} />
          Diet Plans
        </button>
      </div>

      {/* EXERCISE PLANS */}
      {activeTab === 'EXERCISE' && (
        <div>
          {exercisePlans.length === 0 ? (
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-sm text-center">
              <Dumbbell size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Your coach hasn't assigned any exercise plans yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exercisePlans.map((plan) => (
                <div key={plan.id} className="bg-zinc-900 border border-white/10 rounded-sm p-5">
                  <div className="border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-xl font-heading font-bold text-white mb-1">{plan.title}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                      Assigned by {plan.coachName}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {plan.exercises.map((ex, i) => (
                      <div key={ex.id} className="bg-black/50 p-3 rounded-sm border border-white/5">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-200">{i + 1}. {ex.name}</span>
                          <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-sm">
                            {ex.sets} Sets × {ex.reps} Reps
                          </span>
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-gray-500 italic">{ex.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIET PLANS */}
      {activeTab === 'DIET' && (
        <div>
          {dietPlans.length === 0 ? (
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-sm text-center">
              <Apple size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Your coach hasn't assigned any diet plans yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dietPlans.map((plan) => (
                <div key={plan.id} className="bg-zinc-900 border border-white/10 rounded-sm p-5">
                  <div className="border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-xl font-heading font-bold text-accent mb-1">{plan.dayOfWeek}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                      Assigned by {plan.coachName}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {plan.meals.map((meal) => (
                      <div key={meal.id}>
                        <h4 className="text-sm font-bold text-gray-300 mb-1">{meal.name}</h4>
                        <p className="text-sm text-gray-400 bg-black/50 p-3 rounded-sm border border-white/5 whitespace-pre-wrap">
                          {meal.items}
                        </p>
                        {meal.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic pl-2 border-l-2 border-gray-700">
                            {meal.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
