import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import ConfirmModal from '../../components/ConfirmModal';
import type { Profile } from '../../contexts/AuthContext';

type AttendanceRecord = {
  id: string;
  userId: string;
  userName: string;
  userType: 'CLIENT';
  date: string;
  status: 'PRESENT' | 'ABSENT';
  timestamp: string;
};

type Option = {
  id: string;
  name: string;
};

export default function CoachAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [clientOptions, setClientOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formUserId, setFormUserId] = useState('');
  const [formStatus, setFormStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [formDate, setFormDate] = useState(selectedDate);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    if (!db?.app) {
      setError('Firebase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch attendance records for clients for the selected date
      const q = query(
        collection(db, 'attendance'),
        where('date', '==', selectedDate),
        where('userType', '==', 'CLIENT')
      );
      const snap = await getDocs(q);
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord)));

      // Load client options only once
      if (clientOptions.length === 0) {
        const clientsSnap = await getDocs(query(collection(db, 'profiles'), where('role', '==', 'CLIENT')));
        const opts = clientsSnap.docs.map((d) => ({
          id: d.id,
          name: (d.data() as Profile).fullName,
        }));
        opts.sort((a, b) => a.name.localeCompare(b.name));
        setClientOptions(opts);
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormUserId('');
    setFormStatus('PRESENT');
    setFormDate(selectedDate);
    setModalOpen(true);
  };

  const openEditModal = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setFormUserId(record.userId);
    setFormStatus(record.status);
    setFormDate(record.date);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app) return;

    const today = new Date().toISOString().split('T')[0];
    if (formDate > today) {
      setError('Attendance cannot be marked for future dates.');
      return;
    }

    setSaving(true);
    setError(null);
    
    const userOpt = clientOptions.find((u) => u.id === formUserId);
    if (!userOpt) {
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'attendance', editingId), {
          userId: formUserId,
          userName: userOpt.name,
          userType: 'CLIENT',
          date: formDate,
          status: formStatus,
        });
      } else {
        await addDoc(collection(db, 'attendance'), {
          userId: formUserId,
          userName: userOpt.name,
          userType: 'CLIENT',
          date: formDate,
          status: formStatus,
          timestamp: new Date().toISOString(),
        });
      }
      setModalOpen(false);
      
      if (formDate === selectedDate) {
        await loadData();
      } else {
        setSelectedDate(formDate);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!db?.app) return;
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await deleteDoc(doc(db, 'attendance', confirmDeleteId));
      setRecords((prev) => prev.filter((r) => r.id !== confirmDeleteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete attendance.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Client Attendance</h1>
          <p className="text-gray-400 text-sm">Manage daily attendance records for your clients</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Add Record</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-zinc-900 p-4 border border-white/10 rounded-sm">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">{error}</div>}

      <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm p-6">Loading records...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No attendance records found for this date.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Time Marked</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium">{record.userName}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-sm font-medium ${
                          record.status === 'PRESENT'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(record)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-sm transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-md w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-heading font-bold">{editingId ? 'Edit Record' : 'Add Record'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Client</label>
                <select
                  required
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">Select Client...</option>
                  {clientOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'PRESENT' | 'ABSENT')}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-sm text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formUserId}
                  className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin inline mr-2"/>Saving...</> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Record"
        message="Are you sure you want to delete this attendance record? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
