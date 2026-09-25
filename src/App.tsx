import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Join from './pages/Join';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Clients from './pages/admin/Clients';
import Coaches from './pages/admin/Coaches';
import Slots from './pages/admin/Slots';
import AdminSchedule from './pages/admin/AdminSchedule';
import IceBathAdmin from './pages/admin/IceBath';
import Attendance from './pages/admin/Attendance';
import Payments from './pages/admin/Payments';
import CoachLayout from './layouts/CoachLayout';
import CoachOverview from './pages/coach/CoachOverview';
import CoachClients from './pages/coach/CoachClients';
import ClientPlan from './pages/coach/ClientPlan';
import CoachAttendance from './pages/coach/CoachAttendance';
import CoachSchedule from './pages/coach/CoachSchedule';
import ClientLayout from './layouts/ClientLayout';
import Overview from './pages/dashboard/Overview';
import IceBathClient from './pages/dashboard/IceBathBooking';
import MyPrograms from './pages/dashboard/MyPrograms';
import ClientMetrics from './pages/dashboard/ClientMetrics';
import ScheduleBooking from './pages/dashboard/ScheduleBooking';
import { useEffect } from 'react';

// Simple protected route wrapper for clients
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/login', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!user || !profile) return null;

  return <>{children}</>;
};

// Admin protected route wrapper.
// Grants access if EITHER the Firebase profile has role ADMIN, OR the
// hardcoded staff session (see AuthContext.staffLogin) is ADMIN.
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!isAuthorized) return null;

  return <>{children}</>;
};

// Coach protected route wrapper.
// Grants access if EITHER the Firebase profile has role COACH, OR the
// hardcoded staff session is COACH.
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!isAuthorized) return null;

  return <>{children}</>;
};

function AppRoutes() {
  return (
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
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
          <main className="flex-1">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
