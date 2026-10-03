import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { Search, ChevronRight } from 'lucide-react';
import { db } from '../../lib/firebase';
import type { Profile } from '../../contexts/AuthContext';

export default function CoachClients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!db?.app) {
        setError('Firebase is not configured. Add your VITE_FIREBASE_* values to .env.');
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'profiles'), where('role', '==', 'CLIENT'));
        const snap = await getDocs(q);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const loadedClients = await Promise.all(
          snap.docs.map(async (d) => {
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
      } catch (err) {
        console.error(err);
        setError('Failed to load clients.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = clients.filter((c) => {
    const term = search.toLowerCase();
    return c.fullName.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
  });

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-heading font-bold mb-1">My Clients</h1>
      <p className="text-gray-400 mb-6 text-sm">View client details and manage their exercise plans.</p>

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
          <div className="divide-y divide-white/5">
            {filtered.map((client) => (
              <Link
                key={client.id}
                to={`/coach/clients/${client.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{client.fullName}</p>
                  <p className="text-xs text-gray-500">{client.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-sm font-medium ${
                      client.membershipStatus === 'ACTIVE'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {client.membershipStatus}
                  </span>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
