import React, { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { Plus, Save, Trash2, X, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import ConfirmModal from './ConfirmModal';
import { type SCAssessment, emptySCAssessment } from '../types/scAssessment';

interface Props {
  clientId: string;
  clientName: string;
  coachName: string;
}


// Helper for text inputs
const Txt = ({ label, field, formData, setFormData }: { label: string, field: string, formData: any, setFormData: any }) => (
  <div className="flex items-center border border-white/10 bg-black/30 p-1 gap-1">
    <div className="w-1/2 text-[10px] font-bold text-gray-400 uppercase px-2">{label}</div>
    <input type="text" className="w-1/2 bg-black/50 border border-white/10 rounded-sm text-sm px-2 py-1 outline-none text-white focus:border-accent transition-colors" value={formData[field] as string} onChange={e => setFormData({ ...formData, [field]: e.target.value })} />
  </div>
);

// Helper for nested ValPair
const Val = ({ label, field, placeholder = "", formData, setFormData }: { label: string, field: string, placeholder?: string, formData: any, setFormData: any }) => {
  const data = formData[field] as { val: string, notes: string };
  return (
    <div className="flex items-center border border-white/10 bg-black/30 p-1 gap-1">
      <div className="w-1/3 text-[10px] font-bold text-gray-400 uppercase px-2">{label}</div>
      <input type="text" placeholder={placeholder} className="w-1/3 bg-black/50 border border-white/10 rounded-sm text-sm px-2 py-1 outline-none text-white focus:border-accent transition-colors" value={data.val} onChange={e => setFormData({ ...formData, [field]: { ...data, val: e.target.value } })} />
      <input type="text" placeholder="Notes" className="w-1/3 bg-black/50 border border-white/10 rounded-sm text-xs px-2 py-1 outline-none text-gray-400 focus:border-accent transition-colors" value={data.notes} onChange={e => setFormData({ ...formData, [field]: { ...data, notes: e.target.value } })} />
    </div>
  );
};

// Helper for nested LRPair
const LR = ({ label, field, formData, setFormData }: { label: string, field: string, formData: any, setFormData: any }) => {
  const data = formData[field] as { r: string, l: string, notes: string };
  return (
    <div className="flex items-center border border-white/10 bg-black/30 p-1 gap-1">
      <div className="w-1/3 text-[10px] font-bold text-gray-400 uppercase px-2">{label}</div>
      <div className="w-1/3 flex gap-1">
        <input type="text" placeholder="R" className="w-1/2 bg-black/50 border border-white/10 rounded-sm text-sm px-1 py-1 outline-none text-white focus:border-accent transition-colors text-center" value={data.r} onChange={e => setFormData({ ...formData, [field]: { ...data, r: e.target.value } })} />
        <input type="text" placeholder="L" className="w-1/2 bg-black/50 border border-white/10 rounded-sm text-sm px-1 py-1 outline-none text-white focus:border-accent transition-colors text-center" value={data.l} onChange={e => setFormData({ ...formData, [field]: { ...data, l: e.target.value } })} />
      </div>
      <input type="text" placeholder="Notes" className="w-1/3 bg-black/50 border border-white/10 rounded-sm text-xs px-2 py-1 outline-none text-gray-400 focus:border-accent transition-colors" value={data.notes} onChange={e => setFormData({ ...formData, [field]: { ...data, notes: e.target.value } })} />
    </div>
  );
};

export default function SCAssessmentTab({ clientId, clientName, coachName }: Props) {
  const [assessments, setAssessments] = useState<SCAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState(emptySCAssessment());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'scAssessments'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as SCAssessment));
      loaded.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setAssessments(loaded);
    } catch (err) {
      console.error(err);
      setError('Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const openNew = () => {
    setViewOnly(false);
    setEditingId(null);
    setFormData(emptySCAssessment());
    setShowModal(true);
  };

  const openEdit = (assessment: SCAssessment) => {
    setViewOnly(false);
    setEditingId(assessment.id);
    const { id, clientId: cId, clientName: cName, coachName: coName, createdAt, updatedAt, ...rest } = assessment;
    // ensure deeply nested fields exist for older data
    const defaults = emptySCAssessment();
    setFormData({ ...defaults, ...rest });
    setShowModal(true);
  };

  
  const openView = (assessment: SCAssessment) => {
    setEditingId(assessment.id);
    const { id, clientId: cId, clientName: cName, coachName: coName, createdAt, updatedAt, ...rest } = assessment;
    const defaults = emptySCAssessment();
    setFormData({ ...defaults, ...rest });
    setViewOnly(true);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'scAssessments', editingId), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'scAssessments'), {
          ...formData,
          clientId,
          clientName,
          coachName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save assessment.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteDoc(doc(db, 'scAssessments', confirmDeleteId));
      setAssessments(prev => prev.filter(a => a.id !== confirmDeleteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete assessment.');
    } finally {
      setConfirmDeleteId(null);
    }
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold">Strength and conditioning assessment form</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-sm transition-colors">
          <Plus size={16} /> Add Assessment
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-sm text-sm mb-4">{error}</div>}
      
      {loading ? (
        <div className="text-gray-400 py-4">Loading...</div>
      ) : assessments.length === 0 ? (
        <p className="text-gray-500 text-sm">No assessments found. Create one above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map(a => (
            <div key={a.id} className="bg-zinc-900 border border-white/10 rounded-sm p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Strength and conditioning assessment form</h3>
                <p className="text-xs text-gray-500 mt-1">{a.date || 'Undated'} • {a.name || clientName}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => openView(a)} className="text-xs font-bold text-accent hover:text-white transition-colors">View</button>
                <button onClick={() => openEdit(a)} className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Edit</button>
                <button onClick={() => setConfirmDeleteId(a.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-md w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 sticky top-0 bg-zinc-900 z-10">
              <h2 className="text-lg font-heading font-bold">
                {viewOnly ? 'View Assessment' : editingId ? 'Edit Assessment' : 'New Assessment'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-sm hover:bg-white/10"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <fieldset disabled={viewOnly} className="space-y-6">
              {/* Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-2">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Assessment Info</h3>
                  <Txt formData={formData} setFormData={setFormData} label="S&C Name" field="name" />
                  <Txt formData={formData} setFormData={setFormData} label="Date" field="date" />
                  <Txt formData={formData} setFormData={setFormData} label="Time" field="time" />
                </div>
                <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-2">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Personal Details</h3>
                  <Txt formData={formData} setFormData={setFormData} label="Name" field="personalName" />
                  <Txt formData={formData} setFormData={setFormData} label="Contact" field="contact" />
                  <Txt formData={formData} setFormData={setFormData} label="Age" field="age" />
                  <Txt formData={formData} setFormData={setFormData} label="Gender" field="gender" />
                  <Txt formData={formData} setFormData={setFormData} label="Height (cm)" field="height" />
                  <Txt formData={formData} setFormData={setFormData} label="Weight (kg)" field="weight" />
                  <Txt formData={formData} setFormData={setFormData} label="Sport" field="sport" />
                  <Txt formData={formData} setFormData={setFormData} label="Proficiency" field="proficiency" />
                  <Txt formData={formData} setFormData={setFormData} label="Dominancy" field="dominancy" />
                  <Txt formData={formData} setFormData={setFormData} label="Strength Training Age" field="strengthTrainingAge" />
                  <Txt formData={formData} setFormData={setFormData} label="Conditioning Age" field="conditioningAge" />
                  <Txt formData={formData} setFormData={setFormData} label="Resting HR (RHR)" field="rhr" />
                  <Txt formData={formData} setFormData={setFormData} label="HR Variability (HRV)" field="hrv" />
                  <Txt formData={formData} setFormData={setFormData} label="Injury History" field="injuryHistory" />
                  <Txt formData={formData} setFormData={setFormData} label="Medical History" field="medicalHistory" />
                  <Txt formData={formData} setFormData={setFormData} label="Emergency Contact" field="emergencyContact" />
                </div>
              </div>

              {/* Body Comp */}
              <div className="bg-black/20 p-4 border border-white/5 rounded-sm">
                <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Body Composition and Girth Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-widest text-center">Skinfolds</div>
                    <div className="space-y-1">
                      <Txt formData={formData} setFormData={setFormData} label="Chest" field="chestSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Abdomen" field="abdomenSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Subscapula" field="subscapulaSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Calf" field="calfSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Thigh" field="thighSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Supraillium" field="suprailliumSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Midaxilla" field="midaxillaSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Tricep" field="tricepSkin" />
                      <Txt formData={formData} setFormData={setFormData} label="Body Fat (%)" field="bodyFat" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-widest text-center">Girth Measurements</div>
                    <div className="space-y-1">
                      <Txt formData={formData} setFormData={setFormData} label="Upper Arm" field="upperArmGirth" />
                      <Txt formData={formData} setFormData={setFormData} label="Chest" field="chestGirth" />
                      <Txt formData={formData} setFormData={setFormData} label="Hips" field="hipsGirth" />
                      <Txt formData={formData} setFormData={setFormData} label="Calf" field="calfGirth" />
                      <Txt formData={formData} setFormData={setFormData} label="Forearm" field="forearmGirth" />
                      <Txt formData={formData} setFormData={setFormData} label="Waist" field="waistGirth" />
                      <Txt formData={formData} setFormData={setFormData} label="Thigh" field="thighGirth" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Movement & Power */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-1">
                  <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Movement Profile</h3>
                  <Val formData={formData} setFormData={setFormData} label="Overhead Squat" field="overheadSquat" />
                  <LR formData={formData} setFormData={setFormData} label="ASLR" field="aslr" />
                  <LR formData={formData} setFormData={setFormData} label="Shoulder Mobility" field="shoulderMobility" />
                  <LR formData={formData} setFormData={setFormData} label="HK Ankle Mobility" field="hkAnkleMobility" />
                  <LR formData={formData} setFormData={setFormData} label="Rotary Stability" field="rotaryStability" />
                  <Val formData={formData} setFormData={setFormData} label="Trunk Stability Push Up" field="trunkStabilityPushUp" />
                  <LR formData={formData} setFormData={setFormData} label="SL Balance (Closed Eyes)" field="slBalance" />
                </div>
                <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-1">
                  <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Power Profile</h3>
                  <Val formData={formData} setFormData={setFormData} label="Broad Jump (m)" field="broadJump" />
                  <Val formData={formData} setFormData={setFormData} label="Vertical Jump (cm)" field="verticalJump" />
                  <LR formData={formData} setFormData={setFormData} label="HK Rotational Throw (kmph)" field="hkRotationalThrow" />
                  <Val formData={formData} setFormData={setFormData} label="Chest Pass (kmph)" field="chestPass" />
                  <Val formData={formData} setFormData={setFormData} label="OH Throw (kmph)" field="ohThrow" />
                </div>
              </div>

              {/* Speed & Physiology & Strength */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-1">
                  <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Speed & Physiology</h3>
                  <Val formData={formData} setFormData={setFormData} label="10m (s)" field="speed10m" />
                  <Val formData={formData} setFormData={setFormData} label="20m (s)" field="speed20m" />
                  <Val formData={formData} setFormData={setFormData} label="40m (s)" field="speed40m" />
                  <Val formData={formData} setFormData={setFormData} label="Flying 10m (s)" field="flying10m" />
                  <Val formData={formData} setFormData={setFormData} label="17.67m (s)" field="speed17_67m" />
                  <Val formData={formData} setFormData={setFormData} label="Run-a-3" field="runA3" />
                  <Val formData={formData} setFormData={setFormData} label="Run-up sprint" field="runUpSprint" />
                  <Val formData={formData} setFormData={setFormData} label="100m (s)" field="speed100m" />
                  <Val formData={formData} setFormData={setFormData} label="275m Shuttle (s)" field="shuttle275m" />
                  <Val formData={formData} setFormData={setFormData} label="1km (s)" field="speed1km" />
                  <Val formData={formData} setFormData={setFormData} label="YO-YO IR1" field="yoyoIR1" />
                  <Val formData={formData} setFormData={setFormData} label="MAS (m/s)" field="mas" />
                  <Val formData={formData} setFormData={setFormData} label="MSS (m/s)" field="mss" />
                  <Val formData={formData} setFormData={setFormData} label="ASR (m/s)" field="asr" />
                </div>
                <div className="space-y-4">
                  <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-1">
                    <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Strength Profile</h3>
                    <Val formData={formData} setFormData={setFormData} label="Squat (RM)" field="squatRM" />
                    <Val formData={formData} setFormData={setFormData} label="Bench Press (RM)" field="benchPressRM" />
                    <Val formData={formData} setFormData={setFormData} label="Deadlift (RM)" field="deadliftRM" />
                    <Val formData={formData} setFormData={setFormData} label="Bench Pull (RM)" field="benchPullRM" />
                  </div>
                  <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-1">
                    <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Muscle Endurance</h3>
                    <Val formData={formData} setFormData={setFormData} label="Push-ups" field="pushUps" />
                    <Val formData={formData} setFormData={setFormData} label="Chin-ups / Inverted Rows" field="chinUps" />
                    <Val formData={formData} setFormData={setFormData} label="Squats @ 25% BW (60s)" field="squats25BW" />
                    <LR formData={formData} setFormData={setFormData} label="SL Calf Raises" field="slCalfRaises" />
                  </div>
                  <div className="bg-black/20 p-4 border border-white/5 rounded-sm space-y-1">
                    <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Pillar Profile</h3>
                    <Val formData={formData} setFormData={setFormData} label="Plank" field="plank" />
                    <LR formData={formData} setFormData={setFormData} label="Side Plank" field="sidePlank" />
                    <LR formData={formData} setFormData={setFormData} label="Copenhagen Plank" field="copenhagenPlank" />
                    <Val formData={formData} setFormData={setFormData} label="Sorenson Hold" field="sorensonHold" />
                  </div>
                </div>
              </div>

              </fieldset>
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors">
                  {viewOnly ? 'Close' : 'Cancel'}
                </button>
                {!viewOnly && (
                  <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50">
                    <Save size={16} />
                    {saving ? <><Loader2 size={16} className="animate-spin inline" /> Saving...</> : editingId ? 'Update Assessment' : 'Save Assessment'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
