import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Dumbbell } from 'lucide-react';

type SlotBooking = {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  slotId: string;
  startTime: string;
  endTime: string;
  assignedCoachId: string;
  assignedCoachName: string | null;
  timestamp: string;
};

export default function CoachSchedule() {
  const { staff } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!db?.app || !staff) {
      setLoading(false);
      return;
    }
    
    // Fallback if coach has no ID in staff session (e.g., hardcoded .env coach)
    const coachIdToQuery = staff.coachId || 'admin-fallback';

    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'slotBookings'),
        where('date', '==', selectedDate),
        where('assignedCoachId', '==', coachIdToQuery)
      );
      const snap = await getDocs(q);
      const loadedBookings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SlotBooking));
      loadedBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setBookings(loadedBookings);
    } catch (err) {
      console.error(err);
      setError('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, staff]);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 rounded-full bg-accent/10 text-accent">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-heading font-bold">My Schedule</h1>
      </div>
      <p className="text-gray-400 mb-8 ml-14">View your booked training sessions.</p>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">{error}</div>}

      <div className="bg-zinc-900 border border-white/10 p-6 rounded-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 text-gray-300 font-medium">
            <Calendar size={20} className="text-accent" />
            Select Date:
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-white/20 rounded-sm bg-black text-white focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-accent" />
          Bookings for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading schedule...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 bg-white/5 p-6 rounded-sm text-center">
            No sessions are booked for you on this date.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-zinc-900 border border-white/10 p-5 rounded-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-heading font-bold text-white">
                      {booking.startTime} - {booking.endTime}
                    </span>
                    <Dumbbell size={18} className="text-accent" />
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    Client: <span className="font-medium text-gray-200">{booking.clientName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
