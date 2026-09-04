import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-black">
      <AdminSidebar />
      <div className="flex-1 ml-64 bg-zinc-950 min-h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
