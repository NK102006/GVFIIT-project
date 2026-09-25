import { useEffect, useState, useMemo } from 'react';
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
import { Plus, Pencil, Trash2, X, Search, IndianRupee, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import ConfirmModal from '../../components/ConfirmModal';
import type { Profile } from '../../contexts/AuthContext';

type PaymentRecord = {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
  timestamp: string;
};

type ClientOption = {
  id: string;
  name: string;
};

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

export default function Payments() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formClientId, setFormClientId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState(PAYMENT_METHODS[0]);
  const [formNotes, setFormNotes] = useState('');
  
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
      // Load Payments
      const paymentsSnap = await getDocs(collection(db, 'payments'));
      const loadedRecords = paymentsSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as PaymentRecord)
      );
      // Sort by date descending
      loadedRecords.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
      setRecords(loadedRecords);

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
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormClientId('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMethod(PAYMENT_METHODS[0]);
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (record: PaymentRecord) => {
    setEditingId(record.id);
    setFormClientId(record.clientId);
    setFormAmount(record.amount.toString());
    setFormDate(record.paymentDate);
    setFormMethod(record.paymentMethod);
    setFormNotes(record.notes || '');
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
    setError(null);
    
    const clientOpt = clientOptions.find((c) => c.id === formClientId);
    if (!clientOpt) {
      setSaving(false);
      setError('Invalid client selected.');
      return;
    }

    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSaving(false);
      setError('Amount must be a positive number.');
      return;
    }

    try {
      const payload = {
        clientId: formClientId,
        clientName: clientOpt.name,
        amount: amountNum,
        paymentDate: formDate,
        paymentMethod: formMethod,
        notes: formNotes,
      };

      if (editingId) {
        await updateDoc(doc(db, 'payments', editingId), payload);
      } else {
        await addDoc(collection(db, 'payments'), {
          ...payload,
          timestamp: new Date().toISOString(),
        });
      }
      setModalOpen(false);
      await loadData(); // Reload to get updated list
    } catch (err) {
      console.error(err);
      setError('Failed to save payment.');
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
      await deleteDoc(doc(db, 'payments', confirmDeleteId));
      setRecords((prev) => prev.filter((r) => r.id !== confirmDeleteId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete payment.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return records.filter(
      (r) => r.clientName.toLowerCase().includes(query) || r.notes.toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  const totalRevenue = useMemo(() => {
    return filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  }, [filteredRecords]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Payments</h1>
          <p className="text-gray-400 text-sm">Manage client fee payments and history</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm font-medium transition-colors whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Add Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 border border-white/10 p-6 rounded-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-sm border bg-green-500/10 border-green-500/20 text-green-400">
              <IndianRupee size={22} />
            </div>
          </div>
          <div className="text-2xl font-heading font-black text-white mb-1">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
            Total Revenue (Filtered)
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-white/10 p-6 rounded-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-sm border bg-blue-500/10 border-blue-500/20 text-blue-400">
              <Search size={22} />
            </div>
          </div>
          <div className="text-2xl font-heading font-black text-white mb-1">
            {filteredRecords.length}
          </div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
            Total Transactions
          </div>
        </div>
      </div>

      {/* Search / Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-zinc-900 p-4 border border-white/10 rounded-sm">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by client name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm p-6">Loading records...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">{new Date(record.paymentDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-medium">{record.clientName}</td>
                    <td className="px-5 py-3 font-bold text-green-400">₹{record.amount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-1 rounded-sm font-medium bg-white/10 text-gray-300">
                        {record.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs truncate max-w-xs" title={record.notes}>
                      {record.notes || '-'}
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
          <div className="bg-zinc-900 border border-white/10 rounded-md w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-heading font-bold">{editingId ? 'Edit Payment' : 'Add Payment'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Client</label>
                <select
                  required
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 5000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Payment Method</label>
                <select
                  required
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. September month fee"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
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
                  disabled={saving || !formClientId || !formAmount}
                  className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin inline mr-2"/>Saving...</> : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record? This cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
