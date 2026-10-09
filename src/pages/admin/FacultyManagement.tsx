import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  PlusCircle,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  UserPlus,
  RefreshCw,
  Mail,
  Building,
  Shield,
  Activity,
  X,
  Layers,
  Sparkles,
  Award,
  Download,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { exportJsonToCsv, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

interface ContextOption {
  id: string;
  name: string;
  code?: string;
  status?: string;
  assignedFacultyCount?: number;
}

export default function FacultyManagement() {
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [contexts, setContexts] = useState<ContextOption[]>([]);
  const [contextFilter, setContextFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [inspectFaculty, setInspectFaculty] = useState<User | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<User | null>(null);
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Add Faculty Form State
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    employeeId: '',
    role: 'FACULTY',
    password: 'Pass@123',
    contextIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchData = async (isManual = false) => {
    setLoading(true);
    try {
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const facParams: Record<string, string> = {};
      if (contextFilter !== 'ALL') facParams.contextId = contextFilter;

      const stuParams: Record<string, string> = {};
      if (contextFilter !== 'ALL') stuParams.contextId = contextFilter;

      const [facResp, stuResp] = await Promise.all([
        apiClient.get('/admin/faculty', facParams),
        apiClient.get('/admin/students', stuParams),
        minDelay,
      ]);

      if (facResp.success && facResp.data) {
        setFacultyList(facResp.data);
      }
      if (Array.isArray(facResp.contexts)) {
        setContexts(facResp.contexts);
      }
      if (stuResp.success && stuResp.data) {
        setAllStudents(stuResp.data);
      }
      if (isManual) {
        toast.success('Faculty supervisors and context-assigned cohorts refreshed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch faculty records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contextFilter]);

  // Real-time SSE listener
  useEffect(() => {
    const handleUpdate = () => {
      fetchData();
    };
    window.addEventListener('admin-contests-updated', handleUpdate);
    window.addEventListener('admin-faculty-updated', handleUpdate);
    return () => {
      window.removeEventListener('admin-contests-updated', handleUpdate);
      window.removeEventListener('admin-faculty-updated', handleUpdate);
    };
  }, [contextFilter]);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email || !newFaculty.department) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    setSubmitting(true);
    try {
      const resp = await apiClient.post('/admin/faculty', newFaculty);
      if (resp.success) {
        toast.success(`Faculty ${newFaculty.name} created successfully`);
        setIsAddModalOpen(false);
        setNewFaculty({
          name: '',
          email: '',
          department: 'Computer Science & Engineering',
          employeeId: '',
          role: 'FACULTY',
          password: 'Pass@123',
          contextIds: [],
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAssignModal = (faculty: User) => {
    setSelectedFaculty(faculty);
    // Find currently assigned students
    const currentAssigned = allStudents
      .filter((s) => s.assignedFacultyId === faculty.id || (faculty.assignedStudentIds && faculty.assignedStudentIds.includes(s.id)))
      .map((s) => s.id);
    setAssignedStudentIds(currentAssigned);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignments = async () => {
    if (!selectedFaculty) return;
    try {
      const resp = await apiClient.post(`/admin/faculty/${selectedFaculty.id}/assign-students`, {
        studentIds: assignedStudentIds,
      });
      if (resp.success) {
        toast.success(`Assigned ${assignedStudentIds.length} students to ${selectedFaculty.name}`);
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save student assignments');
    }
  };

  const selectedContextName = contexts.find((c) => c.id === contextFilter)?.name;

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.department && f.department.toLowerCase().includes(search.toLowerCase())) ||
      (f.employeeId && f.employeeId.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = departmentFilter === 'ALL' || f.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleExportCSV = () => {
    if (!filteredFaculty || filteredFaculty.length === 0) {
      toast.warning('No faculty records to export');
      return;
    }

    const exportData = filteredFaculty.map((f) => ({
      'Faculty ID': f.id,
      'Full Name': f.name,
      'Email': f.email,
      'Employee ID': f.employeeId || 'N/A',
      'Department': f.department || 'Computer Science',
      'Selected Context Scope': contextFilter !== 'ALL' ? (selectedContextName || contextFilter) : 'All Contexts',
      'Assigned Contexts': f.assignedContexts?.map((c) => c.name).join('; ') || 'None',
      'Supervision Status': f.supervisionStatus || 'ASSIGNED',
      'Supervised Students Count': f.assignedStudentsCount ?? (f.assignedStudentIds?.length || 0),
      'Active Sessions Monitored': f.activeSessionsCount ?? 0,
      'Last Login': formatDate(f.lastLogin),
    }));

    const filePrefix = contextFilter !== 'ALL' ? `Faculty_${selectedContextName?.replace(/\s+/g, '_')}` : 'All_Faculty';
    exportJsonToCsv(filePrefix, exportData);
    toast.success(`Exported ${exportData.length} faculty records to CSV`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-purple-400" /> Faculty Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage faculty mentors, context-wise assignments, supervised student cohorts, and live activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {contextFilter !== 'ALL' && selectedContextName && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" /> Context: {selectedContextName}
            </span>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Faculty Member
          </button>
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh Faculty Roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3.5">
        {/* Row 1: Search Bar & Count Telemetry */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name, department, or email..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-medium shadow-sm">
              Showing <b className="text-white font-bold">{filteredFaculty.length}</b> faculty member{filteredFaculty.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Row 2: Dynamic Filters & Reset */}
        <div className="border-t border-slate-800/70 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Context Filter - Context names only */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Context:
              </span>
              <select
                value={contextFilter}
                onChange={(e) => setContextFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-purple-500/40 hover:border-purple-500 rounded-xl text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors max-w-[280px] truncate"
                title="Filter faculty by assigned contest context"
              >
                <option value="ALL">All Contexts</option>
                {contexts.map((ctx) => (
                  <option key={ctx.id} value={ctx.id}>
                    {ctx.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science & AI">Data Science & AI</option>
              </select>
            </div>
          </div>

          {(search || departmentFilter !== 'ALL' || contextFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setDepartmentFilter('ALL');
                setContextFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Context Banner when filtered */}
      {contextFilter !== 'ALL' && selectedContextName && (
        <div className="px-4 py-3 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Organized by context: <strong className="text-white">{selectedContextName}</strong>. Displaying faculty mentors assigned to this context and their context-supervised student cohorts.
            </span>
          </div>
          <button
            onClick={() => setContextFilter('ALL')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline shrink-0 cursor-pointer"
          >
            Show All Contexts
          </button>
        </div>
      )}

      {/* Faculty Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Department & ID</th>
                <th className="p-4">
                  {contextFilter !== 'ALL' ? 'Context Supervision' : 'Assigned Contexts'}
                </th>
                <th className="p-4">Supervised Students</th>
                <th className="p-4">Active Telemetry</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && facultyList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading faculty records...</div>
                  </td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    No faculty found matching the specified context or filters
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((fac) => {
                  const supervisedCount = fac.assignedStudentsCount ?? (
                    allStudents.filter(
                      (s) => s.assignedFacultyId === fac.id || (fac.assignedStudentIds && fac.assignedStudentIds.includes(s.id))
                    ).length
                  );
                  const activeSessions = fac.activeSessionsCount ?? 0;
                  const isSupervisingActive = fac.supervisionStatus === 'ACTIVE_SUPERVISION' || activeSessions > 0;

                  return (
                    <tr key={fac.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
                            {fac.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {fac.name}
                            </div>
                            <div className="text-xs text-slate-400">{fac.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="font-semibold text-white">{fac.department || 'Computer Science'}</div>
                        <div className="text-slate-400 font-mono mt-0.5">{fac.employeeId || 'FAC-2024'}</div>
                      </td>
                      <td className="p-4">
                        {contextFilter !== 'ALL' ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isSupervisingActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {isSupervisingActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            )}
                            {isSupervisingActive ? 'ACTIVE SUPERVISOR' : 'ASSIGNED TO CONTEXT'}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Array.isArray(fac.assignedContexts) && fac.assignedContexts.length > 0 ? (
                              fac.assignedContexts.slice(0, 2).map((ctx) => (
                                <span
                                  key={ctx.id}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium truncate max-w-[130px]"
                                  title={ctx.name}
                                >
                                  {ctx.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">None</span>
                            )}
                            {Array.isArray(fac.assignedContexts) && fac.assignedContexts.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                                +{fac.assignedContexts.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{supervisedCount}</span>
                          <span className="text-xs text-slate-400">
                            {contextFilter !== 'ALL' ? 'in context' : 'students supervised'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {activeSessions > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              {activeSessions} Active
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Idle / Offline</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {formatDate(fac.lastLogin)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectFaculty(fac)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                            title="Inspect Supervised Students & Performance"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" /> Details
                          </button>
                          <button
                            onClick={() => handleOpenAssignModal(fac)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold border border-purple-500/30 transition-all shadow-sm cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Assign Students
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

      {/* FACULTY DETAILS & SUPERVISED COHORT INSPECTION DRAWER */}
      {inspectFaculty && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full overflow-y-auto p-6 shadow-2xl space-y-6 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                  {inspectFaculty.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{inspectFaculty.name}</h2>
                  <p className="text-xs text-slate-400">
                    {inspectFaculty.email} • {inspectFaculty.department || 'Computer Science'} ({inspectFaculty.employeeId || 'FAC-2024'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectFaculty(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Scope Banner */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-300">
                  Active Context Scope:{' '}
                  <strong className="text-white">
                    {contextFilter !== 'ALL' && selectedContextName ? selectedContextName : 'All Contexts'}
                  </strong>
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
                {inspectFaculty.supervisionStatus || 'ASSIGNED'}
              </span>
            </div>

            {/* Assigned Contexts Badges */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400">Assigned Contest Contexts:</div>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(inspectFaculty.assignedContexts) && inspectFaculty.assignedContexts.length > 0 ? (
                  inspectFaculty.assignedContexts.map((ctx) => (
                    <span
                      key={ctx.id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        ctx.id === contextFilter
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {ctx.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No contexts assigned yet</span>
                )}
              </div>
            </div>

            {/* Supervision KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Assigned Students</div>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">
                  {inspectFaculty.assignedStudentsCount ?? (inspectFaculty.assignedStudentIds?.length || 0)}
                </div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Active Live Sessions</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {inspectFaculty.activeSessionsCount ?? 0}
                </div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Assigned Contexts</div>
                <div className="text-xl font-extrabold text-blue-400 mt-0.5">
                  {inspectFaculty.assignedContexts?.length || 0}
                </div>
              </div>
            </div>

            {/* Supervised Student Cohort in this Context */}
            <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> Supervised Student Cohort
                </h3>
                <span className="text-xs text-slate-400">
                  {inspectFaculty.associatedStudents?.length || 0} student(s) displayed
                </span>
              </div>

              <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
                {Array.isArray(inspectFaculty.associatedStudents) && inspectFaculty.associatedStudents.length > 0 ? (
                  inspectFaculty.associatedStudents.map((stu) => (
                    <div key={stu.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white text-xs">{stu.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {stu.email} • {stu.department || 'Computer Science'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-blue-400">{stu.score || 0} pts</div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              stu.sessionStatus === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {stu.sessionStatus || 'OFFLINE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 py-4 text-center text-xs">
                    No students currently assigned to this faculty member in the selected context.
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const fac = inspectFaculty;
                  setInspectFaculty(null);
                  handleOpenAssignModal(fac);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Modify Student Assignments →
              </button>
              <button
                onClick={() => setInspectFaculty(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FACULTY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" /> Create Faculty Account
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  placeholder="e.g. Dr. Alan Turing"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Official University Email *</label>
                <input
                  type="email"
                  required
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                  placeholder="e.g. aturing@university.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Department *</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Employee ID</label>
                  <input
                    type="text"
                    value={newFaculty.employeeId}
                    onChange={(e) => setNewFaculty({ ...newFaculty, employeeId: e.target.value })}
                    placeholder="e.g. FAC-2024-099"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Initial Context Assignment */}
              {contexts.length > 0 && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> Assign to Context(s) (Optional)
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-800/60 rounded-xl border border-slate-700">
                    {contexts.map((ctx) => {
                      const isSelected = newFaculty.contextIds.includes(ctx.id);
                      return (
                        <label
                          key={ctx.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-700/50 cursor-pointer text-slate-300"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewFaculty({ ...newFaculty, contextIds: [...newFaculty.contextIds, ctx.id] });
                              } else {
                                setNewFaculty({ ...newFaculty, contextIds: newFaculty.contextIds.filter((id) => id !== ctx.id) });
                              }
                            }}
                            className="rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-0"
                          />
                          <span className="truncate">{ctx.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Faculty Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN STUDENTS MULTI-SELECT MODAL */}
      {isAssignModalOpen && selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-lg">
                  Assign Students to {selectedFaculty.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Select students to be monitored and supervised by this faculty member
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students to assign..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Students Checkbox List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800 pr-1 space-y-1">
              {filteredStudents.map((stu) => {
                const isAssigned = assignedStudentIds.includes(stu.id);
                return (
                  <div
                    key={stu.id}
                    onClick={() => {
                      setAssignedStudentIds((prev) =>
                        prev.includes(stu.id) ? prev.filter((id) => id !== stu.id) : [...prev, stu.id]
                      );
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      isAssigned ? 'bg-purple-950/30 border border-purple-500/30' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={() => {}}
                        className="rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-0"
                      />
                      <div>
                        <div className="font-semibold text-white text-xs">{stu.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {stu.email} • Level {stu.currentDifficulty || 1} • {stu.score || 0} pts
                        </div>
                      </div>
                    </div>
                    {isAssigned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        ASSIGNED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                <b className="text-white">{assignedStudentIds.length}</b> student(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignments}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Save Student Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
