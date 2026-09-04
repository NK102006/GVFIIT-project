import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Activity, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Overview() {
  const { profile } = useAuth();

  const isMembershipActive = profile?.membershipStatus === 'ACTIVE';

  const quickStats = [
    {
      title: 'Next Session',
      value: 'Tomorrow, 6:00 PM',
      subtitle: 'HIIT Bootcamp',
      icon: Calendar,
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20'
    },
    {
      title: 'Current Streak',
      value: '3 Days',
      subtitle: 'Keep it up!',
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Personal Records',
      value: '2 This Month',
      subtitle: 'Latest: 100kg Deadlift',
      icon: Trophy,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight mb-2">
          Welcome back, <span className="text-accent">{profile?.fullName?.split(' ')[0]}</span>
        </h1>
        <p className="text-gray-400 font-medium">Ready to crush your goals today?</p>
      </div>

      {/* Membership Status Banner */}
      {!isMembershipActive && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm mb-1">Membership Inactive</h3>
            <p className="text-gray-300 text-sm">Your membership is currently {profile?.membershipStatus?.toLowerCase() || 'inactive'}. You cannot book new sessions.</p>
          </div>
          <button className="whitespace-nowrap bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors">
            Renew Now
          </button>
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-sm border ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="text-2xl font-heading font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.title}</div>
              <div className="text-sm text-gray-400">{stat.subtitle}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming Schedule */}
        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-heading font-bold text-white">Upcoming Schedule</h2>
            <Link to="/dashboard/schedule" className="text-accent hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {/* Mock upcoming sessions */}
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-sm border border-white/5 bg-black/20 hover:bg-white/5 transition-colors">
                <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-white/10 pr-4">
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">Oct</span>
                  <span className="text-2xl font-heading font-black text-white">2{i}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Strength & Conditioning</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} />
                    6:00 PM - 7:00 PM
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Program */}
        <div className="bg-zinc-900 border border-white/10 rounded-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-heading font-bold text-white">Current Program</h2>
            <Link to="/dashboard/programs" className="text-accent hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
              Continue
            </Link>
          </div>

          <div className="p-6 rounded-sm border border-accent/20 bg-accent/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[50px] -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest rounded-sm mb-3">
                Week 3 of 8
              </span>
              <h3 className="text-2xl font-heading font-black text-white mb-2">Hypertrophy Fundamentals</h3>
              <p className="text-gray-400 text-sm mb-6">Next up: Day 4 - Push (Chest, Shoulders, Triceps)</p>
              
              <Link to="/dashboard/programs" className="inline-block bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(170,59,255,0.3)] hover:shadow-[0_0_30px_rgba(170,59,255,0.5)]">
                Start Workout
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
