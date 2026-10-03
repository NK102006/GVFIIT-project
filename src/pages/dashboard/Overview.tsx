import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Crown, Shield, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useClientDashboardData } from '../../hooks/useDashboardData';
import { SkeletonPage } from '../../components/Skeletons';

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

export default function Overview() {
  const { user, profile } = useAuth();
  
  const isMembershipActive = profile?.membershipStatus === 'ACTIVE';

  const { data, isLoading, error } = useClientDashboardData(user?.uid);
  const upcomingBookings = (data?.upcomingBookings as SlotBooking[]) || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = () => {
    if (!profile?.planExpiry) return null;
    const expiry = new Date(profile.planExpiry);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry();
  const nextSession = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

  const quickStats = [
    {
      title: 'Membership Status',
      value: profile?.membershipStatus || 'INACTIVE',
      subtitle: profile?.planType && profile.planType !== 'NONE' ? profile.planType : 'No Active Plan',
      icon: Crown,
      color: isMembershipActive ? 'text-emerald-400' : 'text-red-400',
      bg: isMembershipActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
    },
    {
      title: 'Membership Ends',
      value: profile?.planExpiry ? formatDate(profile.planExpiry) : 'N/A',
      subtitle: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired') : 'Contact Admin',
      icon: Shield,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Next Session',
      value: nextSession ? formatDate(nextSession.date) : 'No sessions booked',
      subtitle: nextSession ? `${nextSession.startTime} - ${nextSession.endTime}` : 'Book a session today',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    }
  ];

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
          Welcome back, {profile?.fullName?.split(' ')[0] || 'Athlete'}
        </h1>
        <p className="text-gray-400">Ready to crush your goals today?</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-sm text-sm mb-6">
          {error.message || 'Failed to load dashboard data.'}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-5 rounded-sm border bg-zinc-900 border-white/5 relative overflow-hidden group`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold font-heading mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-sm ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Session Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-white/5 p-6 rounded-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Upcoming Sessions
            </h2>
            <Link to="/dashboard/schedule" className="text-sm text-accent hover:text-white transition-colors">
              Book More →
            </Link>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4 flex-1">
              {upcomingBookings.slice(0, 3).map((session: SlotBooking) => (
                <div key={session.id} className="bg-black/50 border border-white/5 p-4 rounded-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold mb-1">{formatDate(session.date)}</p>
                    <p className="text-sm text-gray-400">
                      {session.startTime} - {session.endTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-accent">Confirmed</p>
                    {session.assignedCoachName && (
                      <p className="text-xs text-gray-500 mt-1">with {session.assignedCoachName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold mb-2">No Upcoming Sessions</h3>
              <p className="text-sm text-gray-400 mb-6">You don't have any sessions booked yet.</p>
              <Link
                to="/dashboard/schedule"
                className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                Book a Session
              </Link>
            </div>
          )}
        </motion.div>

        {/* Action Cards */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/dashboard/programs"
              className="block bg-zinc-900 border border-white/5 hover:border-accent/50 p-6 rounded-sm transition-all group"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-sm bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">My Programs</h3>
                  <p className="text-sm text-gray-400">View your active exercise plans</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/dashboard/metrics"
              className="block bg-zinc-900 border border-white/5 hover:border-accent/50 p-6 rounded-sm transition-all group"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-sm bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">My Progress</h3>
                  <p className="text-sm text-gray-400">Track your metrics and PRs</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
