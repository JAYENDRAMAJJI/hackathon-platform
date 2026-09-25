import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Shield,
  GraduationCap,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function ApprovalManagement() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'FACULTY'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'APPROVE' | 'REJECT' | 'BULK_APPROVE' | 'BULK_REJECT' | 'DETAILS';
    targetUser?: User;
  }>({ isOpen: false, type: 'APPROVE' });

  const toast = useToast();

  const fetchPendingApprovals = async (isManual = false) => {
    setLoading(true);
    try {
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const params: any = { status: 'PENDING' };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.role = roleFilter;
      const [resp] = await Promise.all([
        apiClient.get('/admin/users', params),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setPendingUsers(resp.data);
      }
      if (isManual) {
        toast.success('Pending approvals queue refreshed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPendingApprovals();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === pendingUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingUsers.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = async () => {
    if (!modalState.targetUser) return;
    try {
      const resp = await apiClient.post(`/admin/users/${modalState.targetUser.id}/approve`);
      if (resp.success) {
        toast.success(`User ${modalState.targetUser.name} approved successfully`);
        fetchPendingApprovals();
      }
    } catch (err: any) {
      toast.error(err.message || 'Approval failed');
    } finally {
      setModalState({ isOpen: false, type: 'APPROVE' });
    }
  };

  const handleReject = async (reason?: string) => {
    if (!modalState.targetUser) return;
    try {
      const resp = await apiClient.post(`/admin/users/${modalState.targetUser.id}/reject`, { reason });
      if (resp.success) {
        toast.warning(`User ${modalState.targetUser.name} rejected`);
        fetchPendingApprovals();
      }
    } catch (err: any) {
      toast.error(err.message || 'Rejection failed');
    } finally {
      setModalState({ isOpen: false, type: 'REJECT' });
    }
  };

  const handleBulkApprove = async () => {
    try {
      const resp = await apiClient.post('/admin/users/bulk-approve', { userIds: selectedIds });
      if (resp.success) {
        toast.success(`Successfully approved ${resp.approvedCount} users`);
        setSelectedIds([]);
        fetchPendingApprovals();
      }
    } catch (err: any) {
      toast.error(err.message || 'Bulk approval failed');
    } finally {
      setModalState({ isOpen: false, type: 'BULK_APPROVE' });
    }
  };

  const handleBulkReject = async (reason?: string) => {
    try {
      const resp = await apiClient.post('/admin/users/bulk-reject', { userIds: selectedIds, reason });
      if (resp.success) {
        toast.warning(`Successfully rejected ${resp.rejectedCount} users`);
        setSelectedIds([]);
        fetchPendingApprovals();
      }
    } catch (err: any) {
      toast.error(err.message || 'Bulk rejection failed');
    } finally {
      setModalState({ isOpen: false, type: 'BULK_REJECT' });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Authentication Gatekeeper
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" /> Pending Approvals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and approve student/faculty registrations and access requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPendingApprovals(true)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh Approval Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            Refresh Queue ({pendingUsers.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search applicant name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">Role Filter:</span>
          {(['ALL', 'STUDENT', 'FACULTY'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === role
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role === 'STUDENT' ? 'Students' : 'Faculty'}
            </button>
          ))}
          {(search || roleFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline ml-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="text-xs font-bold text-amber-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>{selectedIds.length} pending registration(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalState({ isOpen: true, type: 'BULK_APPROVE' })}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Approve Selected
            </button>
            <button
              onClick={() => setModalState({ isOpen: true, type: 'BULK_REJECT' })}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Reject Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Pending Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={pendingUsers.length > 0 && selectedIds.length === pendingUsers.length}
                    onChange={handleToggleSelectAll}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-4">Applicant Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department / ID</th>
                <th className="p-4">Registration Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading pending registration queue...</div>
                  </td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-60" />
                    <div className="text-base font-bold text-white">All Clear! No Pending Approvals</div>
                    <p className="text-xs text-slate-500 mt-1">
                      All student and faculty registrations have been processed and authorized.
                    </p>
                  </td>
                </tr>
              ) : (
                pendingUsers.map((u) => {
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(u.id)}
                          className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="font-bold text-white">{u.name}</div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-300">
                        {u.email}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {u.department || 'Computer Science'} {u.employeeId ? `• ${u.employeeId}` : ''}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {formatDate(u.registrationDate)}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'APPROVE', targetUser: u })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'REJECT', targetUser: u })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold border border-rose-500/30 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'APPROVE'}
        onClose={() => setModalState({ isOpen: false, type: 'APPROVE' })}
        onConfirm={handleApprove}
        title="Approve User Registration?"
        description={`Authorizing ${modalState.targetUser?.name} (${modalState.targetUser?.email}) will grant immediate access to the hackathon coding platform and enable live session tracking.`}
        confirmText="Approve User"
        variant="primary"
        details={
          <div className="space-y-1">
            <div><b>Name:</b> {modalState.targetUser?.name}</div>
            <div><b>Email:</b> {modalState.targetUser?.email}</div>
            <div><b>Role:</b> {modalState.targetUser?.role}</div>
            <div><b>Registration Date:</b> {formatDate(modalState.targetUser?.registrationDate)}</div>
          </div>
        }
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'REJECT'}
        onClose={() => setModalState({ isOpen: false, type: 'REJECT' })}
        onConfirm={handleReject}
        title={`Reject User: ${modalState.targetUser?.name}`}
        description="Please provide an administrative reason for rejecting this registration. The user will be notified."
        confirmText="Reject User"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Specify exact rejection reason..."
      />

      {/* Bulk Approvals */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'BULK_APPROVE'}
        onClose={() => setModalState({ isOpen: false, type: 'BULK_APPROVE' })}
        onConfirm={handleBulkApprove}
        title="Approve Multiple Registrations"
        description={`You are about to authorize ${selectedIds.length} pending users. Individual audit records will be created.`}
        confirmText="Approve All Selected"
        variant="primary"
      />

      {/* Bulk Rejection */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'BULK_REJECT'}
        onClose={() => setModalState({ isOpen: false, type: 'BULK_REJECT' })}
        onConfirm={handleBulkReject}
        title="Reject Multiple Registrations"
        description={`You are about to reject ${selectedIds.length} pending users. A mandatory reason is required.`}
        confirmText="Reject All Selected"
        variant="danger"
        requireReason={true}
      />
    </div>
  );
}
