import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Dumbbell, AlertTriangle, UserPlus, ListChecks } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Profile } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard';
import { LazyMembershipDonut, LazyMonthlyBarChart } from '../../components/LazyCharts';
import { lastMonthBuckets, countByMonth, daysUntil } from '../../lib/dateUtils';
import { useAdminDashboardData } from '../../hooks/useDashboardData';
import { SkeletonPage } from '../../components/Skeletons';

const EXPIRING_WINDOW_DAYS = 14;

export default function AdminDashboard() {
  const { profile, staff } = useAuth();
  const displayName = profile?.fullName?.split(' ')[0] || staff?.name || 'Admin';

  const { data, isLoading, error } = useAdminDashboardData();

  const clients = data?.clients || [];
  const coaches = data?.coaches || [];

  const createdAtById = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach(c => { if (c.createdAt) map[c.id] = c.createdAt; });
    return map;
  }, [clients]);

  const activeClients = useMemo(() => clients.filter((p) => p.membershipStatus === 'ACTIVE'), [clients]);

  const expiringClients = useMemo(
    () =>
      clients
        .map((c) => ({ client: c, days: daysUntil(c.planExpiry) }))
        .filter((x): x is { client: Profile; days: number } => x.days !== null && x.days >= 0 && x.days <= EXPIRING_WINDOW_DAYS)
        .sort((a, b) => a.days - b.days),
    [clients]
  );

  const statusBreakdown = useMemo(() => {
    const counts: Record<Profile['membershipStatus'], number> = {
      ACTIVE: 0,
      TRIAL: 0,
      INACTIVE: 0,
      EXPIRED: 0,
    };
    clients.forEach((c) => {
      counts[c.membershipStatus] = (counts[c.membershipStatus] || 0) + 1;
    });
    return [
      { name: 'Active', value: counts.ACTIVE, color: '#22c55e' },
      { name: 'Trial', value: counts.TRIAL, color: '#3b82f6' },
      { name: 'Inactive', value: counts.INACTIVE, color: '#71717a' },
      { name: 'Expired', value: counts.EXPIRED, color: '#ef4444' },
    ];
  }, [clients]);

  const monthBuckets = useMemo(() => lastMonthBuckets(6), []);
  const signupsByMonth = useMemo(
    () => countByMonth(clients.map((c) => createdAtById[c.id]), monthBuckets),
    [clients, createdAtById, monthBuckets]
  );

  const recentClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => (createdAtById[b.id] || '').localeCompare(createdAtById[a.id] || ''))
        .slice(0, 5),
    [clients, createdAtById]
  );

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users, iconBg: 'bg-accent/15', iconColor: 'text-accent' },
    {
      label: 'Active Memberships',
      value: activeClients.length,
      icon: UserCheck,
      iconBg: 'bg-green-500/15',
      iconColor: 'text-green-400',
    },
    {
      label: 'Coaches on Roster',
      value: coaches.length,
      icon: Dumbbell,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      label: `Expiring in ${EXPIRING_WINDOW_DAYS} Days`,
      value: expiringClients.length,
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
    },
  ];

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-1">Welcome back, {displayName}!</h1>
        <p className="text-gray-400">Here's what's happening with GV FIIT today.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-sm text-sm mb-6">
          {error.message || 'Failed to load dashboard data.'}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconBg={s.iconBg} iconColor={s.iconColor} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold">New Sign-ups</h2>
            <span className="text-xs text-gray-500">Last 6 months</span>
          </div>
          <div className="flex-1 w-full relative">
            <LazyMonthlyBarChart labels={monthBuckets.map((b) => b.label)} values={signupsByMonth} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
          <h2 className="text-lg font-heading font-bold mb-4">Membership Status</h2>
          <LazyMembershipDonut data={statusBreakdown} total={clients.length} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold">Recent Clients</h2>
            <Link to="/admin/clients" className="text-sm text-accent hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <p className="text-gray-500 text-sm">No clients yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Plan</th>
                    <th className="py-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentClients.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{c.fullName}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-sm font-medium ${
                            c.membershipStatus === 'ACTIVE'
                              ? 'bg-green-500/10 text-green-400'
                              : c.membershipStatus === 'TRIAL'
                              ? 'bg-blue-500/10 text-blue-400'
                              : c.membershipStatus === 'EXPIRED'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          {c.membershipStatus}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{c.planType}</td>
                      <td className="py-3 text-gray-400">
                        {createdAtById[c.id] ? new Date(createdAtById[c.id]).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
            <h2 className="text-lg font-heading font-bold mb-4">Expiring Soon</h2>
            {expiringClients.length === 0 ? (
              <p className="text-gray-500 text-sm">No memberships expiring in the next {EXPIRING_WINDOW_DAYS} days.</p>
            ) : (
              <div className="space-y-3">
                {expiringClients.slice(0, 5).map(({ client, days }) => (
                  <div key={client.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{client.fullName}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 shrink-0 ml-2">
                      {days === 0 ? 'Today' : `${days}d left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
            <h2 className="text-lg font-heading font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/admin/clients"
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <UserPlus size={16} className="text-accent" />
                Add New Client
              </Link>
              <Link
                to="/admin/clients"
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ListChecks size={16} className="text-accent" />
                View All Clients
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
