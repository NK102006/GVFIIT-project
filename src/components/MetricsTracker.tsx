import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Trash2, Save, Activity, FileText, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import ConfirmModal from './ConfirmModal';

type MetricRecord = {
  id: string;
  clientId: string;
  weight: number;
  targetWeight: number;
  bodyFatPercentage: number;
  muscleMassPercentage: number;
  bmiScore: number;
  reportUrl?: string;
  date: string;
  timestamp: string;
};

type MetricsTrackerProps = {
  clientId: string;
  readOnly?: boolean;
};

export default function MetricsTracker({ clientId, readOnly = false }: MetricsTrackerProps) {
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formWeight, setFormWeight] = useState('');
  const [formTargetWeight, setFormTargetWeight] = useState('');
  const [formBodyFat, setFormBodyFat] = useState('');
  const [formMuscleMass, setFormMuscleMass] = useState('');
  const [formBmi, setFormBmi] = useState('');

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadMetrics = async () => {
    if (!db?.app || !clientId) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'clientMetrics'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MetricRecord));
      
      // Sort by date ascending for the chart
      data.sort((a, b) => a.date.localeCompare(b.date));
      setMetrics(data);

      // Pre-fill and fix Target Weight if it already exists
      if (data.length > 0) {
        const lastTarget = data[data.length - 1].targetWeight;
        if (lastTarget) {
          setFormTargetWeight(lastTarget.toString());
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load metrics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !db?.app) return;
    
    const weight = parseFloat(formWeight);
    const targetWeight = parseFloat(formTargetWeight);
    const bodyFat = parseFloat(formBodyFat);
    const muscleMass = parseFloat(formMuscleMass);
    const bmi = parseFloat(formBmi);
    
    if ([weight, targetWeight, bodyFat, muscleMass, bmi].some(isNaN)) {
      setError('Please enter valid numeric values for all fields.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let reportUrl = '';

      await addDoc(collection(db, 'clientMetrics'), {
        clientId,
        weight,
        targetWeight,
        bodyFatPercentage: bodyFat,
        muscleMassPercentage: muscleMass,
        bmiScore: bmi,
        reportUrl,
        date: formDate,
        timestamp: new Date().toISOString()
      });
      
      // Reset form
      setFormWeight('');
      setFormTargetWeight('');
      setFormBodyFat('');
      setFormMuscleMass('');
      setFormBmi('');

      await loadMetrics();
    } catch (err: any) {
      console.error("Firestore save error:", err);
      setError(`Failed to save metrics to database. Error: ${err.message || 'Unknown'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (readOnly || !db?.app) return;
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await deleteDoc(doc(db, 'clientMetrics', confirmDeleteId));
      setMetrics((prev) => prev.filter((m) => m.id !== confirmDeleteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete record.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return metrics.map(m => ({
      ...m,
      displayDate: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));
  }, [metrics]);

  if (loading) {
    return <div className="text-gray-400 p-4">Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">
          {error}
        </div>
      )}

      {!readOnly && (
        <div className="bg-zinc-900 border border-white/10 rounded-sm p-5">
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            Log Body Composition
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="20"
                  placeholder="e.g. 70.5"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="20"
                  placeholder="e.g. 65.0"
                  value={formTargetWeight}
                  onChange={(e) => setFormTargetWeight(e.target.value)}
                  disabled={metrics.length > 0 && metrics[metrics.length - 1].targetWeight > 0}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Body Fat (%)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 15.5"
                  value={formBodyFat}
                  onChange={(e) => setFormBodyFat(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Muscle Mass (%)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 40.0"
                  value={formMuscleMass}
                  onChange={(e) => setFormMuscleMass(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">BMI Score</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 23.5"
                  value={formBmi}
                  onChange={(e) => setFormBmi(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? <><Loader2 size={16} className="animate-spin inline mr-2"/>Saving...</> : 'Save Log'}
              </button>
            </div>
          </form>
        </div>
      )}

      {metrics.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-sm p-8 text-center text-gray-500">
          No metrics logged yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-sm p-5">
            <h3 className="text-lg font-heading font-bold mb-6 text-center">Progress Overview</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="displayDate" stroke="#888" fontSize={12} tickMargin={10} />
                  
                  {/* Left Axis for Weights */}
                  <YAxis yAxisId="left" stroke="#888" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                  
                  {/* Right Axis for Percentages & BMI */}
                  <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '4px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  
                  <Line yAxisId="left" type="monotone" name="Weight (kg)" dataKey="weight" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
                  
                  <Line yAxisId="right" type="monotone" name="Body Fat (%)" dataKey="bodyFatPercentage" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" name="Muscle Mass (%)" dataKey="muscleMassPercentage" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" name="BMI" dataKey="bmiScore" stroke="#a855f7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History List */}
          <div className="bg-zinc-900 border border-white/10 rounded-sm p-5 flex flex-col max-h-[26rem]">
            <h3 className="text-lg font-heading font-bold mb-4">History</h3>
            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {/* Display reversed so newest is on top */}
              {[...metrics].reverse().map((record) => (
                <div key={record.id} className="bg-black/50 border border-white/5 p-3 rounded-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-300">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-400">
                    <div>W: <strong className="text-gray-200">{record.weight}</strong> kg</div>
                    <div>Target: <strong className="text-gray-200">{record.targetWeight}</strong> kg</div>
                    <div>Fat: <strong className="text-red-400">{record.bodyFatPercentage}%</strong></div>
                    <div>Muscle: <strong className="text-emerald-400">{record.muscleMassPercentage}%</strong></div>
                    <div>BMI: <strong className="text-gray-200">{record.bmiScore}</strong></div>
                  </div>
                  
                  {record.reportUrl && (
                    <a
                      href={record.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center justify-center gap-1.5 py-1.5 w-full bg-white/5 hover:bg-white/10 text-accent text-xs font-bold rounded-sm transition-colors"
                    >
                      <FileText size={14} />
                      View Report
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Record"
        message="Are you sure you want to delete this metric record?"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
