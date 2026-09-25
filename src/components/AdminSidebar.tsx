import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, CreditCard, Calendar, Activity, ClipboardList, Settings, LogOut, Snowflake, Dumbbell, BarChart3 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import GVFIITLogo from './GVFIITLogo';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Activity },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'Memberships', path: '/admin/memberships', icon: CreditCard },
    { name: 'Training Slots', path: '/admin/slots', icon: Calendar },
    { name: 'Bookings', path: '/admin/bookings', icon: BarChart3 },
    { name: 'Recovery', path: '/admin/recovery', icon: Snowflake },
    { name: 'Workouts', path: '/admin/workouts', icon: Dumbbell },
    { name: 'Programs', path: '/admin/programs', icon: ClipboardList },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-white/10 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <GVFIITLogo size={36} />
          <span className="text-xs font-sans text-gray-500 uppercase tracking-widest">Admin</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors ${
                isActive 
                  ? 'bg-accent text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
