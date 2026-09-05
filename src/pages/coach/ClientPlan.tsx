import { useEffect, useState } from 'react';
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
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { Profile } from '../../contexts/AuthContext';
import type { Exercise, ExercisePlan } from '../../types/exercisePlan';

function emptyExercise(): Exercise {
  return { id: crypto.randomUUID(), name: '', sets: 3, reps: 10, notes: '' };
}

export default function ClientPlan() {
  const { clientId } = useParams<{ clientId: string }>();
  const { profile, staff } = useAuth();
  const coachName = profile?.fullName || staff?.name || 'Coach';

  const [client, setClient] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<ExercisePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Editor state for either a new plan or an existing one being edited
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);

  const loadData = async () => {
    if (!db?.app || !clientId) {
      setError('Firebase is not configured, or no client was specified.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const clientSnap = await getDoc(doc(db, 'profiles', clientId));
      if (clientSnap.exists()) {
        setClient({ id: clientSnap.id, ...clientSnap.data() } as Profile);
      } else {
        setClient(null);
        setError('Client not found.');
      }

      const plansQuery = query(collection(db, 'exercisePlans'), where('clientId', '==', clientId));
      const plansSnap = await getDocs(plansQuery);
      const loaded = plansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ExercisePlan));
      loaded.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      setPlans(loaded);
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

  const startNewPlan = () => {
    setEditingPlanId(null);
    setTitle('');
    setExercises([emptyExercise()]);
  };

  const startEditPlan = (plan: ExercisePlan) => {
    setEditingPlanId(plan.id);
    setTitle(plan.title);
    setExercises(plan.exercises.length ? plan.exercises : [emptyExercise()]);
  };

  const updateExercise = (id: string, patch: Partial<Exercise>) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)));
  };

  const addExerciseRow = () => setExercises((prev) => [...prev, emptyExercise()]);

  const removeExerciseRow = (id: string) =>
    setExercises((prev) => (prev.length > 1 ? prev.filter((ex) => ex.id !== id) : prev));

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app || !clientId || !client) return;
    setSaving(true);
    try {
      const cleanExercises = exercises
        .filter((ex) => ex.name.trim().length > 0)
        .map((ex) => ({ ...ex, sets: Number(ex.sets) || 0, reps: Number(ex.reps) || 0 }));

      if (editingPlanId) {
        await updateDoc(doc(db, 'exercisePlans', editingPlanId), {
          title,
          exercises: cleanExercises,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'exercisePlans'), {
          clientId,
          clientName: client.fullName,
          title,
          coachName,
          exercises: cleanExercises,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      startNewPlan();
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!db?.app) return;
    if (!window.confirm('Delete this exercise plan?')) return;
    try {
      await deleteDoc(doc(db, 'exercisePlans', planId));
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      if (editingPlanId === planId) startNewPlan();
    } catch (err) {
      console.error(err);
      setError('Failed to delete plan.');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading client...</div>;
  }

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-red-400 mb-4">{error || 'Client not found.'}</p>
        <Link to="/coach" className="text-accent hover:text-white transition-colors text-sm">
          ← Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <Link to="/coach" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Existing plans */}
        <div>
          <h2 className="text-lg font-heading font-bold mb-3">Exercise Plans</h2>
          {plans.length === 0 ? (
            <p className="text-gray-500 text-sm">No plans yet — create one on the right.</p>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
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
                        onClick={() => startEditPlan(plan)}
                        className="text-xs text-accent hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {plan.exercises.map((ex) => (
                      <li key={ex.id} className="text-xs text-gray-400 flex justify-between">
                        <span>{ex.name}</span>
                        <span>
                          {ex.sets} × {ex.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div>
          <h2 className="text-lg font-heading font-bold mb-3">
            {editingPlanId ? 'Edit Plan' : 'New Plan'}
          </h2>
          <form onSubmit={handleSavePlan} className="bg-zinc-900 border border-white/10 rounded-sm p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Plan Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 1 — Upper Body"
                className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="space-y-3">
              {exercises.map((ex, idx) => (
                <div key={ex.id} className="border border-white/10 rounded-sm p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Exercise {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExerciseRow(ex.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Exercise name"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                    className="w-full mb-2 px-3 py-1.5 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Sets"
                      value={ex.sets}
                      onChange={(e) => updateExercise(ex.id, { sets: Number(e.target.value) })}
                      className="px-3 py-1.5 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Reps"
                      value={ex.reps}
                      onChange={(e) => updateExercise(ex.id, { reps: Number(e.target.value) })}
                      className="px-3 py-1.5 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={ex.notes}
                    onChange={(e) => updateExercise(ex.id, { notes: e.target.value })}
                    className="w-full mt-2 px-3 py-1.5 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addExerciseRow}
              className="flex items-center gap-2 text-xs text-accent hover:text-white transition-colors"
            >
              <Plus size={14} />
              Add exercise
            </button>

            <div className="flex gap-3 pt-2">
              {editingPlanId && (
                <button
                  type="button"
                  onClick={startNewPlan}
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
                {saving ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Save Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
