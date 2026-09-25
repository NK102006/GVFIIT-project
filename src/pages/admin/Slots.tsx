import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
} from 'firebase/firestore';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import ConfirmModal from '../../components/ConfirmModal';

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedCoachId: string;
  assignedCoachName: string | null;
  capacity: number;
};

type CoachOption = {
  id: string;
  fullName: string;
};

type SlotBooking = {
  id: string;
  slotId: string;
  clientName: string;
};

type SlotFormState = Omit<Slot, 'id' | 'assignedCoachName'>;

const emptyForm: SlotFormState = {
  date: new Date().toISOString().split('T')[0],
  startTime: '06:00',
  endTime: '07:00',
  assignedCoachId: '',
  capacity: 1,
};

export default function Slots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlotFormState>(emptyForm);
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
      const [slotsSnap, coachesSnap, bookingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'slots'))),
        getDocs(collection(db, 'coaches')),
        getDocs(collection(db, 'slotBookings')),
      ]);
      setSlots(slotsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Slot)));
      setCoaches(coachesSnap.docs.map((d) => ({ id: d.id, fullName: d.data().fullName } as CoachOption)));
      setBookings(bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as SlotBooking)));
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
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (slot: Slot) => {
    setEditingId(slot.id);
    setForm({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      assignedCoachId: slot.assignedCoachId || '',
      capacity: slot.capacity || 1,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app) return;
    setSaving(true);
    const selectedCoach = coaches.find((c) => c.id === form.assignedCoachId);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'slots', editingId), {
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          assignedCoachId: form.assignedCoachId || null,
          assignedCoachName: selectedCoach?.fullName || null,
          capacity: Number(form.capacity),
        });
      } else {
        await addDoc(collection(db, 'slots'), {
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          assignedCoachId: form.assignedCoachId || null,
          assignedCoachName: selectedCoach?.fullName || null,
          capacity: Number(form.capacity),
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to save slot.');
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
      await deleteDoc(doc(db, 'slots', confirmDeleteId));
      setSlots((prev) => prev.filter((s) => s.id !== confirmDeleteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete slot.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Sort slots by date then by start time
  const sortedSlots = [...slots].sort((a, b) => {
    const dateDiff = a.date.localeCompare(b.date);
    if (dateDiff !== 0) return dateDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  const getSlotBookingsCount = (slotId: string) => {
    return bookings.filter(b => b.slotId === slotId).length;
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Slots</h1>
          <p className="text-gray-400 text-sm">{slots.length} total</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Add Slot</span>
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">{error}</div>}

      <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm p-6">Loading slots...</p>
        ) : sortedSlots.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No slots found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Coach</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium">{slot.date}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-gray-400">{slot.assignedCoachName || '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      {(() => {
                        const count = getSlotBookingsCount(slot.id);
                        const capacity = slot.capacity || 1;
                        return count > 0 ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest ${
                            count >= capacity 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            Booked ({count}/{capacity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest bg-zinc-800 text-gray-400 border border-white/10">
                            Available (0/{capacity})
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(slot)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
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
              <h2 className="text-lg font-heading font-bold">{editingId ? 'Edit Slot' : 'Add Slot'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Assigned Coach</label>
                <select
                  value={form.assignedCoachId}
                  onChange={(e) => setForm((f) => ({ ...f, assignedCoachId: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">No coach assigned</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
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
                  disabled={saving}
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
        title="Delete Slot"
        message="Are you sure you want to delete this slot? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
