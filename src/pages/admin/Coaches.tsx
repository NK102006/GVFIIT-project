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
import { Plus, Pencil, Trash2, X, Search, Eye, EyeOff, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import ConfirmModal from '../../components/ConfirmModal';

type Coach = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone: string | null;
  specialization: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
};

type CoachFormState = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  specialization: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const emptyForm: CoachFormState = {
  fullName: '',
  email: '',
  username: '',
  password: '',
  phone: '',
  specialization: '',
  status: 'ACTIVE',
};

export default function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CoachFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loadCoaches = async () => {
    if (!db?.app) {
      setError('Firebase is not configured. Add your VITE_FIREBASE_* values to .env.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'coaches'));
      setCoaches(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coach)));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load coaches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (coach: Coach) => {
    setEditingId(coach.id);
    setForm({
      fullName: coach.fullName,
      email: coach.email,
      username: coach.username,
      password: '', // leave blank — only set if admin wants to change it
      phone: coach.phone || '',
      specialization: coach.specialization || '',
      status: coach.status,
    });
    setFormError(null);
    setShowPassword(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app) return;
    setFormError(null);

    // Validate username
    const trimmedUsername = form.username.trim().toLowerCase();
    if (!trimmedUsername) {
      setFormError('Username is required.');
      return;
    }

    // Check for duplicate username
    try {
      const q = query(collection(db, 'coaches'), where('username', '==', trimmedUsername));
      const snap = await getDocs(q);
      const duplicate = snap.docs.find((d) => d.id !== editingId);
      if (duplicate) {
        setFormError('A coach with this username already exists. Choose a different username.');
        return;
      }
    } catch (err) {
      console.error(err);
      setFormError('Failed to validate username uniqueness.');
      return;
    }

    // Password required on create
    if (!editingId && !form.password) {
      setFormError('Password is required when creating a new coach.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updateData: Record<string, unknown> = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          username: trimmedUsername,
          phone: form.phone.trim() || null,
          specialization: form.specialization.trim(),
          status: form.status,
        };
        // Only update password if the admin typed a new one
        if (form.password) {
          updateData.password = form.password;
        }
        await updateDoc(doc(db, 'coaches', editingId), updateData);
      } else {
        await addDoc(collection(db, 'coaches'), {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          username: trimmedUsername,
          password: form.password,
          phone: form.phone.trim() || null,
          specialization: form.specialization.trim(),
          status: form.status,
          createdAt: new Date().toISOString(),
        });
      }
      setModalOpen(false);
      await loadCoaches();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save coach.');
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
      await deleteDoc(doc(db, 'coaches', confirmDeleteId));
      setCoaches((prev) => prev.filter((c) => c.id !== confirmDeleteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete coach.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filtered = coaches.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.username.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Coaches</h1>
          <p className="text-gray-400 text-sm">{coaches.length} total</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold uppercase tracking-widest rounded-sm transition-colors"
        >
          <Plus size={16} />
          Add Coach
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
          placeholder="Search by name, email or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 pl-9 pr-3 py-2 border border-white/20 rounded-sm bg-zinc-900 text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm transition-colors"
        />
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm p-6">Loading coaches...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No coaches found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Username</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Specialization</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((coach) => (
                  <tr key={coach.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium">{coach.fullName}</p>
                      <p className="text-xs text-gray-500">{coach.phone || '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{coach.username}</td>
                    <td className="px-5 py-3 text-gray-400">{coach.email}</td>
                    <td className="px-5 py-3 text-gray-400">{coach.specialization || '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-sm font-medium ${
                          coach.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {coach.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coach)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(coach.id)}
                          disabled={deletingId === coach.id}
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-zinc-900 border border-white/10 rounded-sm w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-bold">{editingId ? 'Edit Coach' : 'Add Coach'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSave}>
              {formError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-sm text-sm">
                  {formError}
                </div>
              )}

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Password{editingId ? ' (leave blank to keep)' : ''}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingId}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="w-full px-3 py-2 pr-9 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Strength, Cardio"
                    value={form.specialization}
                    onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                {editingId
                  ? "Update the coach\u2019s details. Leave password blank to keep the current one."
                  : 'The coach will use their username and password to log in via the Staff tab on the login page.'}
              </p>

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
        title="Delete Coach"
        message="Are you sure you want to delete this coach account? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
