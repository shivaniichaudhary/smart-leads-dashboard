import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  LogOut, Filter, Search, ChevronLeft, ChevronRight, 
  Download, Trash2, Loader2, Plus, Edit2, X, Eye 
} from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: 'Website' | 'Instagram' | 'Referral';
  createdAt: string;
}

interface MetaData {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface DashboardProps {
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<MetaData>({ totalRecords: 0, currentPage: 1, totalPages: 1, limit: 10 });
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('latest');
  const debouncedSearch = useDebounce<string>(searchQuery, 400);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null); // For "View Single Lead Details"
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  
  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'New' | 'Contacted' | 'Qualified' | 'Lost'>('New');
  const [formSource, setFormSource] = useState<'Website' | 'Instagram' | 'Referral'>('Website');
  const [formError, setFormError] = useState<string>('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await API.get('/leads', {
        params: {
          status: statusFilter || undefined,
          source: sourceFilter || undefined,
          search: debouncedSearch || undefined,
          page: currentPage,
          sortBy: sortBy
        }
      });
      if (response.data.success) {
        setLeads(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Failed fetching data records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter, debouncedSearch, currentPage, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sourceFilter, debouncedSearch]);

  const openCreateModal = () => {
    setEditingLeadId(null);
    setFormName('');
    setFormEmail('');
    setFormStatus('New');
    setFormSource('Website');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLeadId(lead._id);
    setFormName(lead.name);
    setFormEmail(lead.email);
    setFormStatus(lead.status);
    setFormSource(lead.source);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Strict UI Form Validation Rules
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('All fields are mandatory.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      setFormError('Please enter a valid format email syntax.');
      return;
    }

    try {
      const payload = { name: formName, email: formEmail, status: formStatus, source: formSource };
      if (editingLeadId) {
        await API.put(`/leads/${editingLeadId}`, payload);
      } else {
        await API.post('/leads', payload);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to sync record parameters.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await API.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unauthorized action.');
    }
  };

  const downloadCSV = () => {
    if (leads.length === 0) return alert('No data to export.');
    const headers = ['Lead ID', 'Name', 'Email', 'Status', 'Source', 'Created At'];
    const rows = leads.map(lead => [
      lead._id,
      `"${lead.name.replace(/"/g, '""')}"`,
      lead.email,
      lead.status,
      lead.source,
      new Date(lead.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leads_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Leads Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, <span className="text-indigo-400 font-semibold">{user.name}</span> ({user.role})</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 rounded-xl text-sm font-medium transition-all">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Filters Grid Controls */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none">
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>

            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="bg-slate-900/60 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none">
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-900/60 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none">
              <option value="latest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button onClick={downloadCSV} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Lead Table Layout */}
        <div className="bg-slate-800 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center gap-2 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                        <span>Loading lead streams...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No matching records found.</td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-700/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{lead.name}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">{lead.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          lead.status === 'New' ? 'bg-blue-500/10 text-blue-400' :
                          lead.status === 'Contacted' ? 'bg-amber-500/10 text-amber-400' :
                          lead.status === 'Qualified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>{lead.status}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{lead.source}</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => setViewingLead(lead)} className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(lead)} className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors" title="Edit Lead">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.role === 'Admin' && (
                          <button onClick={() => handleDelete(lead._id)} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors" title="Delete Lead">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar metadata panel */}
          <div className="bg-slate-900/20 px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-400">
            <div>Total Records: <span className="text-slate-200">{meta.totalRecords}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || loading} className="p-1.5 bg-slate-800 rounded-lg text-slate-300 disabled:opacity-40 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200">Page {meta.currentPage} of {meta.totalPages || 1}</div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.totalPages))} disabled={currentPage === meta.totalPages || loading} className="p-1.5 bg-slate-800 rounded-lg text-slate-300 disabled:opacity-40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 🟢 MODAL ONE: CREATE & UPDATE INTERACTIVE FORM PANEL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-700/30 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">{editingLeadId ? 'Update Lead Settings' : 'Create New Client Lead'}</h2>
            <p className="text-xs text-slate-400 mb-6">Enter parameters below to process operational records status.</p>

            {formError && <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase">Full Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="E.g., Nitin Yadav" className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase">Email Identifier</label>
                <input type="text" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="client@company.com" className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl p-2.5 text-sm focus:outline-none">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase">Source Channel</label>
                  <select value={formSource} onChange={(e) => setFormSource(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl p-2.5 text-sm focus:outline-none">
                    <option value="Website">Website</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-3 rounded-xl mt-4 transition-all">
                {editingLeadId ? 'Save Configuration Updates' : 'Push Data Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔵 MODAL TWO: READ-ONLY OVERLAY PANEL (MANDATORY REQUIREMENT SPEC #2.5) */}
      {viewingLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setViewingLead(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-700/30 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Lead Details Spec View</h2>
            <p className="text-xs text-slate-400 mb-6">Database entity mapping readout analysis tracker.</p>

            <div className="space-y-4 bg-slate-900/50 p-4 border border-slate-700/60 rounded-xl font-sans text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2.5"><span className="text-slate-400 font-medium">Record ID:</span><span className="text-slate-500 font-mono text-xs">{viewingLead._id}</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2.5"><span className="text-slate-400 font-medium">Client Name:</span><span className="text-white font-semibold">{viewingLead.name}</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2.5"><span className="text-slate-400 font-medium">Email Address:</span><span className="text-indigo-300 font-mono">{viewingLead.email}</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2.5"><span className="text-slate-400 font-medium">Pipeline Status:</span><span className="text-slate-200 font-medium bg-slate-800 px-2 py-0.5 rounded text-xs">{viewingLead.status}</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2.5"><span className="text-slate-400 font-medium">Source Channel:</span><span className="text-slate-300">{viewingLead.source}</span></div>
              <div className="flex justify-between pt-1"><span className="text-slate-400 font-medium">Ingestion Date:</span><span className="text-slate-500 text-xs">{new Date(viewingLead.createdAt).toLocaleString()}</span></div>
            </div>
            <button onClick={() => setViewingLead(null)} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm py-2.5 rounded-xl mt-5 transition-all">
              Dismiss Details View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;