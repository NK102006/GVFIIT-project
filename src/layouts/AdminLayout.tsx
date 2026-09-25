import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, Calendar, ClipboardCheck, Banknote, Snowflake, LogOut, Menu, X } from 'lucide-react';
import { useAuth, fullLogout } from '../contexts/AuthContext';
import GVFIITLogo from '../components/GVFIITLogo';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/clients', label: 'Clients', icon: Users, end: false },
  { to: '/admin/coaches', label: 'Coaches', icon: Dumbbell, end: false },
  { to: '/admin/slots', label: 'Slots', icon: Calendar, end: false },
  { to: '/admin/schedule', label: 'Schedule', icon: Calendar, end: false },
  { to: '/admin/ice-bath', label: 'Ice Bath', icon: Snowflake, end: false },
  { to: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck, end: false },
  { to: '/admin/payments', label: 'Payments', icon: Banknote, end: false },
];

export default function AdminLayout() {
  const { profile, staff, staffLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = profile?.fullName || staff?.name || 'Admin';

  const handleLogout = async () => {
    await fullLogout(staffLogout);
  };

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-4 z-30">
        <Link to="/admin" className="flex items-center gap-2">
          <GVFIITLogo size={32} />
          <span className="text-gray-500 text-xs font-normal">Admin</span>
        </Link>
        <button onClick={() => setMobileOpen((v) => !v)} className="text-white">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar — fixed on mobile (slide-in drawer), sticky+full-height on desktop
          so it never scrolls with the (potentially taller) main content. */}
      <aside
        className={`fixed md:sticky top-14 md:top-0 left-0 h-[calc(100vh-56px)] md:h-screen w-64 shrink-0 bg-zinc-900 border-r border-white/10 flex flex-col z-20 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="hidden md:block px-6 py-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <GVFIITLogo size={40} />
          </Link>
          <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 pb-3">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-10 md:hidden top-14"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 mt-14 md:mt-0 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
