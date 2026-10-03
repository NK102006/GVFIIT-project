import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Profile } from '../contexts/AuthContext';
import type { ExercisePlan } from '../types/exercisePlan';

export function useAdminDashboardData() {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      if (!db?.app) throw new Error('Firebase not configured');

      const profilesQuery = query(collection(db, 'profiles'), where('role', 'in', ['CLIENT', 'COACH']));
      const profilesSnap = await getDocs(profilesQuery);
      
      const profiles = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profile));
      
      return {
        clients: profiles.filter(p => p.role === 'CLIENT'),
        coaches: profiles.filter(p => p.role === 'COACH'),
      };
    },
    staleTime: 60 * 1000, 
  });
}

export function useCoachDashboardData(coachName: string) {
  return useQuery({
    queryKey: ['coachDashboard', coachName],
    queryFn: async () => {
      if (!db?.app) throw new Error('Firebase not configured');

      const clientsQuery = query(collection(db, 'profiles'), where('role', '==', 'CLIENT'));
      const plansQuery = query(collection(db, 'exercisePlans'), where('coachName', '==', coachName));
      
      const [clientsSnap, plansSnap] = await Promise.all([
        getDocs(clientsQuery),
        getDocs(plansQuery)
      ]);
      
      return {
        clients: clientsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profile)),
        plans: plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as ExercisePlan)),
      };
    },
    staleTime: 60 * 1000, 
  });
}

export function useClientDashboardData(userId?: string) {
  return useQuery({
    queryKey: ['clientDashboard', userId],
    queryFn: async () => {
      if (!db?.app || !userId) throw new Error('Firebase not configured or no user');

      const q = query(
        collection(db, 'slotBookings'),
        where('clientId', '==', userId)
      );
      const snap = await getDocs(q);
      const bookings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      const today = new Date().toISOString().split('T')[0];
      const upcoming = bookings.filter((b: any) => b.date >= today);
      
      upcoming.sort((a: any, b: any) => {
        if (a.date === b.date) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.date.localeCompare(b.date);
      });
      
      return { upcomingBookings: upcoming };
    },
    staleTime: 60 * 1000,
    enabled: !!userId,
  });
}
