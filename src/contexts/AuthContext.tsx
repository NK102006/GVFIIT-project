import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

export type Profile = {
  id: string; // Document ID (which is the firebaseUid)
  role: 'ADMIN' | 'CLIENT' | 'COACH';
  fullName: string;
  email: string;
  phone: string | null;
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'TRIAL';
  planType: 'NONE' | 'Group Training (3 Months)' | 'One to One Sessions' | 'Group Session (6 Months)';
  planExpiry: string | null;
  avatar: string | null;
  createdAt?: string;
};

export type StaffRole = 'ADMIN' | 'COACH';

export type StaffSession = {
  role: StaffRole;
  name: string;
  coachId?: string;  // Firestore doc ID (for coach accounts only)
};

const STAFF_SESSION_KEY = 'gvfiit_staff_session';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  // Hardcoded staff (admin/coach) auth — separate from Firebase customer auth.
  staff: StaffSession | null;
  staffLogin: (username: string, password: string) => Promise<StaffSession | null>;
  staffLogout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  staff: null,
  staffLogin: async () => null,
  staffLogout: () => {},
});

function readStoredStaffSession(): StaffSession | null {
  try {
    const raw = sessionStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.role === 'ADMIN' || parsed?.role === 'COACH') {
      return parsed as StaffSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffSession | null>(() => readStoredStaffSession());

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Profile;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (data.planExpiry && (data.membershipStatus === 'ACTIVE' || data.membershipStatus === 'TRIAL')) {
          const expiryDate = new Date(data.planExpiry);
          if (expiryDate < today) {
            try {
              await setDoc(docRef, { membershipStatus: 'EXPIRED' }, { merge: true });
              data.membershipStatus = 'EXPIRED';
            } catch (e) {
              console.error('Failed to auto-expire client profile:', e);
            }
          }
        }
        
        setProfile({ ...data, id: docSnap.id });
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

  // Credential check: first against hardcoded admin .env values, then against
  // Firestore 'coaches' collection for individual coach accounts.
  const staffLogin = async (username: string, password: string): Promise<StaffSession | null> => {
    const adminUser = import.meta.env.VITE_ADMIN_USERNAME;
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;

    // 1. Check hardcoded admin credentials
    if (adminUser && adminPass && username === adminUser && password === adminPass) {
      const session: StaffSession = { role: 'ADMIN', name: 'Admin' };
      sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
      setStaff(session);
      return session;
    }

    // 2. Check Firestore coaches collection
    if (db?.app) {
      try {
        const q = query(
          collection(db, 'coaches'),
          where('username', '==', username.trim().toLowerCase()),
          where('status', '==', 'ACTIVE')
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          const data = d.data();
          if (data.password === password) {
            const session: StaffSession = {
              role: 'COACH',
              name: data.fullName || 'Coach',
              coachId: d.id,
            };
            sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
            setStaff(session);
            return session;
          }
        }
      } catch (err) {
        console.error('Coach login query failed:', err);
      }
    }

    // 3. Fallback: check hardcoded coach credentials from .env
    const coachUser = import.meta.env.VITE_COACH_USERNAME;
    const coachPass = import.meta.env.VITE_COACH_PASSWORD;
    if (coachUser && coachPass && username === coachUser && password === coachPass) {
      const session: StaffSession = { role: 'COACH', name: 'Coach' };
      sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
      setStaff(session);
      return session;
    }

    return null;
  };

  const staffLogout = () => {
    sessionStorage.removeItem(STAFF_SESSION_KEY);
    setStaff(null);
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
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, staff, staffLogin, staffLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Exported so layouts can offer a single "Log out" button that works
// whether the current session is a Firebase customer or a hardcoded staff login.
export async function fullLogout(staffLogout: () => void) {
  staffLogout();
  try {
    if (auth?.app) {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Sign out failed:', error);
  }
}
