import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Activity, 
  Dumbbell, 
  LogOut,
  Menu
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Schedule & Bookings', href: '/dashboard/schedule', icon: Calendar },
    { name: 'Fitness Metrics', href: '/dashboard/metrics', icon: Activity },
    { name: 'My Programs', href: '/dashboard/programs', icon: Dumbbell },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-zinc-950 border-r border-white/10">
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-white/10">
        <Link to="/" className="text-2xl font-heading font-black tracking-tighter text-white">
          GV<span className="text-accent">FIIT</span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4">
        <div className="mb-8 px-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Logged in as</p>
          <p className="text-sm font-bold text-white truncate">{profile?.fullName}</p>
          <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border ${
            profile?.membershipStatus === 'ACTIVE' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {profile?.membershipStatus || 'INACTIVE'}
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors ${
                  isActive 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} className="text-gray-500" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        <div className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-x-4 border-b border-white/10 bg-black/50 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-bold uppercase tracking-widest text-white text-center">
            Client Dashboard
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
