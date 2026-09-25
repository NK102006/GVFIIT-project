import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Crown, Shield, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

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
  const [upcomingBookings, setUpcomingBookings] = useState<SlotBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const isMembershipActive = profile?.membershipStatus === 'ACTIVE';

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !db?.app) return;
      try {
        const q = query(
          collection(db, 'slotBookings'),
          where('clientId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SlotBooking));
        
        // Filter for upcoming (date >= today)
        const today = new Date().toISOString().split('T')[0];
        const upcoming = bookings.filter((b) => b.date >= today);
        
        // Sort by date and time
        upcoming.sort((a, b) => {
          if (a.date === b.date) {
            return a.startTime.localeCompare(b.startTime);
          }
          return a.date.localeCompare(b.date);
        });
        
        setUpcomingBookings(upcoming);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [user]);

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
      subtitle: nextSession ? `${nextSession.startTime} - ${nextSession.endTime}` : 'Book a session today!',
      icon: Calendar,
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20'
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight mb-2">
            Welcome back, <span className="text-accent">{profile?.fullName?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 font-medium">Ready to crush your goals today?</p>
        </div>
        <Link 
          to="/dashboard/schedule" 
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(170,59,255,0.3)] hover:shadow-[0_0_30px_rgba(170,59,255,0.5)] whitespace-nowrap"
        >
          <Dumbbell size={18} />
          Book Session
        </Link>
      </div>

      {/* Membership Status Banner */}
      {!isMembershipActive && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm mb-1">Membership Inactive</h3>
            <p className="text-gray-300 text-sm">Your membership is currently {profile?.membershipStatus?.toLowerCase() || 'inactive'}. Please contact an admin to renew.</p>
          </div>
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
              className="bg-zinc-900 border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-sm border ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="text-2xl font-heading font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.title}</div>
              <div className="text-sm text-gray-400 mt-auto">{stat.subtitle}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-zinc-900 border border-white/10 rounded-sm p-6 lg:p-8 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/20 text-accent">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-heading font-bold text-white">Upcoming Schedule</h2>
          </div>
          <Link to="/dashboard/schedule" className="text-accent hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
            View All
          </Link>
        </div>

        <div className="space-y-4 relative z-10">
          {loadingBookings ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">
              Loading your schedule...
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="p-12 text-center rounded-sm border border-white/5 bg-black/20 flex flex-col items-center justify-center">
              <Dumbbell size={48} className="text-white/10 mb-4" />
              <h3 className="text-white font-bold mb-2">No upcoming sessions</h3>
              <p className="text-gray-400 mb-6 max-w-sm">You don't have any training sessions scheduled right now. Book a session to stay on track with your goals!</p>
              <Link to="/dashboard/schedule" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors">
                Book a Session
              </Link>
            </div>
          ) : (
            upcomingBookings.slice(0, 3).map((booking, i) => {
              const bDate = new Date(booking.date);
              const month = bDate.toLocaleString('default', { month: 'short' });
              const day = bDate.getDate();
              
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={booking.id} 
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 rounded-sm border border-white/5 bg-black/40 hover:bg-white/5 transition-all group"
                >
                  <div className="flex flex-row sm:flex-col items-center sm:justify-center min-w-[80px] sm:border-r border-white/10 pr-4 gap-3 sm:gap-0">
                    <span className="text-xs font-bold text-accent uppercase tracking-widest group-hover:text-white transition-colors">{month}</span>
                    <span className="text-2xl sm:text-3xl font-heading font-black text-white">{day}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-lg text-white mb-1">Personal Training Session</h4>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-accent" />
                        <span className="font-medium text-gray-300">{booking.startTime} - {booking.endTime}</span>
                      </div>
                      {booking.assignedCoachName && (
                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-sm border border-white/10">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Coach:</span>
                          <span className="font-medium text-gray-300">{booking.assignedCoachName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
