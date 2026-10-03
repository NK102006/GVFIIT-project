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
import { Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import ConfirmModal from '../../components/ConfirmModal';
import type { Profile } from '../../contexts/AuthContext';

type CoachOption = {
  id: string;
  fullName: string;
};

type ClientFormState = {
  fullName: string;
  email: string;
  phone: string;
  membershipStatus: Profile['membershipStatus'];
  planType: Profile['planType'];
  planStart: string;
  planExpiry: string;
  assignedCoachId: string;
};

const emptyForm: ClientFormState = {
  fullName: '',
  email: '',
  phone: '',
  membershipStatus: 'TRIAL',
  planType: 'NONE',
  planStart: '',
  planExpiry: '',
  assignedCoachId: '',
};

export default function Clients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadClients = async () => {
    if (!db?.app) {
      setError('Firebase is not configured. Add your VITE_FIREBASE_* values to .env.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [clientsSnap, coachesSnap] = await Promise.all([
        getDocs(query(collection(db, 'profiles'), where('role', '==', 'CLIENT'))),
        getDocs(collection(db, 'coaches')),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const loadedClients = await Promise.all(
        clientsSnap.docs.map(async (d) => {
          const data = d.data() as Profile;
          if (data.planExpiry && (data.membershipStatus === 'ACTIVE' || data.membershipStatus === 'TRIAL')) {
            const expiryDate = new Date(data.planExpiry);
            if (expiryDate < today) {
              try {
                await updateDoc(doc(db, 'profiles', d.id), { membershipStatus: 'EXPIRED' });
                data.membershipStatus = 'EXPIRED';
              } catch (e) {
                console.error('Failed to auto-expire client:', e);
              }
            }
          }
          return { ...data, id: d.id };
        })
      );

      setClients(loadedClients);
      setCoaches(
        coachesSnap.docs
          .map((d) => ({ id: d.id, fullName: d.data().fullName } as CoachOption))
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (client: Profile & { planStart?: string; assignedCoachId?: string }) => {
    setEditingId(client.id);
    setForm({
      fullName: client.fullName,
      email: client.email,
      phone: client.phone || '',
      membershipStatus: client.membershipStatus,
      planType: client.planType,
      planStart: client.planStart || '',
      planExpiry: client.planExpiry || '',
      assignedCoachId: client.assignedCoachId || '',
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
        await updateDoc(doc(db, 'profiles', editingId), {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || null,
          membershipStatus: form.membershipStatus,
          planType: form.planType,
          planStart: form.planStart || null,
          planExpiry: form.planExpiry || null,
          assignedCoachId: form.assignedCoachId || null,
          assignedCoachName: selectedCoach?.fullName || null,
        });
      } else {
        await addDoc(collection(db, 'profiles'), {
          role: 'CLIENT',
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || null,
          membershipStatus: form.membershipStatus,
          planType: form.planType,
          planStart: form.planStart || null,
          planExpiry: form.planExpiry || null,
          assignedCoachId: form.assignedCoachId || null,
          assignedCoachName: selectedCoach?.fullName || null,
          avatar: null,
          createdAt: new Date().toISOString(),
        });
      }
      setModalOpen(false);
      await loadClients();
    } catch (err) {
      console.error(err);
      setError('Failed to save client.');
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
      await deleteDoc(doc(db, 'profiles', confirmDeleteId));
      setClients((prev) => prev.filter((c) => c.id !== confirmDeleteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete client.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filtered = clients.filter((c) => {
    const term = search.toLowerCase();
    return c.fullName.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Clients</h1>
          <p className="text-gray-400 text-sm">{clients.length} total</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold uppercase tracking-widest rounded-sm transition-colors"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-sm text-sm mb-4">
          {error}
        </div>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 pl-9 pr-3 py-2 border border-white/20 rounded-sm bg-zinc-900 text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm transition-colors"
        />
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm p-6">Loading clients...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No clients found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Coach</th>
                  <th className="px-5 py-3 font-medium">Plan Period</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((client) => {
                  const data = client as Profile & { planStart?: string; planExpiry?: string; assignedCoachName?: string };
                  const startStr = data.planStart ? new Date(data.planStart).toLocaleDateString() : null;
                  const endStr = data.planExpiry ? new Date(data.planExpiry).toLocaleDateString() : null;
                  const planLabel = startStr && endStr ? `${startStr} – ${endStr}` : startStr ? `From ${startStr}` : endStr ? `Until ${endStr}` : '—';
                  return (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium">{client.fullName}</td>
                    <td className="px-5 py-3 text-gray-400">{client.email}</td>
                    <td className="px-5 py-3 text-gray-400">{client.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-sm font-medium ${
                          client.membershipStatus === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-400'
                            : client.membershipStatus === 'TRIAL'
                            ? 'bg-blue-500/10 text-blue-400'
                            : client.membershipStatus === 'EXPIRED'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {client.membershipStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{data.assignedCoachName || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{planLabel}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          disabled={deletingId === client.id}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-sm transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-zinc-900 border border-white/10 rounded-sm w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-bold">{editingId ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Phone number must be exactly 10 digits"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setForm((f) => ({ ...f, phone: val }));
                  }}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={form.membershipStatus}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, membershipStatus: e.target.value as Profile['membershipStatus'] }))
                  }
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="TRIAL">Trial</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Plan / Package</label>
                <select
                  value={form.planType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, planType: e.target.value as Profile['planType'] }))
                  }
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="NONE">None</option>
                  <option value="Group Training (3 Months)">Group Training (3 Months)</option>
                  <option value="One to One Sessions">One to One Sessions</option>
                  <option value="Group Session (6 Months)">Group Session (6 Months)</option>
                </select>
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
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Plan Start Date</label>
                  <input
                    type="date"
                    value={form.planStart}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setForm((f) => ({
                        ...f,
                        planStart: newStart,
                        // Clear end date if it's now before the new start date
                        planExpiry: f.planExpiry && f.planExpiry < newStart ? '' : f.planExpiry,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Plan End Date</label>
                  <input
                    type="date"
                    value={form.planExpiry}
                    onChange={(e) => {
                      const newExpiry = e.target.value;
                      setForm((f) => ({
                        ...f,
                        planExpiry: newExpiry,
                        // Clear start date if it's now after the new end date
                        planStart: f.planStart && f.planStart > newExpiry ? '' : f.planStart,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {!editingId && (
                <p className="text-xs text-gray-500">
                  This creates a client record. They'll be linked to their own login automatically once they sign up
                  with this same email address.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
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
        title="Delete Client"
        message="Are you sure you want to delete this client? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
