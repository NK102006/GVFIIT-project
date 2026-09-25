import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { ArrowLeft, Plus, Trash2, Save, Dumbbell, Apple, Activity, FileText, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import MetricsTracker from '../../components/MetricsTracker';
import ConfirmModal from '../../components/ConfirmModal';
import type { Profile } from '../../contexts/AuthContext';
import type { Exercise, ExercisePlan } from '../../types/exercisePlan';

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

function emptyExercise(): Exercise {
  return { id: crypto.randomUUID(), day: 'Day 1', name: '', setsReps: '', rpe: '', rest: '' };
}

function emptyMeal(): Meal {
  return { id: crypto.randomUUID(), name: '', items: '', notes: '' };
}

type CoachNote = {
  id: string;
  clientId: string;
  coachName: string;
  text: string;
  createdAt: string;
};

export default function ClientPlan() {
  const { clientId } = useParams<{ clientId: string }>();
  const { profile, staff } = useAuth();
  const coachName = profile?.fullName || staff?.name || 'Coach';

  const [client, setClient] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'EXERCISE' | 'DIET' | 'METRICS' | 'NOTES'>('EXERCISE');

  // =====================
  // EXERCISE PLAN STATE
  // =====================
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [editingExPlanId, setEditingExPlanId] = useState<string | null>(null);
  const [exTitle, setExTitle] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);

  // =====================
  // DIET PLAN STATE
  // =====================
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [editingDietPlanId, setEditingDietPlanId] = useState<string | null>(null);
  const [dietDay, setDietDay] = useState(DAYS_OF_WEEK[0]);
  const [meals, setMeals] = useState<Meal[]>([emptyMeal()]);

  // =====================
  // COACH NOTES STATE
  // =====================
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // =====================
  // DELETE CONFIRMATION STATE
  // =====================
  const [confirmExPlanId, setConfirmExPlanId] = useState<string | null>(null);
  const [confirmDietPlanId, setConfirmDietPlanId] = useState<string | null>(null);
  const [confirmNoteId, setConfirmNoteId] = useState<string | null>(null);

  const loadData = async () => {
    if (!db?.app || !clientId) {
      setError('Firebase is not configured, or no client was specified.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Load Client
      const clientSnap = await getDoc(doc(db, 'profiles', clientId));
      if (clientSnap.exists()) {
        setClient({ id: clientSnap.id, ...clientSnap.data() } as Profile);
      } else {
        setClient(null);
        setError('Client not found.');
      }

      // 2. Load Exercise Plans
      const exQuery = query(collection(db, 'exercisePlans'), where('clientId', '==', clientId));
      const exSnap = await getDocs(exQuery);
      const loadedEx = exSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ExercisePlan));
      loadedEx.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      setExercisePlans(loadedEx);

      // 3. Load Diet Plans
      const dietQuery = query(collection(db, 'dietPlans'), where('clientId', '==', clientId));
      const dietSnap = await getDocs(dietQuery);
      const loadedDiet = dietSnap.docs.map((d) => ({ id: d.id, ...d.data() } as DietPlan));
      
      const dayOrder = Object.fromEntries(DAYS_OF_WEEK.map((d, i) => [d, i]));
      loadedDiet.sort((a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]);
      setDietPlans(loadedDiet);

      // 4. Load Coach Notes
      const notesQuery = query(collection(db, 'coachNotes'), where('clientId', '==', clientId));
      const notesSnap = await getDocs(notesQuery);
      const loadedNotes = notesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CoachNote));
      loadedNotes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setCoachNotes(loadedNotes);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load client data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // =====================
  // EXERCISE PLAN ACTIONS
  // =====================
  const startNewExPlan = () => {
    setEditingExPlanId(null);
    setExTitle('');
    setExercises([emptyExercise()]);
  };

  const startEditExPlan = (plan: ExercisePlan) => {
    setEditingExPlanId(plan.id);
    setExTitle(plan.title);
    setExercises(plan.exercises.length ? plan.exercises : [emptyExercise()]);
  };

  const updateExercise = (id: string, patch: Partial<Exercise>) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  };

  const addExerciseRow = () => setExercises((prev) => [...prev, emptyExercise()]);

  const removeExerciseRow = (id: string) =>
    setExercises((prev) => (prev.length > 1 ? prev.filter((ex) => ex.id !== id) : prev));

  const handleSaveExPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app || !clientId || !client) return;
    setSaving(true);
    try {
      const cleanExercises = exercises
        .filter((ex) => ex.name.trim().length > 0)
        .map((ex) => ({ ...ex }));

      if (editingExPlanId) {
        await updateDoc(doc(db, 'exercisePlans', editingExPlanId), {
          title: exTitle,
          exercises: cleanExercises,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'exercisePlans'), {
          clientId,
          clientName: client.fullName,
          title: exTitle,
          coachName,
          exercises: cleanExercises,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      startNewExPlan();
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save exercise plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExPlan = (planId: string) => {
    if (!db?.app) return;
    setConfirmExPlanId(planId);
  };

  const confirmDeleteExPlan = async () => {
    if (!confirmExPlanId) return;
    try {
      await deleteDoc(doc(db, 'exercisePlans', confirmExPlanId));
      setExercisePlans((prev) => prev.filter((p) => p.id !== confirmExPlanId));
      if (editingExPlanId === confirmExPlanId) startNewExPlan();
    } catch (err) {
      console.error(err);
      setError('Failed to delete exercise plan.');
    } finally {
      setConfirmExPlanId(null);
    }
  };

  // =====================
  // DIET PLAN ACTIONS
  // =====================
  const startNewDietPlan = () => {
    setEditingDietPlanId(null);
    setDietDay(DAYS_OF_WEEK[0]);
    setMeals([emptyMeal()]);
  };

  const startEditDietPlan = (plan: DietPlan) => {
    setEditingDietPlanId(plan.id);
    setDietDay(plan.dayOfWeek);
    setMeals(plan.meals.length ? plan.meals : [emptyMeal()]);
  };

  const updateMeal = (id: string, patch: Partial<Meal>) => {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addMealRow = () => setMeals((prev) => [...prev, emptyMeal()]);

  const removeMealRow = (id: string) =>
    setMeals((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : prev));

  const handleSaveDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app || !clientId || !client) return;
    setSaving(true);
    try {
      const cleanMeals = meals.filter((m) => m.name.trim().length > 0 || m.items.trim().length > 0);

      if (editingDietPlanId) {
        await updateDoc(doc(db, 'dietPlans', editingDietPlanId), {
          dayOfWeek: dietDay,
          meals: cleanMeals,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'dietPlans'), {
          clientId,
          clientName: client.fullName,
          coachName,
          dayOfWeek: dietDay,
          meals: cleanMeals,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      startNewDietPlan();
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save diet plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDietPlan = (planId: string) => {
    if (!db?.app) return;
    setConfirmDietPlanId(planId);
  };

  const confirmDeleteDietPlan = async () => {
    if (!confirmDietPlanId) return;
    try {
      await deleteDoc(doc(db, 'dietPlans', confirmDietPlanId));
      setDietPlans((prev) => prev.filter((p) => p.id !== confirmDietPlanId));
      if (editingDietPlanId === confirmDietPlanId) startNewDietPlan();
    } catch (err) {
      console.error(err);
      setError('Failed to delete diet plan.');
    } finally {
      setConfirmDietPlanId(null);
    }
  };

  // =====================
  // COACH NOTES ACTIONS
  // =====================
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app || !clientId || !client || !newNoteText.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'coachNotes'), {
        clientId,
        coachName,
        text: newNoteText.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewNoteText('');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!db?.app) return;
    setConfirmNoteId(noteId);
  };

  const confirmDeleteNote = async () => {
    if (!confirmNoteId) return;
    try {
      await deleteDoc(doc(db, 'coachNotes', confirmNoteId));
      setCoachNotes((prev) => prev.filter((n) => n.id !== confirmNoteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete note.');
    } finally {
      setConfirmNoteId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading client...</div>;
  }

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-red-400 mb-4">{error || 'Client not found.'}</p>
        <Link to="/coach/clients" className="text-accent hover:text-white transition-colors text-sm">
          ← Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <Link to="/coach/clients" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to clients
      </Link>

      <div className="bg-zinc-900 border border-white/10 rounded-sm p-6 mb-8">
        <h1 className="text-2xl font-heading font-bold">{client.fullName}</h1>
        <p className="text-gray-400 text-sm mt-1">{client.email}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div>
            <span className="text-gray-500">Phone: </span>
            <span>{client.phone || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Status: </span>
            <span>{client.membershipStatus}</span>
          </div>
          <div>
            <span className="text-gray-500">Plan: </span>
            <span>{client.planType}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-sm text-sm mb-6">
          {error}
        </div>
      )}

      {/* TABS */}
      <div className="flex border-b border-white/10 mb-6">
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
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'METRICS' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <Activity size={16} />
          Fitness Metrics
        </button>
        <button
          onClick={() => setActiveTab('NOTES')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'NOTES' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <FileText size={16} />
          Coach Notes
        </button>
      </div>

      {/* TAB CONTENT: EXERCISE PLANS */}
      {activeTab === 'EXERCISE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-heading font-bold mb-3">Saved Plans</h2>
            {exercisePlans.length === 0 ? (
              <p className="text-gray-500 text-sm">No plans yet — create one on the right.</p>
            ) : (
              <div className="space-y-3">
                {exercisePlans.map((plan) => (
                  <div key={plan.id} className="bg-zinc-900 border border-white/10 rounded-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{plan.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''} · by {plan.coachName}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => startEditExPlan(plan)}
                          className="text-xs text-accent hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExPlan(plan.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 overflow-x-auto border border-white/5 rounded-sm">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-white/5 border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-2 py-1.5">Day</th>
                            <th className="px-2 py-1.5">Exercise</th>
                            <th className="px-2 py-1.5">Sets/Reps</th>
                            <th className="px-2 py-1.5">RPE</th>
                            <th className="px-2 py-1.5">Rest</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(
                            plan.exercises.reduce((acc, ex) => {
                              const d = ex.day || 'Day 1';
                              if (!acc[d]) acc[d] = [];
                              acc[d].push(ex);
                              return acc;
                            }, {} as Record<string, typeof plan.exercises>)
                          ).map(([dayName, exList]) => (
                            <React.Fragment key={dayName}>
                              {exList.map((ex, idx) => (
                                <tr key={ex.id} className="border-b border-white/5 last:border-0 text-gray-300 hover:bg-white/5 transition-colors">
                                  {idx === 0 && (
                                    <td className="px-3 py-2 align-top font-bold text-accent border-r border-white/5 w-24" rowSpan={exList.length}>
                                      {dayName}
                                    </td>
                                  )}
                                  <td className="px-3 py-2 font-medium">{ex.name}</td>
                                  <td className="px-3 py-2">{ex.setsReps || (ex.sets ? `${ex.sets}x${ex.reps}` : '-')}</td>
                                  <td className="px-3 py-2">{ex.rpe || '-'}</td>
                                  <td className="px-3 py-2">{ex.rest || '-'}</td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3">
              {editingExPlanId ? 'Edit Exercise Plan' : 'New Exercise Plan'}
            </h2>
            <form onSubmit={handleSaveExPlan} className="bg-zinc-900 border border-white/10 rounded-sm p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={exTitle}
                  onChange={(e) => setExTitle(e.target.value)}
                  placeholder="e.g. Week 1 — Upper Body"
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="overflow-x-auto border border-white/10 rounded-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Day</th>
                      <th className="px-3 py-2 font-semibold">Exercise</th>
                      <th className="px-3 py-2 font-semibold">Sets/Reps</th>
                      <th className="px-3 py-2 font-semibold">RPE</th>
                      <th className="px-3 py-2 font-semibold">Rest</th>
                      <th className="px-3 py-2 font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      exercises.reduce((acc, ex) => {
                        const d = ex.day || 'Day 1';
                        if (!acc[d]) acc[d] = [];
                        acc[d].push(ex);
                        return acc;
                      }, {} as Record<string, typeof exercises>)
                    ).map(([dayName, exList]) => (
                      <React.Fragment key={dayName}>
                        {exList.map((ex, idx) => (
                          <tr key={ex.id} className="border-b border-white/5 last:border-0">
                            {idx === 0 && (
                              <td className="p-2 w-28 align-top border-r border-white/5" rowSpan={exList.length}>
                                <input
                                  type="text"
                                  placeholder="Day"
                                  value={dayName}
                                  onChange={(e) => {
                                    const newDay = e.target.value;
                                    setExercises(prev => prev.map(p => (p.day || 'Day 1') === dayName ? { ...p, day: newDay } : p));
                                  }}
                                  className="w-full px-2 py-1.5 bg-black/50 border border-transparent hover:border-white/20 focus:border-accent rounded-sm outline-none transition-colors font-bold text-accent"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExercises(prev => {
                                      const newEx = emptyExercise();
                                      newEx.day = dayName;
                                      const lastIdx = prev.map(p => (p.day || 'Day 1')).lastIndexOf(dayName);
                                      const copy = [...prev];
                                      copy.splice(lastIdx + 1, 0, newEx);
                                      return copy;
                                    });
                                  }}
                                  className="w-full mt-2 text-[10px] text-gray-400 hover:text-white uppercase tracking-widest font-bold py-1.5 px-1 text-center bg-white/5 hover:bg-white/10 rounded-sm transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus size={10} /> Add
                                </button>
                              </td>
                            )}
                            <td className="p-1">
                              <input
                                type="text"
                                required
                                placeholder="Exercise name"
                                value={ex.name}
                                onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                                className="w-full px-2 py-1.5 bg-black/50 border border-transparent hover:border-white/20 focus:border-accent rounded-sm outline-none transition-colors"
                              />
                            </td>
                            <td className="p-1 w-28">
                              <input
                                type="text"
                                placeholder="e.g. 3x10"
                                value={ex.setsReps || ''}
                                onChange={(e) => updateExercise(ex.id, { setsReps: e.target.value })}
                                className="w-full px-2 py-1.5 bg-black/50 border border-transparent hover:border-white/20 focus:border-accent rounded-sm outline-none transition-colors"
                              />
                            </td>
                            <td className="p-1 w-20">
                              <input
                                type="text"
                                placeholder="e.g. 8"
                                value={ex.rpe || ''}
                                onChange={(e) => updateExercise(ex.id, { rpe: e.target.value })}
                                className="w-full px-2 py-1.5 bg-black/50 border border-transparent hover:border-white/20 focus:border-accent rounded-sm outline-none transition-colors"
                              />
                            </td>
                            <td className="p-1 w-24">
                              <input
                                type="text"
                                placeholder="e.g. 60s"
                                value={ex.rest || ''}
                                onChange={(e) => updateExercise(ex.id, { rest: e.target.value })}
                                className="w-full px-2 py-1.5 bg-black/50 border border-transparent hover:border-white/20 focus:border-accent rounded-sm outline-none transition-colors"
                              />
                            </td>
                            <td className="p-1 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => removeExerciseRow(ex.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-sm hover:bg-white/5 inline-flex items-center justify-center"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => {
                  setExercises(prev => {
                    const dayNames = Array.from(new Set(prev.map(p => p.day || 'Day 1')));
                    const newDayName = `Day ${dayNames.length + 1}`;
                    return [...prev, { ...emptyExercise(), day: newDayName }];
                  });
                }}
                className="flex items-center gap-2 text-xs font-bold text-accent hover:text-white transition-colors"
              >
                <Plus size={14} />
                Add New Day
              </button>

              <div className="flex gap-3 pt-2">
                {editingExPlanId && (
                  <button
                    type="button"
                    onClick={startNewExPlan}
                    className="flex-1 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  {saving ? <><Loader2 size={16} className="animate-spin inline mr-2"/>Saving...</> : editingExPlanId ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DIET PLANS */}
      {activeTab === 'DIET' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-heading font-bold mb-3">Saved Diet Plans</h2>
            {dietPlans.length === 0 ? (
              <p className="text-gray-500 text-sm">No diet plans yet — create one on the right.</p>
            ) : (
              <div className="space-y-3">
                {dietPlans.map((plan) => (
                  <div key={plan.id} className="bg-zinc-900 border border-white/10 rounded-sm p-4">
                    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 mb-3">
                      <div>
                        <p className="font-semibold text-accent text-base">{plan.dayOfWeek}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {plan.meals.length} meal{plan.meals.length !== 1 ? 's' : ''} · by {plan.coachName}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => startEditDietPlan(plan)}
                          className="text-xs text-accent hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDietPlan(plan.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {plan.meals.map((meal) => (
                        <div key={meal.id}>
                          <p className="text-sm font-bold text-gray-300">{meal.name}</p>
                          <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{meal.items}</p>
                          {meal.notes && <p className="text-xs text-gray-500 mt-1 italic">{meal.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3">
              {editingDietPlanId ? 'Edit Diet Plan' : 'New Diet Plan'}
            </h2>
            <form onSubmit={handleSaveDietPlan} className="bg-zinc-900 border border-white/10 rounded-sm p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Day of Week</label>
                <select
                  required
                  value={dietDay}
                  onChange={(e) => setDietDay(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {meals.map((meal, idx) => (
                  <div key={meal.id} className="border border-white/10 rounded-sm p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">Meal {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeMealRow(meal.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Breakfast, Pre-workout Snack"
                      value={meal.name}
                      onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                      className="w-full mb-2 px-3 py-1.5 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    <textarea
                      required
                      placeholder="Food items (e.g. 2 whole eggs, 1 slice toast)"
                      value={meal.items}
                      onChange={(e) => updateMeal(meal.id, { items: e.target.value })}
                      rows={3}
                      className="w-full mb-2 px-3 py-1.5 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional, e.g. cook in olive oil)"
                      value={meal.notes}
                      onChange={(e) => updateMeal(meal.id, { notes: e.target.value })}
                      className="w-full px-3 py-1.5 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMealRow}
                className="flex items-center gap-2 text-xs font-bold text-accent hover:text-white transition-colors"
              >
                <Plus size={14} />
                Add meal
              </button>

              <div className="flex gap-3 pt-2">
                {editingDietPlanId && (
                  <button
                    type="button"
                    onClick={startNewDietPlan}
                    className="flex-1 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  {saving ? <><Loader2 size={16} className="animate-spin inline mr-2"/>Saving...</> : editingDietPlanId ? 'Update Diet Plan' : 'Save Diet Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: METRICS */}
      {activeTab === 'METRICS' && (
        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
          <MetricsTracker clientId={clientId!} />
        </div>
      )}

      {/* TAB CONTENT: NOTES */}
      {activeTab === 'NOTES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-heading font-bold mb-3">Performance & History</h2>
            {coachNotes.length === 0 ? (
              <p className="text-gray-500 text-sm">No notes added yet.</p>
            ) : (
              <div className="space-y-3">
                {coachNotes.map((note) => (
                  <div key={note.id} className="bg-zinc-900 border border-white/10 rounded-sm p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })} · by {note.coachName}
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-heading font-bold mb-3">Add New Note</h2>
            <form onSubmit={handleSaveNote} className="bg-zinc-900 border border-white/10 rounded-sm p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Performance Note</label>
                <textarea
                  required
                  rows={5}
                  placeholder="E.g. Client increased bench press by 5kg today. Form looking solid..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !newNoteText.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
              >
                <Plus size={15} />
                {saving ? <><Loader2 size={16} className="animate-spin inline mr-2"/>Saving...</> : 'Add Note'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmExPlanId}
        title="Delete Exercise Plan"
        message="Are you sure you want to delete this exercise plan?"
        confirmText="Delete"
        onConfirm={confirmDeleteExPlan}
        onCancel={() => setConfirmExPlanId(null)}
      />

      <ConfirmModal
        isOpen={!!confirmDietPlanId}
        title="Delete Diet Plan"
        message="Are you sure you want to delete this diet plan?"
        confirmText="Delete"
        onConfirm={confirmDeleteDietPlan}
        onCancel={() => setConfirmDietPlanId(null)}
      />

      <ConfirmModal
        isOpen={!!confirmNoteId}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
        confirmText="Delete"
        onConfirm={confirmDeleteNote}
        onCancel={() => setConfirmNoteId(null)}
      />
    </div>
  );
}
