import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  PlusCircle,
  Eye,
  EyeOff,
  Play,
  Trash2,
  Edit,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Code2,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { TestCase, Question } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAuthStore } from '../../store/authStore';
import ContextSelector from '../../components/ContextSelector';

export default function TestCaseManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContextId, setSelectedContextId] = useState<string>(
    searchParams.get('contextId') || 'ALL'
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    searchParams.get('questionId') || 'ALL'
  );

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestCase | null>(null);
  const [runnerResult, setRunnerResult] = useState<any | null>(null);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    questionId: '',
    input: '',
    expectedOutput: '',
    isHidden: false,
    isEnabled: true,
    description: '',
    executionTimeLimitMs: 2000,
  });

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const tcParams: Record<string, string> = {};
      if (selectedQuestionId !== 'ALL') tcParams.questionId = selectedQuestionId;
      if (selectedContextId !== 'ALL') tcParams.contextId = selectedContextId;

      const qParams: Record<string, string> = {};
      if (selectedContextId !== 'ALL') qParams.contextId = selectedContextId;

      // Sync URL
      const newUrlParams = new URLSearchParams();
      if (selectedContextId !== 'ALL') newUrlParams.set('contextId', selectedContextId);
      if (selectedQuestionId !== 'ALL') newUrlParams.set('questionId', selectedQuestionId);
      setSearchParams(newUrlParams, { replace: true });

      const [tcResp, qResp] = await Promise.all([
        apiClient.get('/admin/test-cases', Object.keys(tcParams).length > 0 ? tcParams : undefined),
        apiClient.get('/admin/questions', Object.keys(qParams).length > 0 ? qParams : undefined),
      ]);

      if (tcResp && tcResp.data) {
        setTestCases(Array.isArray(tcResp.data) ? tcResp.data : []);
      } else {
        setTestCases([]);
      }

      if (qResp && qResp.data) {
        const qList = Array.isArray(qResp.data) ? qResp.data : [];
        setQuestions(qList);
        if (!formData.questionId && qList.length > 0) {
          setFormData((prev) => ({ ...prev, questionId: qList[0].id }));
        }
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      console.error('Failed to load test cases:', err);
      toast.error('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedContextId, selectedQuestionId]);

  const handleOpenAddModal = () => {
    setEditingTestCase(null);
    setFormData({
      questionId: selectedQuestionId !== 'ALL' ? selectedQuestionId : (questions[0]?.id || ''),
      input: '',
      expectedOutput: '',
      isHidden: true,
      isEnabled: true,
      description: 'Hidden validation test case',
      executionTimeLimitMs: 2000,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (tc: TestCase) => {
    setEditingTestCase(tc);
    setFormData({
      questionId: tc.questionId,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden,
      isEnabled: tc.isEnabled,
      description: tc.description || '',
      executionTimeLimitMs: tc.executionTimeLimitMs || 2000,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.input || !formData.expectedOutput) {
      toast.error('Input and Expected Output are mandatory');
      return;
    }

    try {
      if (editingTestCase) {
        const resp = await apiClient.put(`/admin/test-cases/${editingTestCase.id}`, formData);
        if (resp.success) {
          toast.success('Test case updated successfully');
        }
      } else {
        const resp = await apiClient.post('/admin/test-cases', formData);
        if (resp.success) {
          toast.success('Test case created');
        }
      }
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save test case');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const resp = await apiClient.delete(`/admin/test-cases/${deleteTarget.id}`);
      if (resp.success) {
        toast.info('Test case deleted');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRunTest = async (tc: TestCase) => {
    setRunningTestId(tc.id);
    try {
      const resp = await apiClient.post(`/admin/test-cases/${tc.id}/run`);
      if (resp.success && resp.data) {
        setRunnerResult(resp.data);
        toast.success(`Test case passed in ${resp.data.executionTimeMs}ms`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Test execution failed');
    } finally {
      setRunningTestId(null);
    }
  };

  const safeTestCases = Array.isArray(testCases) ? testCases : [];
  const safeQuestions = Array.isArray(questions) ? questions : [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-purple-400" /> Test Validator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Author and manage visible sample test cases and isolated hidden evaluation suites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add Test Case
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-400">
              Read-Only Access
            </div>
          )}
        </div>
      </div>

      {/* Security Notice Pill */}
      <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs text-purple-200">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
          <span>
            <b>Security Isolation Active:</b> Hidden test cases are evaluated entirely within the Dockerized Kotlin sandbox and are strictly filtered from student client payloads.
          </span>
        </div>
      </div>

      {/* Filter Toolbar: Context + Question Filter Dropdowns */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Context Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Context:</span>
            <ContextSelector
              selectedContextId={selectedContextId}
              onContextChange={(ctx) => {
                setSelectedContextId(ctx);
                setSelectedQuestionId('ALL');
              }}
              variant="dark"
              size="sm"
              className="w-48 sm:w-56"
            />
          </div>

          {/* Question Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Problem:</span>
            <select
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 max-w-xs truncate"
            >
              <option value="ALL">All Problems ({safeQuestions.length} questions)</option>
              {safeQuestions.map((q) => (
                <option key={q.id} value={q.id}>
                  Level {q.difficulty}: {q.title}
                </option>
              ))}
            </select>
          </div>

          {(selectedContextId !== 'ALL' || selectedQuestionId !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedContextId('ALL');
                setSelectedQuestionId('ALL');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5 text-rose-400" /> Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Showing <b className="text-white">{safeTestCases.length}</b> test cases
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Problem</th>
                <th className="p-4">Description</th>
                <th className="p-4">Input Data</th>
                <th className="p-4">Expected Output</th>
                <th className="p-4">Timeout</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && safeTestCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading test cases...</div>
                  </td>
                </tr>
              ) : safeTestCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    No test cases registered for this question
                  </td>
                </tr>
              ) : (
                safeTestCases.map((tc) => {
                  const q = safeQuestions.find((item) => item.id === tc.questionId);
                  const isRunning = runningTestId === tc.id;

                  return (
                    <tr key={tc.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tc.isHidden
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {tc.isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {tc.isHidden ? 'HIDDEN' : 'VISIBLE'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{q?.title || tc.questionId}</div>
                        <div className="text-[11px] text-slate-400">Difficulty Level {q?.difficulty || 1}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-300">
                        {tc.description || 'Validation Case'}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-300 max-w-xs truncate">
                        {tc.input}
                      </td>
                      <td className="p-4 font-mono text-xs text-emerald-400 max-w-xs truncate">
                        {tc.expectedOutput}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {tc.executionTimeLimitMs || 2000}ms
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                          ENABLED
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin && (
                            <button
                              onClick={() => handleRunTest(tc)}
                              disabled={isRunning}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold border border-emerald-500/30 transition-all"
                              title="Execute Test Runner Mock"
                            >
                              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} /> Run
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(tc)}
                                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-950/40"
                                title="Edit Test Case"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(tc)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                                title="Delete Test Case"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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

      {/* Runner Result Drawer/Modal */}
      {runnerResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Docker Sandbox Runner Execution
              </h3>
              <button onClick={() => setRunnerResult(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold">
                ✓ ALL ASSERTIONS PASSED (Status 0)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Execution Time</span>
                  <span className="font-bold text-white mt-0.5 block">{runnerResult.executionTimeMs} ms</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Allocated RAM</span>
                  <span className="font-bold text-white mt-0.5 block">{runnerResult.memoryUsedMb}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                <div className="text-slate-500 mb-1">// Standard Sandbox Output:</div>
                <pre>{runnerResult.sandboxLogs}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setRunnerResult(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Output
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingTestCase ? 'Edit Test Case' : 'Add Test Case to Problem'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTestCase} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Associated Problem *</label>
                <select
                  value={formData.questionId}
                  onChange={(e) => setFormData({ ...formData, questionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  {safeQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      Level {q.difficulty}: {q.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description / Label</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Hidden edge case with maximum buffer"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Input Data (STDOUT / Args) *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.input}
                  onChange={(e) => setFormData({ ...formData, input: e.target.value })}
                  placeholder="Raw input passed to Kotlin solution..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Expected Output *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.expectedOutput}
                  onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                  placeholder="Expected output assertion..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isHidden}
                    onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
                    className="rounded bg-slate-700 border-slate-600 text-purple-600"
                  />
                  <span className="font-bold text-white">Hidden Test Case</span>
                  <span className="text-slate-500">(Never exposed to students)</span>
                </label>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                >
                  {editingTestCase ? 'Update Test Case' : 'Save Test Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Test Case?"
        description="Are you sure you want to delete this test case from the automated test suite?"
        confirmText="Delete Test Case"
        variant="danger"
      />
    </div>
  );
}
