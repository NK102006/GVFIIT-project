import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Search, UserPlus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

type Client = {
  _id: string; // Used mapping doc.id to _id for table rows
  fullName: string;
  email: string;
  phone: string | null;
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'TRIAL';
  planType: string;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 50, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchClients();
  }, [pagination.page, statusFilter]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      let q = query(collection(db, 'profiles'), where('role', '==', 'CLIENT'));

      if (statusFilter) {
        q = query(q, where('membershipStatus', '==', statusFilter));
      }

      // Simple implementation: fetch all matching and paginate/search in memory
      // For large datasets, use cursor-based pagination with Firestore
      const querySnapshot = await getDocs(q);
      
      let allClients = querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      })) as Client[];

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        allClients = allClients.filter(c => 
          c.fullName.toLowerCase().includes(lowerSearch) || 
          c.email.toLowerCase().includes(lowerSearch)
        );
      }

      // Sort by createdAt descending
      allClients.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const total = allClients.length;
      const pages = Math.ceil(total / pagination.limit) || 1;
      
      const startIdx = (pagination.page - 1) * pagination.limit;
      const paginatedClients = allClients.slice(startIdx, startIdx + pagination.limit);

      setClients(paginatedClients);
      setPagination(prev => ({ ...prev, total, pages }));
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Failed to fetch clients from Firestore');
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchClients();
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      INACTIVE: 'bg-red-500/10 text-red-400 border-red-500/20',
      EXPIRED: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      TRIAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Clients</h1>
          <p className="text-gray-400 mt-1">Manage your gym members and their profiles.</p>
        </div>
        <button className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-sm font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-colors">
          <UserPlus size={18} />
          Add Client
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 text-red-400 text-sm mb-6">
          <strong>Error:</strong> {error}
          <p className="mt-1 text-red-500/70">Make sure the backend server is running on port 5000.</p>
        </div>
      )}

      <div className="bg-zinc-900 border border-white/10 rounded-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-black/50">
          <form onSubmit={handleSearch} className="relative w-64">
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-sm py-2 pl-10 pr-4 text-white text-sm focus:border-accent focus:outline-none transition-colors"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          </form>

          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
              className="bg-black border border-white/20 rounded-sm py-2 px-3 text-white text-sm focus:border-accent focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="EXPIRED">Expired</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <div className="text-sm text-gray-400">
              {pagination.total} total
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-widest text-gray-500">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Plan</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading clients...</td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No clients found.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white">{client.fullName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-300">{client.email}</div>
                      <div className="text-xs text-gray-500">{client.phone || 'No phone'}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-300 font-medium">{client.planType || 'NONE'}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm border ${statusBadge(client.membershipStatus)}`}>
                        {client.membershipStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-500 hover:text-white p-2 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/30">
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                disabled={pagination.page <= 1}
                className="p-2 border border-white/10 rounded-sm text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                disabled={pagination.page >= pagination.pages}
                className="p-2 border border-white/10 rounded-sm text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
