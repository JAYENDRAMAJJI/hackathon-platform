import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Shield,
  GraduationCap,
  Briefcase,
  MoreVertical,
  UserCheck,
  UserX,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Clock,
  Mail,
  Calendar,
  Award,
  X,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User, UserRole, UserStatus } from '../../types/admin';
import { exportJsonToCsv, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function UserManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | 'BULK_APPROVE' | 'BULK_REJECT' | 'DETAILS';
    targetUser?: User;
  }>({ isOpen: false, type: 'DETAILS' });

  const toast = useToast();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const resp = await apiClient.get('/admin/users', params);
      if (resp.success && resp.data) {
        setUsers(resp.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Actions
  const handleApprove = async (user: User) => {
    try {
      const resp = await apiClient.post(`/admin/users/${user.id}/approve`);
      if (resp.success) {
        toast.success(`User ${user.name} approved successfully`);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Approval failed');
    } finally {
      setModalState({ isOpen: false, type: 'DETAILS' });
    }
  };

  const handleReject = async (user: User, reason?: string) => {
    try {
      const resp = await apiClient.post(`/admin/users/${user.id}/reject`, { reason });
      if (resp.success) {
        toast.warning(`User ${user.name} was rejected`);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Rejection failed');
    } finally {
      setModalState({ isOpen: false, type: 'DETAILS' });
    }
  };

  const handleSuspend = async (user: User, reason?: string) => {
    try {
      const resp = await apiClient.post(`/admin/users/${user.id}/suspend`, { reason });
      if (resp.success) {
        toast.warning(`User ${user.name} suspended`);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Suspension failed');
    } finally {
      setModalState({ isOpen: false, type: 'DETAILS' });
    }
  };

  const handleActivate = async (user: User) => {
    try {
      const resp = await apiClient.post(`/admin/users/${user.id}/activate`);
      if (resp.success) {
        toast.success(`User ${user.name} activated`);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Activation failed');
    } finally {
      setModalState({ isOpen: false, type: 'DETAILS' });
    }
  };

  const handleBulkApprove = async () => {
    try {
      const resp = await apiClient.post('/admin/users/bulk-approve', { userIds: selectedIds });
      if (resp.success) {
        toast.success(`Approved ${resp.approvedCount} users`);
        setSelectedIds([]);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Bulk approval failed');
    } finally {
      setModalState({ isOpen: false, type: 'DETAILS' });
    }
  };

  const handleBulkReject = async (reason?: string) => {
    try {
      const resp = await apiClient.post('/admin/users/bulk-reject', { userIds: selectedIds, reason });
      if (resp.success) {
        toast.warning(`Rejected ${resp.rejectedCount} users`);
        setSelectedIds([]);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Bulk rejection failed');
    } finally {
      setModalState({ isOpen: false, type: 'DETAILS' });
    }
  };

  const handleExportCSV = () => {
    exportJsonToCsv('platform_users_export', users, {
      id: 'User ID',
      name: 'Full Name',
      email: 'Email Address',
      role: 'Role',
      status: 'Status',
      registrationDate: 'Registration Date',
      lastLogin: 'Last Login',
      score: 'Score',
      currentDifficulty: 'Current Level',
      sessionStatus: 'Session Status',
    });
    toast.success('Users CSV export downloaded');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-400" /> User Directory & Access Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage student registrations, approvals, role permissions, and active sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV
          </button>
          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full pl-10 pr-20 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Strip */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-950/60 border border-blue-500/40 p-3 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="text-xs font-bold text-blue-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>{selectedIds.length} users selected for administrative action</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalState({ isOpen: true, type: 'BULK_APPROVE' })}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
            >
              Approve Selected
            </button>
            <button
              onClick={() => setModalState({ isOpen: true, type: 'BULK_REJECT' })}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
            >
              Reject Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleToggleSelectAll}
                    className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Difficulty & Score</th>
                <th className="p-4">Session</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading user directory...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No users matching current filter parameters
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
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
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate flex items-center gap-1.5">
                              {u.name}
                              {u.rank && u.rank <= 3 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold">
                                  #{u.rank}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : u.role === 'FACULTY'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                          {u.role === 'FACULTY' && <Briefcase className="w-3 h-3" />}
                          {u.role === 'STUDENT' && <GraduationCap className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : u.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : u.status === 'SUSPENDED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-400 border border-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'ACTIVE' ? 'bg-emerald-400' : u.status === 'PENDING' ? 'bg-amber-400' : 'bg-rose-400'
                          }`}></span>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === 'STUDENT' ? (
                          <div className="text-xs">
                            <span className="font-bold text-white">L{u.currentDifficulty || 1}</span>
                            <span className="text-slate-400"> / Score: </span>
                            <span className="font-extrabold text-blue-400">{u.score || 0} pts</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold ${
                          u.sessionStatus === 'ACTIVE'
                            ? 'text-emerald-400 flex items-center gap-1'
                            : u.sessionStatus === 'IDLE'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}>
                          {u.sessionStatus === 'ACTIVE' && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                          {u.sessionStatus || 'OFFLINE'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {formatDate(u.registrationDate)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setModalState({ isOpen: true, type: 'DETAILS', targetUser: u });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {u.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(u)}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                                title="Approve User"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setModalState({ isOpen: true, type: 'REJECT', targetUser: u })}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                                title="Reject User"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                            <button
                              onClick={() => setModalState({ isOpen: true, type: 'SUSPEND', targetUser: u })}
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40"
                              title="Suspend User"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          )}

                          {(u.status === 'SUSPENDED' || u.status === 'REJECTED') && (
                            <button
                              onClick={() => handleActivate(u)}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                              title="Reactivate User"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          )}
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

      {/* User Details Modal */}
      {modalState.isOpen && modalState.type === 'DETAILS' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                {selectedUser.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400">Account Status:</span>
                <div className="font-bold text-white mt-0.5">{selectedUser.status}</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400">Current Difficulty:</span>
                <div className="font-bold text-white mt-0.5">Level {selectedUser.currentDifficulty || 1}</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total Contest Score:</span>
                <div className="font-bold text-blue-400 mt-0.5">{selectedUser.score || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400">Leaderboard Rank:</span>
                <div className="font-bold text-amber-400 mt-0.5">#{selectedUser.rank || 'Unranked'}</div>
              </div>
            </div>

            {selectedUser.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                <b>Rejection / Suspension Reason:</b> {selectedUser.rejectionReason}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setModalState({ isOpen: false, type: 'DETAILS' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals for Reject, Suspend, Bulk */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'REJECT'}
        onClose={() => setModalState({ isOpen: false, type: 'DETAILS' })}
        onConfirm={(reason) => modalState.targetUser && handleReject(modalState.targetUser, reason)}
        title={`Reject User: ${modalState.targetUser?.name}`}
        description="Are you sure you want to reject this registration? The student will be notified and barred from the contest arena."
        confirmText="Reject User"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Specify exact rejection reason (e.g. invalid student identification or enrollment mismatch)..."
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'SUSPEND'}
        onClose={() => setModalState({ isOpen: false, type: 'DETAILS' })}
        onConfirm={(reason) => modalState.targetUser && handleSuspend(modalState.targetUser, reason)}
        title={`Suspend Account: ${modalState.targetUser?.name}`}
        description="This will immediately pause their live session and block access to the compiler arena."
        confirmText="Suspend Account"
        variant="warning"
        requireReason={true}
        reasonPlaceholder="State security / behavioral reason for suspension..."
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'BULK_APPROVE'}
        onClose={() => setModalState({ isOpen: false, type: 'DETAILS' })}
        onConfirm={handleBulkApprove}
        title="Approve Multiple Users"
        description={`Are you sure you want to approve all ${selectedIds.length} selected pending user accounts?`}
        confirmText="Approve All Selected"
        variant="primary"
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'BULK_REJECT'}
        onClose={() => setModalState({ isOpen: false, type: 'DETAILS' })}
        onConfirm={handleBulkReject}
        title="Reject Multiple Users"
        description={`Are you sure you want to reject ${selectedIds.length} selected accounts? A mandatory rejection reason is required.`}
        confirmText="Reject All Selected"
        variant="danger"
        requireReason={true}
      />
    </div>
  );
}
