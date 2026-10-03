import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { Plus, Trash2, X, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import ConfirmModal from '../../components/ConfirmModal';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type IceBathSlot = {
  id: string;
  dayOfWeek: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format (always start + 20 mins)
  fee: number;
};

type IceBathBooking = {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  slotId: string;
  startTime: string;
  endTime: string;
  fee: number;
  timestamp: string;
  paymentStatus?: 'PAID' | 'UNPAID';
  status?: 'PENDING' | 'CONFIRMED';
};

// Helper to add 20 mins to an HH:mm time string
const calculateEndTime = (startTime: string) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes + 20, 0, 0);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function IceBathAdmin() {
  const [activeTab, setActiveTab] = useState<'SLOTS' | 'BOOKINGS'>('SLOTS');
  
  // Data State
  const [slots, setSlots] = useState<IceBathSlot[]>([]);
  const [bookings, setBookings] = useState<IceBathBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formDay, setFormDay] = useState(DAYS_OF_WEEK[0]);
  const [formTime, setFormTime] = useState('10:00');
  const [formFee, setFormFee] = useState('500');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [confirmDeleteSlotId, setConfirmDeleteSlotId] = useState<string | null>(null);
  const [confirmDeleteBookingId, setConfirmDeleteBookingId] = useState<string | null>(null);

  const loadSlots = async () => {
    try {
      const snap = await getDocs(collection(db, 'iceBathSlots'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as IceBathSlot));
      
      // Sort by day then by time
      const dayOrder = Object.fromEntries(DAYS_OF_WEEK.map((d, i) => [d, i]));
      data.sort((a, b) => {
        if (dayOrder[a.dayOfWeek] !== dayOrder[b.dayOfWeek]) {
          return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
        }
        return a.startTime.localeCompare(b.startTime);
      });
      setSlots(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load slots.');
    }
  };

  const loadBookings = async () => {
    try {
      const q = query(collection(db, 'iceBathBookings'), where('date', '==', selectedDate));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as IceBathBooking));
      data.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings.');
    }
  };

  const loadData = async () => {
    if (!db?.app) return;
    setLoading(true);
    setError(null);
    await Promise.all([loadSlots(), loadBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]); // Reload bookings when date changes

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db?.app) return;
    setSaving(true);
    setError(null);
    
    const feeNum = parseFloat(formFee);
    if (isNaN(feeNum) || feeNum < 0) {
      setError('Fee must be a valid number.');
      setSaving(false);
      return;
    }

    try {
      await addDoc(collection(db, 'iceBathSlots'), {
        dayOfWeek: formDay,
        startTime: formTime,
        endTime: calculateEndTime(formTime),
        fee: feeNum,
      });
      setModalOpen(false);
      await loadSlots();
    } catch (err) {
      console.error(err);
      setError('Failed to save slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = (id: string) => {
    if (!db?.app) return;
    setConfirmDeleteSlotId(id);
  };

  const confirmDeleteSlot = async () => {
    if (!confirmDeleteSlotId) return;
    setDeletingId(confirmDeleteSlotId);
    try {
      await deleteDoc(doc(db, 'iceBathSlots', confirmDeleteSlotId));
      setSlots((prev) => prev.filter((s) => s.id !== confirmDeleteSlotId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete slot.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteSlotId(null);
    }
  };
  
  const handleDeleteBooking = (id: string) => {
    if (!db?.app) return;
    setConfirmDeleteBookingId(id);
  };

  const confirmDeleteBooking = async () => {
    if (!confirmDeleteBookingId) return;
    setDeletingId(confirmDeleteBookingId);
    try {
      await deleteDoc(doc(db, 'iceBathBookings', confirmDeleteBookingId));
      setBookings((prev) => prev.filter((b) => b.id !== confirmDeleteBookingId));
    } catch (err) {
      console.error(err);
      setError('Failed to cancel booking.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteBookingId(null);
    }
  };


  const handlePaymentStatus = async (bookingId: string, status: 'PAID' | 'UNPAID') => {
    try {
      await updateDoc(doc(db, 'iceBathBookings', bookingId), {
        paymentStatus: status
      });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentStatus: status } : b));
    } catch (err) {
      console.error(err);
      setError('Failed to update payment status.');
    }
  };

  const handleBookingStatus = async (bookingId: string, status: 'PENDING' | 'CONFIRMED') => {
    try {
      await updateDoc(doc(db, 'iceBathBookings', bookingId), {
        status: status
      });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: status } : b));
    } catch (err) {
      console.error(err);
      setError('Failed to update booking status.');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Ice Bath Management</h1>
          <p className="text-gray-400 text-sm">Manage recurring slots and view client bookings</p>
        </div>
        {activeTab === 'SLOTS' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm font-medium transition-colors"
          >
            <Plus size={18} />
            <span>Add Slot</span>
          </button>
        )}
      </div>

      <div className="flex border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('SLOTS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'SLOTS' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Clock size={16} />
          Manage Slots
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'BOOKINGS' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CalendarDays size={16} />
          View Bookings
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">{error}</div>}

      {/* MANAGE SLOTS TAB */}
      {activeTab === 'SLOTS' && (
        <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
          {loading ? (
            <p className="text-gray-500 text-sm p-6">Loading slots...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500 text-sm p-6">No slots configured. Create a template to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Day</th>
                    <th className="px-5 py-3 font-medium">Time (20 mins)</th>
                    <th className="px-5 py-3 font-medium">Fee (₹)</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 font-medium">{slot.dayOfWeek}</td>
                      <td className="px-5 py-3 font-medium text-gray-300">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="px-5 py-3 font-bold text-green-400">₹{slot.fee}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={deletingId === slot.id}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-sm transition-colors disabled:opacity-50"
                            title="Delete Slot"
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
      )}

      {/* VIEW BOOKINGS TAB */}
      {activeTab === 'BOOKINGS' && (
        <>
          <div className="mb-6 bg-zinc-900 p-4 border border-white/10 rounded-sm inline-block">
            <label className="block text-xs font-medium text-gray-400 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
            {loading ? (
              <p className="text-gray-500 text-sm p-6">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500 text-sm p-6">No bookings for this date.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium">Client</th>
                      <th className="px-5 py-3 font-medium">Fee (₹)</th>
                      <th className="px-5 py-3 font-medium">Payment</th>
                      <th className="px-5 py-3 font-medium">Booking Status</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-300">
                          {booking.startTime} - {booking.endTime}
                        </td>
                        <td className="px-5 py-3 font-medium">{booking.clientName}</td>
                        <td className="px-5 py-3 font-bold text-green-400">₹{booking.fee}</td>
                        <td className="px-5 py-3">
                          <select
                            value={booking.paymentStatus || 'UNPAID'}
                            onChange={(e) => handlePaymentStatus(booking.id, e.target.value as 'PAID' | 'UNPAID')}
                            className={`px-2 py-1 text-xs font-bold rounded-sm border focus:outline-none transition-colors ${
                              (booking.paymentStatus || 'UNPAID') === 'PAID' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            <option value="UNPAID" className="bg-black text-white">Unpaid</option>
                            <option value="PAID" className="bg-black text-white">Paid</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={booking.status || 'PENDING'}
                            onChange={(e) => handleBookingStatus(booking.id, e.target.value as 'PENDING' | 'CONFIRMED')}
                            className={`px-2 py-1 text-xs font-bold rounded-sm border focus:outline-none transition-colors ${
                              (booking.status || 'PENDING') === 'CONFIRMED' 
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            <option value="PENDING" className="bg-black text-white">Pending</option>
                            <option value="CONFIRMED" className="bg-black text-white">Confirmed</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              disabled={deletingId === booking.id}
                              className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-sm transition-colors disabled:opacity-50"
                            >
                              Cancel Booking
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
        </>
      )}

      {/* Add Slot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-md w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-heading font-bold">Add Ice Bath Slot</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Day of Week</label>
                <select
                  required
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Start Time (24h)</label>
                <input
                  type="time"
                  required
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">End time will automatically be set to {formTime ? calculateEndTime(formTime) : '+20 mins'}.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Fee (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={formFee}
                  onChange={(e) => setFormFee(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-sm text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-sm text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin inline mr-2"/>Saving...</> : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteSlotId}
        title="Delete Slot"
        message="Are you sure you want to delete this slot? Future clients will not be able to book it."
        confirmText="Delete"
        onConfirm={confirmDeleteSlot}
        onCancel={() => setConfirmDeleteSlotId(null)}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteBookingId}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        onConfirm={confirmDeleteBooking}
        onCancel={() => setConfirmDeleteBookingId(null)}
      />
    </div>
  );
}
