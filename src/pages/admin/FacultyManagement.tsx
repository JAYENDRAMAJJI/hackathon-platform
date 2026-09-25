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
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function FacultyManagement() {
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchData = async (isManual = false) => {
    setLoading(true);
    try {
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const [facResp, stuResp] = await Promise.all([
        apiClient.get('/admin/faculty'),
        apiClient.get('/admin/students'),
        minDelay,
      ]);

      if (facResp.success && facResp.data) {
        setFacultyList(facResp.data);
      }
      if (stuResp.success && stuResp.data) {
        setAllStudents(stuResp.data);
      }
      if (isManual) {
        toast.success('Faculty supervisors and assigned cohorts refreshed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch faculty records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.department && f.department.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = departmentFilter === 'ALL' || f.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-purple-400" /> Faculty Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage faculty mentors, student batches, and supervisory activities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all"
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

      {/* Search & Department Filter */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, department, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science & AI">Data Science & AI</option>
            </select>
          </div>

          {(search || departmentFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setDepartmentFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset
            </button>
          )}

          <div className="text-xs text-slate-400">
            Showing <b className="text-white">{filteredFaculty.length}</b> faculty member(s)
          </div>
        </div>
      </div>

      {/* Faculty Cards / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Department & ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Students</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && facultyList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading faculty records...</div>
                  </td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No faculty found matching search query
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((fac) => {
                  const assignedCount = allStudents.filter(
                    (s) => s.assignedFacultyId === fac.id || (fac.assignedStudentIds && fac.assignedStudentIds.includes(s.id))
                  ).length;

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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{assignedCount}</span>
                          <span className="text-xs text-slate-400">students supervised</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {formatDate(fac.lastLogin)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAssignModal(fac)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold border border-purple-500/30 transition-all shadow-sm"
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
                className="p-1 rounded-lg text-slate-400 hover:text-white"
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
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
                <p className="text-xs text-slate-400">Select students to be monitored and supervised by this faculty member</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
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
                        <div className="text-[11px] text-slate-400">{stu.email} • Level {stu.currentDifficulty || 1} • {stu.score || 0} pts</div>
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
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignments}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
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
