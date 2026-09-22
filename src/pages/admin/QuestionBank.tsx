import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Code2,
  Trophy,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Archive,
  Layers,
  CheckCircle2,
  Sliders,
  CheckSquare,
  BarChart3,
  Clock,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Question } from '../../types/admin';
import { formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAuthStore } from '../../store/authStore';
import ContextSelector from '../../components/ContextSelector';

export default function QuestionBank() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'ALL');
  const [contextFilter, setContextFilter] = useState(searchParams.get('contextId') || 'ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'DELETE' | 'CHANGE_DIFFICULTY';
    targetQuestion?: Question;
  }>({ isOpen: false, type: 'DELETE' });

  const [newDifficulty, setNewDifficulty] = useState<number>(1);
  const [difficultyReason, setDifficultyReason] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 1,
    category: 'Arrays & Hashing',
    tags: 'kotlin, array, algorithm',
    problemStatement: '',
    functionSignature: 'fun solve(): Unit',
    starterCode: 'class Solution {\n    fun solve() {\n        // Write solution here\n    }\n}',
    expectedInput: '',
    expectedOutput: '',
    constraints: '1 <= n <= 10^5',
    sampleInput: '',
    sampleOutput: '',
    explanation: '',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 5,
    status: 'ACTIVE',
  });

  const toast = useToast();

  const fetchQuestions = async (overrideParams?: { search?: string; difficulty?: string; category?: string; contextId?: string }) => {
    setLoading(true);
    try {
      const activeSearch = overrideParams?.search !== undefined ? overrideParams.search : search;
      const activeDifficulty = overrideParams?.difficulty !== undefined ? overrideParams.difficulty : difficultyFilter;
      const activeCategory = overrideParams?.category !== undefined ? overrideParams.category : categoryFilter;
      const activeContext = overrideParams?.contextId !== undefined ? overrideParams.contextId : contextFilter;

      const params: Record<string, string> = {};
      if (activeSearch) params.search = activeSearch;
      if (activeDifficulty && activeDifficulty !== 'ALL') params.difficulty = activeDifficulty;
      if (activeCategory && activeCategory !== 'ALL') params.category = activeCategory;
      if (activeContext && activeContext !== 'ALL') params.contextId = activeContext;

      // Sync with URL params
      const newUrlParams = new URLSearchParams();
      if (activeSearch) newUrlParams.set('search', activeSearch);
      if (activeDifficulty && activeDifficulty !== 'ALL') newUrlParams.set('difficulty', activeDifficulty);
      if (activeCategory && activeCategory !== 'ALL') newUrlParams.set('category', activeCategory);
      if (activeContext && activeContext !== 'ALL') newUrlParams.set('contextId', activeContext);
      setSearchParams(newUrlParams, { replace: true });

      const resp = await apiClient.get('/admin/questions', params);
      if (resp && resp.data) {
        setQuestions(resp.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 150);
    return () => clearTimeout(timer);
  }, [search, difficultyFilter, categoryFilter, contextFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setDifficultyFilter('ALL');
    setCategoryFilter('ALL');
    setContextFilter('ALL');
    fetchQuestions({ search: '', difficulty: 'ALL', category: 'ALL', contextId: 'ALL' });
  };

  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      title: '',
      difficulty: 1,
      category: 'Arrays & Hashing',
      tags: 'kotlin, array, algorithm',
      problemStatement: '',
      functionSignature: 'fun solve(): Unit',
      starterCode: 'class Solution {\n    fun solve() {\n        // Write solution here\n    }\n}',
      expectedInput: '',
      expectedOutput: '',
      constraints: '1 <= n <= 10^5',
      sampleInput: '',
      sampleOutput: '',
      explanation: '',
      visibleTestCasesCount: 2,
      hiddenTestCasesCount: 5,
      status: 'ACTIVE',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      title: q.title,
      difficulty: q.difficulty,
      category: q.category,
      tags: q.tags.join(', '),
      problemStatement: q.problemStatement,
      functionSignature: q.functionSignature,
      starterCode: q.starterCode,
      expectedInput: q.expectedInput,
      expectedOutput: q.expectedOutput,
      constraints: q.constraints,
      sampleInput: q.sampleInput,
      sampleOutput: q.sampleOutput,
      explanation: q.explanation,
      visibleTestCasesCount: q.visibleTestCasesCount,
      hiddenTestCasesCount: q.hiddenTestCasesCount,
      status: q.status,
    });
    setIsFormModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.problemStatement) {
      toast.error('Please provide Title and Problem Statement');
      return;
    }

    const payload = {
      ...formData,
      difficulty: Number(formData.difficulty),
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingQuestion) {
        const resp = await apiClient.put(`/admin/questions/${editingQuestion.id}`, payload);
        if (resp.success) {
          toast.success(`Question "${formData.title}" updated`);
        }
      } else {
        const resp = await apiClient.post('/admin/questions', payload);
        if (resp.success) {
          toast.success(`Question "${formData.title}" created in repository`);
        }
      }
      setIsFormModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save question');
    }
  };

  const handleDelete = async (q: Question) => {
    try {
      const resp = await apiClient.delete(`/admin/questions/${q.id}`);
      if (resp.success) {
        toast.info(`Question deleted: ${q.title}`);
        fetchQuestions();
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setModalState({ isOpen: false, type: 'DELETE' });
    }
  };

  const handleChangeDifficulty = async () => {
    if (!modalState.targetQuestion) return;
    try {
      const resp = await apiClient.post(`/admin/questions/${modalState.targetQuestion.id}/change-difficulty`, {
        newDifficulty,
        reason: difficultyReason,
      });
      if (resp.success) {
        toast.success(`Difficulty calibrated to Level ${newDifficulty}`);
        fetchQuestions();
      }
    } catch (err: any) {
      toast.error(err.message || 'Calibration failed');
    } finally {
      setModalState({ isOpen: false, type: 'CHANGE_DIFFICULTY' });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-emerald-400" /> Question Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Author algorithmic challenges, manage visible and hidden test suites, and monitor solve rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/contests"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" /> Contest Pools
          </Link>
          {isAdmin && (
            <Link
              to="/admin/questions/difficulty"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <Sliders className="w-4 h-4 text-blue-400" /> Calibration Suite
            </Link>
          )}
          {isAdmin ? (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add New Question
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-400">
              Read-Only Access
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchQuestions();
          }}
          className="relative w-full md:w-96 flex items-center"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by title, tags, keywords..."
            className="w-full pl-10 pr-24 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchQuestions({ search: '' });
                }}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Context Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Context:</span>
            <ContextSelector
              selectedContextId={contextFilter}
              onContextChange={(ctx) => setContextFilter(ctx)}
              variant="dark"
              size="sm"
              className="w-44 sm:w-56"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Levels (1–10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Arrays & Hashing">Arrays & Hashing</option>
              <option value="Two Pointers">Two Pointers</option>
              <option value="Sliding Window">Sliding Window</option>
              <option value="Stack">Stack</option>
              <option value="Linked Lists">Linked Lists</option>
              <option value="Trees">Trees</option>
              <option value="Graphs">Graphs</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Design">Design</option>
            </select>
          </div>

          {/* Active Filter Clear / Count */}
          {(search || difficultyFilter !== 'ALL' || categoryFilter !== 'ALL' || contextFilter !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5 text-rose-400" /> Reset Filters
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-400">
            {questions.length} problem{questions.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Problem Title & Category</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Test Cases</th>
                <th className="p-4">Success Rate</th>
                <th className="p-4">Avg Solving Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && questions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading questions...</div>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No questions found matching current filters
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const isEasy = q.difficulty <= 3;
                  const isMedium = q.difficulty >= 4 && q.difficulty <= 7;
                  const isHard = q.difficulty >= 8;

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-xl text-xs font-black border ${
                          isEasy
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : isMedium
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          LEVEL {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{q.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{q.category}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {q.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-white font-semibold">
                          <span className="text-emerald-400">{q.visibleTestCasesCount} visible</span> +{' '}
                          <span className="text-purple-400">{q.hiddenTestCasesCount} hidden</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          <span>{q.successRate}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-400" /> {q.averageTimeMinutes} min
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {q.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedQuestion(q)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Preview Question"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/test-cases?questionId=${q.id}`}
                            className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-950/40"
                            title="View / Manage Test Cases"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </Link>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setModalState({ isOpen: true, type: 'CHANGE_DIFFICULTY', targetQuestion: q });
                                  setNewDifficulty(q.difficulty);
                                }}
                                className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40"
                                title="Calibrate Difficulty Level"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(q)}
                                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-950/40"
                                title="Edit Question"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setModalState({ isOpen: true, type: 'DELETE', targetQuestion: q })}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                                title="Delete Question"
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

      {/* QUESTION PREVIEW MODAL */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  DIFFICULTY LEVEL {selectedQuestion.difficulty}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1.5">{selectedQuestion.title}</h3>
                <p className="text-xs text-slate-400">{selectedQuestion.category}</p>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-line">
                <b className="text-white block mb-1 text-sm">Problem Description:</b>
                {selectedQuestion.problemStatement}
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-blue-300">
                <div className="text-slate-500 mb-1">// Kotlin Function Signature & Starter Code</div>
                <pre>{selectedQuestion.starterCode}</pre>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1">Sample Input:</span>
                  <pre className="font-mono text-slate-400">{selectedQuestion.sampleInput}</pre>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1">Sample Output:</span>
                  <pre className="font-mono text-slate-400">{selectedQuestion.sampleOutput}</pre>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Link
                to={`/admin/test-cases?questionId=${selectedQuestion.id}`}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                Manage Test Cases ({selectedQuestion.visibleTestCasesCount + selectedQuestion.hiddenTestCasesCount})
              </Link>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUESTION MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                {editingQuestion ? 'Edit Problem Configuration' : 'Create New Kotlin Question'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">Problem Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Invert Binary Tree"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Difficulty (1–10) *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Arrays & Hashing">Arrays & Hashing</option>
                    <option value="Two Pointers">Two Pointers</option>
                    <option value="Sliding Window">Sliding Window</option>
                    <option value="Stack">Stack</option>
                    <option value="Linked Lists">Linked Lists</option>
                    <option value="Trees">Trees</option>
                    <option value="Graphs">Graphs</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="kotlin, graph, bfs"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Problem Statement (Markdown supported) *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  placeholder="Describe problem, constraints, and requirements..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Kotlin Starter Code Template *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.starterCode}
                  onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-blue-300 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sample Input</label>
                  <textarea
                    rows={2}
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sample Output</label>
                  <textarea
                    rows={2}
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {editingQuestion ? 'Update Question' : 'Publish to Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALIBRATE DIFFICULTY MODAL */}
      {modalState.isOpen && modalState.type === 'CHANGE_DIFFICULTY' && modalState.targetQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" /> Calibrate Question Difficulty
              </h3>
              <button
                onClick={() => setModalState({ isOpen: false, type: 'CHANGE_DIFFICULTY' })}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Adjusting the difficulty rating of <b>{modalState.targetQuestion.title}</b> will recalibrate participant score weighting. This action will be audited.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Target Difficulty Level</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <option key={lvl} value={lvl}>Level {lvl}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Calibration Reason</label>
                <input
                  type="text"
                  value={difficultyReason}
                  onChange={(e) => setDifficultyReason(e.target.value)}
                  placeholder="e.g. Success rate over 90%, recalibrating to lower tier"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setModalState({ isOpen: false, type: 'CHANGE_DIFFICULTY' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeDifficulty}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20"
              >
                Apply Calibration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'DELETE'}
        onClose={() => setModalState({ isOpen: false, type: 'DELETE' })}
        onConfirm={() => modalState.targetQuestion && handleDelete(modalState.targetQuestion)}
        title={`Delete Question: ${modalState.targetQuestion?.title}`}
        description="Are you sure you want to delete this question? Any associated test cases will also be removed."
        confirmText="Delete Question"
        variant="danger"
      />
    </div>
  );
}
