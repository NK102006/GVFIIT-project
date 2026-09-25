import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Snowflake, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type IceBathSlot = {
  id: string;
  dayOfWeek: string;
  startTime: string; 
  endTime: string;   
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
};

export default function IceBathBooking() {
  const { user, profile } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  
  const [slots, setSlots] = useState<IceBathSlot[]>([]);
  const [bookings, setBookings] = useState<IceBathBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmSlot, setConfirmSlot] = useState<IceBathSlot | null>(null);

  const loadData = async () => {
    if (!db?.app) return;
    setLoading(true);
    setError(null);
    try {
      const dayIndex = new Date(selectedDate).getDay();
      const dayName = DAYS_OF_WEEK[dayIndex];

      const [slotsSnap, bookingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'iceBathSlots'), where('dayOfWeek', '==', dayName))),
        getDocs(query(collection(db, 'iceBathBookings'), where('date', '==', selectedDate)))
      ]);

      const loadedSlots = slotsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as IceBathSlot));
      loadedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setSlots(loadedSlots);

      setBookings(bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as IceBathBooking)));
    } catch (err) {
      console.error(err);
      setError('Failed to load slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleBook = (slot: IceBathSlot) => {
    if (!db?.app || !user || !profile) return;
    setConfirmSlot(slot);
  };

  const confirmBooking = async () => {
    if (!confirmSlot || !user || !profile) return;
    setBookingId(confirmSlot.id);
    try {
      await addDoc(collection(db, 'iceBathBookings'), {
        clientId: user.uid,
        clientName: profile.fullName,
        date: selectedDate,
        slotId: confirmSlot.id,
        startTime: confirmSlot.startTime,
        endTime: confirmSlot.endTime,
        fee: confirmSlot.fee,
        timestamp: new Date().toISOString(),
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to book slot. Please try again.');
    } finally {
      setBookingId(null);
      setConfirmSlot(null);
    }
  };

  // Determine if a slot is booked
  const isSlotBooked = (slotId: string) => bookings.some((b) => b.slotId === slotId);

  // Determine if the current user has booked a slot on this date
  const myBooking = useMemo(() => {
    if (!user) return null;
    return bookings.find((b) => b.clientId === user.uid);
  }, [bookings, user]);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
          <Snowflake size={24} />
        </div>
        <h1 className="text-3xl font-heading font-bold">Ice Bath Booking</h1>
      </div>
      <p className="text-gray-400 mb-8 ml-14">Accelerate recovery with a 20-minute guided ice bath session.</p>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">{error}</div>}

      <div className="bg-zinc-900 border border-white/10 p-6 rounded-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 text-gray-300 font-medium">
            <Calendar size={20} className="text-accent" />
            Select Date:
          </div>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-white/20 rounded-sm bg-black text-white focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {myBooking ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">You're Booked!</h2>
          <p className="text-emerald-400/80 mb-6 max-w-md mx-auto">
            You have an Ice Bath session confirmed on <strong className="text-emerald-400">{selectedDate}</strong> from <strong className="text-emerald-400">{myBooking.startTime} to {myBooking.endTime}</strong>.
          </p>
          <div className="inline-block px-4 py-2 bg-black/40 border border-emerald-500/30 rounded-sm text-sm text-gray-300">
            Fee to be paid: <strong className="text-white">₹{myBooking.fee}</strong>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            Available Slots for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>

          {loading ? (
            <p className="text-gray-500">Searching for available times...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500 bg-white/5 p-6 rounded-sm text-center">
              No ice bath sessions are scheduled for this day of the week. Please select another date.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {slots.map((slot) => {
                const booked = isSlotBooked(slot.id);
                return (
                  <div 
                    key={slot.id} 
                    className={`relative p-5 rounded-sm border transition-all ${
                      booked 
                        ? 'bg-black/40 border-white/5 opacity-60' 
                        : 'bg-zinc-900 border-white/10 hover:border-accent hover:shadow-[0_0_15px_rgba(170,59,255,0.15)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-lg font-heading font-bold text-white mb-1">
                          {slot.startTime}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                          To {slot.endTime}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">₹{slot.fee}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBook(slot)}
                      disabled={booked || bookingId === slot.id}
                      className={`w-full py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                        booked
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                          : 'bg-accent hover:bg-accent-hover text-white shadow-lg'
                      }`}
                    >
                      {booked ? 'Unavailable' : (bookingId === slot.id ? <><Loader2 size={16} className="animate-spin" /> Booking...</> : 'Book Session')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmSlot}
        title="Confirm Booking"
        message={`Book Ice Bath on ${selectedDate} at ${confirmSlot?.startTime} for ₹${confirmSlot?.fee}?`}
        confirmText="Confirm"
        onConfirm={confirmBooking}
        onCancel={() => setConfirmSlot(null)}
      />
    </div>
  );
}
