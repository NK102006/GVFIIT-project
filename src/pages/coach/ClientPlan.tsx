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
import { ArrowLeft, Plus, Trash2, Save, Dumbbell, Activity, FileText, Loader2, X, ClipboardList, ChevronDown } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import MetricsTracker from '../../components/MetricsTracker';
import ConfirmModal from '../../components/ConfirmModal';
import SCAssessmentTab from '../../components/SCAssessmentTab';
import type { Profile } from '../../contexts/AuthContext';
import type { Exercise, ExercisePlan } from '../../types/exercisePlan';



function emptyExercise(): Exercise {
  return { id: crypto.randomUUID(), name: '', sets: 3, reps: 10, notes: '' };
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
  const [activeTab, setActiveTab] = useState<'EXERCISE' | 'ASSESSMENT' | 'METRICS' | 'NOTES'>('EXERCISE');

  // =====================
  // EXERCISE PLAN STATE
  // =====================
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([]);
  const [editingExPlanId, setEditingExPlanId] = useState<string | null>(null);
  const [exTitle, setExTitle] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);
  const [showExPlanModal, setShowExPlanModal] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  const togglePlan = (id: string) => {
    setExpandedPlans((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  // =====================
  // COACH NOTES STATE
  // =====================
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // =====================
  // DELETE CONFIRMATION STATE
  // =====================
  const [confirmExPlanId, setConfirmExPlanId] = useState<string | null>(null);

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
        const data = clientSnap.data() as Profile;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (data.planExpiry && (data.membershipStatus === 'ACTIVE' || data.membershipStatus === 'TRIAL')) {
          const expiryDate = new Date(data.planExpiry);
          if (expiryDate < today) {
            try {
              await updateDoc(doc(db, 'profiles', clientId), { membershipStatus: 'EXPIRED' });
              data.membershipStatus = 'EXPIRED';
            } catch (e) {
              console.error('Failed to auto-expire client:', e);
            }
          }
        }

        setClient({ ...data, id: clientSnap.id });
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
    setShowExPlanModal(false);
  };

  const openNewExPlan = () => {
    setEditingExPlanId(null);
    setExTitle('');
    setExercises([emptyExercise()]);
    setShowExPlanModal(true);
  };

  const startEditExPlan = (plan: ExercisePlan) => {
    setEditingExPlanId(plan.id);
    setExTitle(plan.title);
    setExercises(plan.exercises.length ? plan.exercises : [emptyExercise()]);
    setShowExPlanModal(true);
  };

  const updateExercise = (id: string, patch: Partial<Exercise>) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  };


  const removeExerciseRow = (id: string) =>
    setExercises((prev) => (prev.length > 1 ? prev.filter((ex) => ex.id !== id) : prev));

  const handleSaveExPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app || !clientId || !client) return;
    setSaving(true);
    try {
      const cleanExercises = exercises
        .filter((ex) => ex.name.trim().length > 0)
        .map((ex) => ({ ...ex, sets: Number(ex.sets) || 0, reps: Number(ex.reps) || 0 }));

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
      setShowExPlanModal(false);
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
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'EXERCISE' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
            }`}
        >
          <Dumbbell size={16} />
          Exercise Plans
        </button>
        <button
          onClick={() => setActiveTab('ASSESSMENT')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ASSESSMENT' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
            }`}
        >
          <ClipboardList size={16} />
          S&C Assessment
        </button>
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'METRICS' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
            }`}
        >
          <Activity size={16} />
          Fitness Metrics
        </button>
        <button
          onClick={() => setActiveTab('NOTES')}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'NOTES' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-white'
            }`}
        >
          <FileText size={16} />
          Coach Notes
        </button>
      </div>

      {/* TAB CONTENT: EXERCISE PLANS */}
      {activeTab === 'EXERCISE' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold">Saved Plans</h2>
            <button
              onClick={openNewExPlan}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-sm transition-colors"
            >
              <Plus size={16} />
              Add New Exercise Plan
            </button>
          </div>
          {exercisePlans.length === 0 ? (
            <p className="text-gray-500 text-sm">No plans yet — click the button above to create one.</p>
          ) : (
            <div className="space-y-4">
              {exercisePlans.map((plan) => (
                <div key={plan.id} className="bg-zinc-900 border border-white/10 rounded-md overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => togglePlan(plan.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-sm text-gray-300">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{plan.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''} · by {plan.coachName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditExPlan(plan); }}
                        className="text-xs text-accent hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteExPlan(plan.id); }}
                        className="text-gray-500 hover:text-red-400 transition-colors mr-2"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandedPlans[plan.id] ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {expandedPlans[plan.id] && (
                    <div className="px-4 pb-4 border-t border-accent/20 pt-4">
                      <div className="overflow-x-auto border border-white/5 rounded-sm">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <tbody>
                            {Object.entries(
                              plan.exercises.reduce((acc, ex) => {
                                const d = ex.day || 'Day 1';
                                if (!acc[d]) acc[d] = [];
                                acc[d].push(ex);
                                return acc;
                              }, {} as Record<string, typeof plan.exercises>)
                            ).map(([dayName, exList]) => {
                              const groupTitle = exList[0]?.dayTitle || '';
                              return (
                                <React.Fragment key={dayName}>
                                  <tr className="bg-white/5 border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="px-2 py-1.5 w-24">Day</th>
                                    <th className="px-2 py-1.5">Exercise</th>
                                    <th className="px-2 py-1.5">Sets/Reps</th>
                                    <th className="px-2 py-1.5">Weight</th>
                                    <th className="px-2 py-1.5">RPE</th>
                                    <th className="px-2 py-1.5">Rest</th>
                                  </tr>
                                  {groupTitle && (
                                    <tr className="bg-white/5">
                                      <td colSpan={6} className="px-3 py-2 font-bold text-sm text-white uppercase tracking-wide">
                                        {dayName} — {groupTitle}
                                      </td>
                                    </tr>
                                  )}
                                  {exList.map((ex, idx) => (
                                    <tr key={ex.id} className="border-b border-white/5 last:border-0 text-gray-300 hover:bg-white/5 transition-colors">
                                      {idx === 0 && (
                                        <td className="px-3 py-2 align-top border-r border-white/5 bg-accent/10" rowSpan={exList.length}>
                                          <div className="font-bold text-accent">{dayName}</div>
                                        </td>
                                      )}
                                      <td className="px-3 py-2 font-medium">{ex.name}</td>
                                      <td className="px-3 py-2">{ex.setsReps || (ex.sets ? `${ex.sets}x${ex.reps}` : '-')}</td>
                                      <td className="px-3 py-2">{ex.weight || '-'}</td>
                                      <td className="px-3 py-2">{ex.rpe || '-'}</td>
                                      <td className="px-3 py-2">{ex.rest || '-'}</td>
                                    </tr>
                                  ))}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXERCISE PLAN MODAL */}
      {showExPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-md w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-heading font-bold">
                {editingExPlanId ? 'Edit Exercise Plan' : 'New Exercise Plan'}
              </h2>
              <button
                onClick={() => { setShowExPlanModal(false); startNewExPlan(); }}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-sm hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveExPlan} className="p-6 space-y-4">
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
                  <tbody>
                    {Object.entries(
                      exercises.reduce((acc, ex) => {
                        const d = ex.day || 'Day 1';
                        if (!acc[d]) acc[d] = [];
                        acc[d].push(ex);
                        return acc;
                      }, {} as Record<string, typeof exercises>)
                    ).map(([dayName, exList]) => {
                      const groupTitle = exList[0]?.dayTitle || '';
                      return (
                        <React.Fragment key={dayName}>
                          <tr className="bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <th className="px-3 py-2 font-semibold w-28">Day</th>
                            <th className="px-3 py-2 font-semibold">Exercise</th>
                            <th className="px-3 py-2 font-semibold">Sets/Reps</th>
                            <th className="px-3 py-2 font-semibold">Weight</th>
                            <th className="px-3 py-2 font-semibold">RPE</th>
                            <th className="px-3 py-2 font-semibold">Rest</th>
                            <th className="px-3 py-2 font-semibold w-10"></th>
                          </tr>
                          <tr className="bg-white/5">
                            <td colSpan={7} className="px-3 py-2">
                              <input
                                type="text"
                                placeholder="e.g. Upper Body, Calisthenics..."
                                value={groupTitle}
                                onChange={(e) => {
                                  const newTitle = e.target.value;
                                  setExercises(prev => prev.map(p => (p.day || 'Day 1') === dayName ? { ...p, dayTitle: newTitle } : p));
                                }}
                                className="w-full px-2 py-1 bg-black/50 border border-transparent hover:border-white/20 focus:border-accent rounded-sm outline-none transition-colors font-bold text-white text-sm"
                              />
                            </td>
                          </tr>
                          {exList.map((ex, idx) => (
                            <tr key={ex.id} className="border-b border-white/5 last:border-0">
                              {idx === 0 && (
                                <td className="p-2 align-top border-r border-white/5 bg-accent/5" rowSpan={exList.length}>
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
                                        newEx.dayTitle = groupTitle;
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
                              <td className="p-1 w-24">
                                <input
                                  type="text"
                                  placeholder="e.g. 10kg"
                                  value={ex.weight || ''}
                                  onChange={(e) => updateExercise(ex.id, { weight: e.target.value })}
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
                      );
                    })}
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
                <button
                  type="button"
                  onClick={() => { setShowExPlanModal(false); startNewExPlan(); }}
                  className="flex-1 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  {saving ? <><Loader2 size={16} className="animate-spin inline mr-2" />Saving...</> : editingExPlanId ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASSESSMENT */}
      {activeTab === 'ASSESSMENT' && clientId && (
        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6 mb-6">
          <SCAssessmentTab clientId={clientId} clientName={client?.fullName || ''} coachName={coachName} />
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
                {saving ? <><Loader2 size={16} className="animate-spin inline mr-2" />Saving...</> : 'Add Note'}
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
