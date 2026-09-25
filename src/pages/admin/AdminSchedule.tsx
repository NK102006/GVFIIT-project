import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Clock, Dumbbell, Filter } from 'lucide-react';

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

type CoachOption = {
  id: string;
  fullName: string;
};

export default function AdminSchedule() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedCoach, setSelectedCoach] = useState<string>('ALL');
  
  const [bookings, setBookings] = useState<SlotBooking[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!db?.app) return;
    setLoading(true);
    setError(null);
    try {
      // Load coaches once if not loaded
      if (coaches.length === 0) {
        const coachesSnap = await getDocs(collection(db, 'coaches'));
        setCoaches(coachesSnap.docs.map((d) => ({ id: d.id, fullName: d.data().fullName } as CoachOption)));
      }

      let q = query(
        collection(db, 'slotBookings'),
        where('date', '==', selectedDate)
      );

      // Note: Firestore requires a composite index if combining where('date') and where('assignedCoachId')
      // For simplicity, we can fetch by date and filter by coach in memory.
      const snap = await getDocs(q);
      let loadedBookings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SlotBooking));
      
      if (selectedCoach !== 'ALL') {
        loadedBookings = loadedBookings.filter(b => b.assignedCoachId === selectedCoach);
      }

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
  }, [selectedDate, selectedCoach]);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 rounded-full bg-accent/10 text-accent">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-heading font-bold">Master Schedule</h1>
      </div>
      <p className="text-gray-400 mb-8 ml-14">View all booked training sessions across the gym.</p>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">{error}</div>}

      <div className="bg-zinc-900 border border-white/10 p-6 rounded-sm mb-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-300 font-medium mb-2">
            <Calendar size={18} className="text-accent" />
            <label className="text-sm">Select Date</label>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-white/20 rounded-sm bg-black text-white focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-300 font-medium mb-2">
            <Filter size={18} className="text-accent" />
            <label className="text-sm">Filter by Coach</label>
          </div>
          <select
            value={selectedCoach}
            onChange={(e) => setSelectedCoach(e.target.value)}
            className="w-full px-4 py-2 border border-white/20 rounded-sm bg-black text-white focus:outline-none focus:border-accent transition-colors"
          >
            <option value="ALL">All Coaches</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm p-6">Loading schedule...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-sm p-6 text-center">
            No sessions are booked for this date/coach combination.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Assigned Coach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock size={14} className="text-accent" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {booking.clientName}
                    </td>
                    <td className="px-5 py-3 text-gray-400 flex items-center gap-2">
                      <Dumbbell size={14} />
                      {booking.assignedCoachName || 'No Coach'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
