import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GVFIITLogo from '../components/GVFIITLogo';

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

  const handleGoogleJoin = async () => {
    setLoading(true);
    setError(null);

    if (!auth?.app) {
      setError('Firebase is not initialized. Please ensure your .env file is saved (Ctrl + S) with valid Firebase credentials and restart the dev server.');
      setLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;

      if (db?.app) {
        const docRef = doc(db, 'profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            role: 'CLIENT',
            fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Member',
            email: currentUser.email || '',
            phone: currentUser.phoneNumber || null,
            membershipStatus: 'INACTIVE',
            planType: 'NONE',
            planExpiry: null,
            avatar: currentUser.photoURL || null,
            createdAt: new Date().toISOString(),
          });
        }
      }

      await refreshProfile();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return;
      }
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled in your Firebase Console. Please enable Google provider in Firebase Console > Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!auth?.app) {
      setError('Firebase is not initialized. Please ensure your .env file is saved (Ctrl + S) with valid Firebase credentials and restart the dev server.');
      setLoading(false);
      return;
    }

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
        <Link to="/" className="flex justify-center">
          <GVFIITLogo size={60} />
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
                <span className="px-2 bg-zinc-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleJoin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-white/15 rounded-sm shadow-sm text-sm font-semibold text-white bg-zinc-800/80 hover:bg-zinc-800 hover:border-white/30 focus:outline-none transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">Already a member? </span>
              <Link to="/login" className="text-sm text-accent hover:text-white transition-colors font-semibold">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
