import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { Users, UserCheck, ClipboardList, AlertCircle, ListChecks, FilePlus2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { Profile } from '../../contexts/AuthContext';
import type { ExercisePlan } from '../../types/exercisePlan';
import StatCard from '../../components/StatCard';
import MembershipDonut from '../../components/MembershipDonut';
import MonthlyBarChart from '../../components/MonthlyBarChart';
import { lastMonthBuckets, countByMonth, formatRelativeTime } from '../../lib/dateUtils';

export default function CoachOverview() {
  const { profile, staff } = useAuth();
  const coachName = profile?.fullName || staff?.name || 'Coach';
  const displayFirstName = coachName.split(' ')[0];

  const [clients, setClients] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<ExercisePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!db?.app) {
        setError('Firebase is not configured. Add your VITE_FIREBASE_* values to .env.');
        setLoading(false);
        return;
      }
      try {
        const [clientsSnap, plansSnap] = await Promise.all([
          getDocs(collection(db, 'profiles')),
          getDocs(collection(db, 'exercisePlans')),
        ]);
        setClients(
          clientsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Profile))
            .filter((p) => p.role === 'CLIENT')
        );
        setPlans(plansSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ExercisePlan)));
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Every coach shares one hardcoded login for now (see AuthContext), so "my plans"
  // is best-effort matched by coachName rather than a real coachId.
  const myPlans = useMemo(() => plans.filter((p) => p.coachName === coachName), [plans, coachName]);

  const activeClients = useMemo(() => clients.filter((c) => c.membershipStatus === 'ACTIVE'), [clients]);

  const clientIdsWithPlan = useMemo(() => new Set(plans.map((p) => p.clientId)), [plans]);
  const clientsWithoutPlan = useMemo(
    () => clients.filter((c) => !clientIdsWithPlan.has(c.id)),
    [clients, clientIdsWithPlan]
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
  const plansByMonth = useMemo(
    () => countByMonth(myPlans.map((p) => p.createdAt), monthBuckets),
    [myPlans, monthBuckets]
  );

  const recentPlans = useMemo(
    () => [...myPlans].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5),
    [myPlans]
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
      label: 'Plans You\u2019ve Created',
      value: myPlans.length,
      icon: ClipboardList,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Clients Without a Plan',
      value: clientsWithoutPlan.length,
      icon: AlertCircle,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-1">Welcome back, {displayFirstName}!</h1>
        <p className="text-gray-400">Here's how your clients are doing.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-sm text-sm mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={loading ? '—' : s.value} icon={s.icon} iconBg={s.iconBg} iconColor={s.iconColor} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold">Plans Created</h2>
            <span className="text-xs text-gray-500">Last 6 months</span>
          </div>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <MonthlyBarChart labels={monthBuckets.map((b) => b.label)} values={plansByMonth} color="#3b82f6" />
          )}
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
          <h2 className="text-lg font-heading font-bold mb-4">Client Status</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <MembershipDonut data={statusBreakdown} total={clients.length} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-sm p-6">
          <h2 className="text-lg font-heading font-bold mb-4">Recent Plans</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : recentPlans.length === 0 ? (
            <p className="text-gray-500 text-sm">You haven't created any exercise plans yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {recentPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/coach/clients/${plan.clientId}`}
                  className="flex items-center justify-between py-3 hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-sm"
                >
                  <div>
                    <p className="text-sm font-medium">{plan.title}</p>
                    <p className="text-xs text-gray-500">{plan.clientName} · {plan.exercises.length} exercises</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">{formatRelativeTime(plan.updatedAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
            <h2 className="text-lg font-heading font-bold mb-4">Needs a Plan</h2>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : clientsWithoutPlan.length === 0 ? (
              <p className="text-gray-500 text-sm">Every client has at least one plan. Nice work!</p>
            ) : (
              <div className="space-y-3">
                {clientsWithoutPlan.slice(0, 5).map((client) => (
                  <Link
                    key={client.id}
                    to={`/coach/clients/${client.id}`}
                    className="flex items-center justify-between text-sm hover:bg-white/[0.02] transition-colors -mx-2 px-2 py-1 rounded-sm"
                  >
                    <span className="font-medium">{client.fullName}</span>
                    <span className="text-xs text-accent shrink-0 ml-2">Create plan →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
            <h2 className="text-lg font-heading font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/coach/clients"
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ListChecks size={16} className="text-accent" />
                View All Clients
              </Link>
              {clientsWithoutPlan[0] && (
                <Link
                  to={`/coach/clients/${clientsWithoutPlan[0].id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FilePlus2 size={16} className="text-accent" />
                  Create a New Plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
