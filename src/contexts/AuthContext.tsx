import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Profile = {
  id: string; // Document ID (which is the firebaseUid)
  role: 'ADMIN' | 'CLIENT' | 'COACH';
  fullName: string;
  email: string;
  phone: string | null;
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'TRIAL';
  planType: 'BASIC' | 'PREMIUM' | 'UNLIMITED' | 'NONE';
  planExpiry: string | null;
  avatar: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() } as Profile);
      } else {
        // Auto-heal: Create a profile if it's missing (e.g. if Firestore was down during signup)
        if (auth.currentUser) {
          const newProfile = {
            role: 'CLIENT',
            fullName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Member',
            email: auth.currentUser.email || '',
            phone: null,
            membershipStatus: 'INACTIVE',
            planType: 'NONE',
            planExpiry: null,
            avatar: null,
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setProfile({ id: uid, ...newProfile } as Profile);
        } else {
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser.uid);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check if auth is a mock object (Firebase not configured)
    if (!auth.name && !auth.app) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        // Small delay to ensure the token is ready
        await new Promise((r) => setTimeout(r, 100));
        await fetchProfile(currentUser.uid);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {loading ? (
        <div className="min-h-screen bg-black flex items-center justify-center text-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="animate-pulse font-heading tracking-widest text-accent font-bold text-xl relative z-10">
            LOADING GV FIIT...
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
