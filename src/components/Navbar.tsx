import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GVFIITLogo from './GVFIITLogo';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '#about' },
  { name: 'Programs', path: '#programs' },
  { name: 'Coaches', path: '#coaches' },
  { name: 'Recovery', path: '#recovery' },
  { name: 'Membership', path: '#membership' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const dashboardLink = profile?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <div id="main-navbar">
      <nav className="fixed top-0 w-full z-50 bg-[#F3EBDD]/95 backdrop-blur-md border-b border-[#1E2924]/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <GVFIITLogo size={40} />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex space-x-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.path}
                    className="text-sm font-medium text-gray-300 hover:text-accent transition-colors duration-200 uppercase tracking-widest"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="flex items-center space-x-4 border-l border-[#1E2924]/20 pl-6">
                {user ? (
                  <>
                    <Link
                      to={dashboardLink}
                      className="text-sm font-bold text-white hover:text-accent transition-colors flex items-center gap-2 uppercase tracking-widest"
                    >
                      <User size={18} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-zinc-800 hover:bg-zinc-700 text-[#1E2924] px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-bold text-white hover:text-accent transition-colors flex items-center gap-2 uppercase tracking-widest"
                    >
                      <User size={18} />
                      Login
                    </Link>
                    <Link
                      to="/join"
                      className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                      style={{ color: '#FAF7F0' }}
                    >
                      Join Now
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#1E2924] hover:text-[#315C4A] p-2"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#FAF7F0]/95 backdrop-blur-xl border-b border-[#1E2924]/10 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-gray-300 hover:text-accent transition-colors px-2 uppercase tracking-widest"
                  >
                    {link.name}
                  </a>
                ))}

                <div className="pt-4 mt-2 border-t border-[#1E2924]/10 flex flex-col space-y-4">
                  {user ? (
                    <>
                      <Link
                        to={dashboardLink}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-bold text-white hover:text-accent px-2 flex items-center gap-2 uppercase tracking-widest"
                      >
                        <User size={20} />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="bg-zinc-800 text-white px-4 py-3 rounded-sm text-center text-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <LogOut size={20} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-bold text-white hover:text-accent px-2 flex items-center gap-2 uppercase tracking-widest"
                      >
                        <User size={20} />
                        Login
                      </Link>
                      <Link
                        to="/join"
                        onClick={() => setIsOpen(false)}
                        className="bg-accent text-white px-4 py-3 rounded-sm text-center text-lg font-bold uppercase tracking-widest"
                        style={{ color: '#FAF7F0' }}
                      >
                        Join Now
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
