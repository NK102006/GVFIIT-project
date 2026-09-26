import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

// Eager load layout shells so the skeleton structure renders instantly
import AdminLayout from './layouts/AdminLayout';
import CoachLayout from './layouts/CoachLayout';
import ClientLayout from './layouts/ClientLayout';

// Global Skeletons for Suspense fallbacks
import { SkeletonPage } from './components/Skeletons';

// --- Lazy Load Pages ---
// Public
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Join = lazy(() => import('./pages/Join'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Clients = lazy(() => import('./pages/admin/Clients'));
const Coaches = lazy(() => import('./pages/admin/Coaches'));
const Slots = lazy(() => import('./pages/admin/Slots'));
const AdminSchedule = lazy(() => import('./pages/admin/AdminSchedule'));
const IceBathAdmin = lazy(() => import('./pages/admin/IceBath'));
const Attendance = lazy(() => import('./pages/admin/Attendance'));
const Payments = lazy(() => import('./pages/admin/Payments'));

// Coach
const CoachOverview = lazy(() => import('./pages/coach/CoachOverview'));
const CoachClients = lazy(() => import('./pages/coach/CoachClients'));
const ClientPlan = lazy(() => import('./pages/coach/ClientPlan'));
const CoachAttendance = lazy(() => import('./pages/coach/CoachAttendance'));
const CoachSchedule = lazy(() => import('./pages/coach/CoachSchedule'));

// Client (Dashboard)
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const IceBathClient = lazy(() => import('./pages/dashboard/IceBathBooking'));
const MyPrograms = lazy(() => import('./pages/dashboard/MyPrograms'));
const ClientMetrics = lazy(() => import('./pages/dashboard/ClientMetrics'));
const ScheduleBooking = lazy(() => import('./pages/dashboard/ScheduleBooking'));

// Simple protected route wrapper for clients
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/login', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) return <SkeletonPage />;
  if (!user || !profile) return null;

  return <>{children}</>;
};

// Admin protected route wrapper.
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, staff } = useAuth();
  const navigate = useNavigate();

  const isFirebaseAdmin = !!user && !!profile && profile.role === 'ADMIN';
  const isStaffAdmin = staff?.role === 'ADMIN';
  const isAuthorized = isFirebaseAdmin || isStaffAdmin;

  useEffect(() => {
    if (!loading && !isAuthorized) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthorized, navigate]);

  if (loading) return <SkeletonPage />;
  if (!isAuthorized) return null;

  return <>{children}</>;
};

// Coach protected route wrapper.
const CoachRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, staff } = useAuth();
  const navigate = useNavigate();

  const isFirebaseCoach = !!user && !!profile && profile.role === 'COACH';
  const isStaffCoach = staff?.role === 'COACH';
  const isAuthorized = isFirebaseCoach || isStaffCoach;

  useEffect(() => {
    if (!loading && !isAuthorized) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthorized, navigate]);

  if (loading) return <SkeletonPage />;
  if (!isAuthorized) return null;

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />

        {/* Client Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="schedule" element={<ScheduleBooking />} />
          <Route path="metrics" element={<ClientMetrics />} />
          <Route path="programs" element={<MyPrograms />} />
          <Route path="ice-bath" element={<IceBathClient />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="coaches" element={<Coaches />} />
          <Route path="slots" element={<Slots />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="ice-bath" element={<IceBathAdmin />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
          <Route path="*" element={<div className="p-8 text-white">Module coming soon...</div>} />
        </Route>

        {/* Coach Routes */}
        <Route
          path="/coach"
          element={
            <CoachRoute>
              <CoachLayout />
            </CoachRoute>
          }
        >
          <Route index element={<CoachOverview />} />
          <Route path="clients" element={<CoachClients />} />
          <Route path="clients/:clientId" element={<ClientPlan />} />
          <Route path="attendance" element={<CoachAttendance />} />
          <Route path="schedule" element={<CoachSchedule />} />
          <Route path="*" element={<div className="p-8 text-white">Module coming soon...</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <main className="flex-1">
              <AppRoutes />
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
