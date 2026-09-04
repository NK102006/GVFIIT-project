import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { Users, Calendar, Activity, CreditCard, TrendingUp, Snowflake, UserPlus } from 'lucide-react';

type DashboardStats = {
  totalClients: number;
  activeMembers: number;
  trialMembers: number;
  expiredMembers: number;
  totalCoaches: number;
  todaysBookings: number;
  todaysRecoveryBookings: number;
  todaysAttendance: number;
  monthlyRevenue: number;
  attendanceRate: number;
};

type RecentClient = {
  _id: string;
  fullName: string;
  email: string;
  membershipStatus: string;
  planType: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const profilesRef = collection(db, 'profiles');
        
        // Parallel counts
        const [
          totalClientsSnap,
          activeMembersSnap,
          trialMembersSnap,
          expiredMembersSnap,
          totalCoachesSnap,
          recentClientsSnap
        ] = await Promise.all([
          getCountFromServer(query(profilesRef, where('role', '==', 'CLIENT'))),
          getCountFromServer(query(profilesRef, where('role', '==', 'CLIENT'), where('membershipStatus', '==', 'ACTIVE'))),
          getCountFromServer(query(profilesRef, where('role', '==', 'CLIENT'), where('membershipStatus', '==', 'TRIAL'))),
          getCountFromServer(query(profilesRef, where('role', '==', 'CLIENT'), where('membershipStatus', '==', 'EXPIRED'))),
          getCountFromServer(query(profilesRef, where('role', '==', 'COACH'))),
          getDocs(query(profilesRef, where('role', '==', 'CLIENT'), orderBy('createdAt', 'desc'), firestoreLimit(5)))
        ]);

        const recent = recentClientsSnap.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        })) as RecentClient[];

        setStats({
          totalClients: totalClientsSnap.data().count,
          activeMembers: activeMembersSnap.data().count,
          trialMembers: trialMembersSnap.data().count,
          expiredMembers: expiredMembersSnap.data().count,
          totalCoaches: totalCoachesSnap.data().count,
          todaysBookings: 0, // Requires bookings collection setup
          todaysRecoveryBookings: 0, // Requires recovery collection setup
          todaysAttendance: 0, // Requires attendance collection setup
          monthlyRevenue: 0, // Requires payments collection setup
          attendanceRate: 0, 
        });
        
        setRecentClients(recent);
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Failed to load dashboard from Firestore');
      }
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-sm uppercase tracking-widest animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 text-red-400 text-sm">
          <strong>Error:</strong> {error}
          <p className="mt-1 text-red-500/70">Make sure the backend server is running on port 5000.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Clients', value: stats?.totalClients ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { name: 'Active Members', value: stats?.activeMembers ?? 0, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Bookings Today', value: stats?.todaysBookings ?? 0, icon: Calendar, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
    { name: 'Recovery Today', value: stats?.todaysRecoveryBookings ?? 0, icon: Snowflake, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { name: 'Attendance Rate', value: `${stats?.attendanceRate ?? 0}%`, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { name: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue ?? 0).toLocaleString()}`, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading font-bold text-white mb-8">Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-zinc-900 border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-sm border ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="text-3xl font-heading font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.name}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Clients & Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Signups */}
        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus size={18} className="text-accent" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recent Signups</h2>
          </div>
          {recentClients.length === 0 ? (
            <p className="text-gray-500 text-sm">No clients yet.</p>
          ) : (
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="font-bold text-white text-sm">{client.fullName}</div>
                    <div className="text-xs text-gray-500">{client.email}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-sm ${
                      client.membershipStatus === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : client.membershipStatus === 'TRIAL'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {client.membershipStatus}
                    </span>
                    <div className="text-[10px] text-gray-600 mt-1">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholder for future chart */}
        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6 h-96 flex items-center justify-center">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Membership Growth Chart (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
