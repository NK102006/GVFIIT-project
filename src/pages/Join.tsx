import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Join() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        role: 'CLIENT',
        fullName: fullName.trim(),
        email: user.email,
        phone: null,
        membershipStatus: 'INACTIVE',
        planType: 'NONE',
        planExpiry: null,
        avatar: null,
        createdAt: new Date().toISOString()
      });

      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="text-center block">
          <h2 className="text-4xl font-heading font-black tracking-tighter text-white">
            GV<span className="text-accent">FIIT</span>
          </h2>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-heading font-bold text-white tracking-tight">
          Start your journey
        </h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-zinc-900 py-8 px-4 shadow sm:rounded-sm sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleJoin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-sm text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-white/20 rounded-sm bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-bold text-white bg-accent hover:bg-accent/90 focus:outline-none uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-gray-500">Already a member?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-accent hover:text-white transition-colors font-semibold">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
