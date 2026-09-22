import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Check,
  ChevronDown,
  X,
  Building2,
  Mail,
  ShieldCheck,
  Award,
  IdCard,
  UserX,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Filter
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';

export interface AssignFacultyDropdownProps {
  contestId?: string;
  contestName?: string;
  selectedFacultyIds?: string[];
  onChange?: (facultyIds: string[], facultyMembers: User[]) => void;
  onAssignedSuccess?: () => void;
  showSaveButton?: boolean;
  mode?: 'single' | 'multiple';
  compact?: boolean;
  title?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export default function AssignFacultyDropdown({
  contestId,
  contestName,
  selectedFacultyIds: controlledFacultyIds,
  onChange,
  onAssignedSuccess,
  showSaveButton = true,
  mode = 'multiple',
  compact = false,
  title,
  description,
  disabled = false,
  className = '',
}: AssignFacultyDropdownProps) {
  const toast = useToast();
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Internal selection state (synced with controlled props)
  const [selectedIds, setSelectedIds] = useState<string[]>(controlledFacultyIds || []);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync with controlled prop if passed
  useEffect(() => {
    if (controlledFacultyIds !== undefined) {
      setSelectedIds(controlledFacultyIds);
    }
  }, [controlledFacultyIds]);

  // Fetch registered faculty dynamically from backend / database
  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/faculty');
      if (resp.success && Array.isArray(resp.data)) {
        setFacultyList(resp.data);
      }
    } catch (err: any) {
      console.error('Failed to load faculty directory:', err);
      toast.error('Unable to fetch registered faculty list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Auto-focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Departments list for filter pills
  const departments = useMemo(() => {
    const set = new Set<string>();
    facultyList.forEach((f) => {
      if (f.department) set.add(f.department);
    });
    return Array.from(set);
  }, [facultyList]);

  // Filter faculty by search query (Name, Email, Employee ID, Department)
  const filteredFaculty = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return facultyList.filter((fac) => {
      const matchesDept = departmentFilter === 'ALL' || fac.department === departmentFilter;
      if (!matchesDept) return false;

      if (!q) return true;

      const facultyId = fac.employeeId || fac.id || '';
      const nameMatch = fac.name.toLowerCase().includes(q);
      const emailMatch = fac.email.toLowerCase().includes(q);
      const idMatch = facultyId.toLowerCase().includes(q);
      const deptMatch = fac.department ? fac.department.toLowerCase().includes(q) : false;

      return nameMatch || emailMatch || idMatch || deptMatch;
    });
  }, [facultyList, searchQuery, departmentFilter]);

  // Resolve selected faculty member objects
  const selectedFacultyMembers = useMemo(() => {
    return selectedIds
      .map((id) => facultyList.find((f) => f.id === id))
      .filter((f): f is User => Boolean(f));
  }, [selectedIds, facultyList]);

  // Toggle selection for a faculty member
  const handleToggleSelect = (faculty: User) => {
    if (disabled) return;

    let newSelected: string[];
    if (mode === 'single') {
      newSelected = selectedIds.includes(faculty.id) ? [] : [faculty.id];
    } else {
      if (selectedIds.includes(faculty.id)) {
        newSelected = selectedIds.filter((id) => id !== faculty.id);
      } else {
        newSelected = [...selectedIds, faculty.id];
      }
    }

    setSelectedIds(newSelected);
    const members = newSelected
      .map((id) => facultyList.find((f) => f.id === id))
      .filter((f): f is User => Boolean(f));
    onChange?.(newSelected, members);

    if (mode === 'single') {
      setIsOpen(false);
    }
  };

  const handleRemoveSupervisor = (facultyId: string) => {
    if (disabled) return;
    const newSelected = selectedIds.filter((id) => id !== facultyId);
    setSelectedIds(newSelected);
    const members = newSelected
      .map((id) => facultyList.find((f) => f.id === id))
      .filter((f): f is User => Boolean(f));
    onChange?.(newSelected, members);
  };

  const handleSelectAllFiltered = () => {
    if (disabled || mode === 'single') return;
    const filteredIds = filteredFaculty.map((f) => f.id);
    const merged = Array.from(new Set([...selectedIds, ...filteredIds]));
    setSelectedIds(merged);
    const members = merged
      .map((id) => facultyList.find((f) => f.id === id))
      .filter((f): f is User => Boolean(f));
    onChange?.(merged, members);
  };

  const handleClearSelection = () => {
    if (disabled) return;
    setSelectedIds([]);
    onChange?.([], []);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dedicated Save Assignment Handler
  const handleAssignSupervisor = async () => {
    if (!contestId) {
      toast.error('Contest ID is missing for assignment.');
      return;
    }

    if (selectedIds.length === 0) {
      toast.error('Please select at least one faculty supervisor before assigning.');
      return;
    }

    setIsSaving(true);
    try {
      const resp = await apiClient.post(`/admin/contests/${contestId}/assign-faculty`, {
        facultyIds: selectedIds,
      });

      if (resp.success) {
        const assignedNames = selectedFacultyMembers.map((f) => f.name).join(', ') || 'Faculty';
        toast.success(
          resp.message ||
            `Supervisor(s) [${assignedNames}] successfully assigned to ${contestName || 'contest'}!`
        );
        onAssignedSuccess?.();
      } else {
        toast.error(resp.message || 'Failed to save faculty supervisor assignment.');
      }
    } catch (err: any) {
      console.error('Error assigning faculty supervisor:', err);
      toast.error(err.message || 'An error occurred while assigning faculty supervisor.');
    } finally {
      setIsSaving(false);
    }
  };

  const getFacultyId = (fac: User) => fac.employeeId || `FAC-${fac.id.replace('usr_fac_', '')}`;

  return (
    <div className={`space-y-4 ${className}`} ref={dropdownRef}>
      {/* Section Header */}
      {(title || description) && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" /> {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
          <span className="text-[11px] font-bold text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-full border border-purple-500/30">
            {selectedIds.length} Assigned
          </span>
        </div>
      )}

      {/* DROPDOWN SELECT TRIGGER */}
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <IdCard className="w-3.5 h-3.5 text-purple-400" />
            Select Faculty Supervisor (Name, Email, or Faculty ID)
          </span>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-[11px] text-slate-400 hover:text-red-400 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </label>

        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
            isOpen
              ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10'
              : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 font-bold text-xs">
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              ) : selectedFacultyMembers.length > 0 ? (
                selectedFacultyMembers.length
              ) : (
                <UserCheck className="w-4 h-4 text-purple-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {loading ? (
                <span className="text-xs text-slate-400">Loading registered faculty members...</span>
              ) : selectedFacultyMembers.length === 0 ? (
                <span className="text-xs text-slate-400">
                  Click to search and select faculty supervisor...
                </span>
              ) : selectedFacultyMembers.length === 1 ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-bold text-white truncate">
                    {selectedFacultyMembers[0].name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono shrink-0">
                    {getFacultyId(selectedFacultyMembers[0])}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    ({selectedFacultyMembers[0].department || 'Computer Science'})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {selectedFacultyMembers.length} Supervisors Selected
                  </span>
                  <span className="text-[11px] text-purple-300 truncate">
                    ({selectedFacultyMembers.map((f) => f.name.split(' ')[0]).join(', ')})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
              {facultyList.length} in directory
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-purple-400' : ''
              }`}
            />
          </div>
        </button>

        {/* DROPDOWN MENU PANEL */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Box */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/60 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, faculty ID (e.g. FAC-2024), or department..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Department Filters & Quick Select */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto text-[11px] pb-0.5 no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDepartmentFilter('ALL')}
                    className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                      departmentFilter === 'ALL'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({facultyList.length})
                  </button>
                  {departments.map((dept) => {
                    const count = facultyList.filter((f) => f.department === dept).length;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setDepartmentFilter(dept)}
                        className={`px-2 py-0.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                          departmentFilter === dept
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {dept.split(' ')[0]} ({count})
                      </button>
                    );
                  })}
                </div>

                {mode === 'multiple' && filteredFaculty.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
                    >
                      Select Filtered
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Faculty List Items */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredFaculty.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <UserX className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">
                    No faculty members found matching &quot;{searchQuery}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setDepartmentFilter('ALL');
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Clear Search Filters
                  </button>
                </div>
              ) : (
                filteredFaculty.map((fac) => {
                  const isSelected = selectedIds.includes(fac.id);
                  const facId = getFacultyId(fac);

                  return (
                    <div
                      key={fac.id}
                      onClick={() => handleToggleSelect(fac)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500/60 text-white shadow-sm'
                          : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox or Selection Indicator */}
                        <div
                          className={`w-4 h-4 rounded ${
                            mode === 'single' ? 'rounded-full' : 'rounded'
                          } border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {fac.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs truncate">{fac.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                              {facId}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              {fac.email}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400 truncate">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              {fac.department || 'Computer Science'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer Actions */}
            <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Showing <b className="text-white">{filteredFaculty.length}</b> of{' '}
                <b className="text-white">{facultyList.length}</b> registered supervisors
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
              >
                Close Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SELECTED SUPERVISOR(S) DETAIL CARD PREVIEW */}
      {selectedFacultyMembers.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Assigned Supervisor Details ({selectedFacultyMembers.length})
            </span>
            <span className="text-[11px] text-purple-400 font-medium">
              Authorized Contest Proctoring Access
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {selectedFacultyMembers.map((fac) => {
              const facId = getFacultyId(fac);
              return (
                <div
                  key={fac.id}
                  className="p-3.5 bg-gradient-to-br from-slate-900 via-purple-950/15 to-slate-900 border border-purple-500/30 rounded-2xl shadow-lg relative overflow-hidden group transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
                        <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-white text-xs">
                          {fac.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{fac.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <IdCard className="w-3 h-3 text-purple-400" />
                            {facId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(facId, `id_${fac.id}`)}
                            title="Copy Faculty ID"
                            className="text-slate-500 hover:text-purple-300 text-[10px]"
                          >
                            {copiedId === `id_${fac.id}` ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <a
                              href={`mailto:${fac.email}`}
                              className="text-slate-300 hover:text-purple-300 truncate"
                            >
                              {fac.email}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyText(fac.email, `email_${fac.id}`)}
                              title="Copy Email"
                              className="text-slate-500 hover:text-purple-300 ml-0.5"
                            >
                              {copiedId === `email_${fac.id}` ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-slate-400 truncate">
                              {fac.department || 'Computer Science & Engineering'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                            <ShieldCheck className="w-3 h-3 text-purple-400" /> Designated Contest Supervisor
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
                            <Sparkles className="w-3 h-3 text-emerald-400" /> Scoped Live Telemetry & Proctoring
                          </span>
                        </div>
                      </div>
                    </div>

                    {!disabled && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveSupervisor(fac.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove this supervisor"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASSIGN SUPERVISOR ACTION BUTTON */}
      {showSaveButton && contestId && (
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {selectedIds.length === 0 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> No supervisor selected yet
              </span>
            ) : (
              <span className="text-purple-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {selectedIds.length} supervisor{selectedIds.length > 1 ? 's' : ''} ready to assign
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isSaving || disabled || selectedIds.length === 0}
            onClick={handleAssignSupervisor}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              selectedIds.length === 0 || disabled || isSaving
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25 active:scale-95'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving Assignment...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Assign Supervisor{selectedIds.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
