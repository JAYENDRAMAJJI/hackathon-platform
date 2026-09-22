import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Layers,
  Code2,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Sliders,
  RefreshCw,
  X,
  AlertCircle,
  HelpCircle,
  FileCode,
  Tag,
  ShieldAlert,
  ChevronRight,
  ListPlus,
  Info
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Question, Contest } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function ContestQuestionsManager() {
  const { id: contestId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [contest, setContest] = useState<Contest | null>(null);
  const [contestQuestions, setContestQuestions] = useState<Question[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [bankDiffFilter, setBankDiffFilter] = useState('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'REMOVE' | 'DELETE';
    question?: Question;
  }>({ isOpen: false, type: 'REMOVE' });

  // Form Data for Create & Edit
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 1,
    category: 'Arrays & Hashing',
    tags: 'kotlin, array, algorithm',
    problemStatement: '',
    functionSignature: 'fun solve(): Unit',
    starterCode: 'class Solution {\n    fun solve() {\n        // Write Kotlin solution here\n    }\n}',
    expectedInput: '',
    expectedOutput: '',
    constraints: '1 <= n <= 10^5',
    sampleInput: '',
    sampleOutput: '',
    explanation: '',
    visibleTestCasesCount: 2,
    hiddenTestCasesCount: 4,
    status: 'ACTIVE',
  });

  // Fetch Contest & Assigned Questions
  const loadData = async () => {
    if (!contestId) return;
    setLoading(true);
    try {
      // 1. Fetch contest questions
      const qResp = await apiClient.get(`/admin/contests/${contestId}/questions`);
      if (qResp.success && qResp.data) {
        setContestQuestions(qResp.data);
        if (qResp.contest) {
          setContest(qResp.contest);
        }
      }

      // 2. Fetch full contest info if needed
      const cResp = await apiClient.get(`/admin/contests/${contestId}`);
      if (cResp.success && cResp.data) {
        setContest(cResp.data);
      }

      // 3. Fetch all questions from repository for the picker
      const bankResp = await apiClient.get('/admin/questions');
      if (bankResp.success && bankResp.data) {
        setBankQuestions(bankResp.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load contest questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contestId]);

  // Open Create Question Modal
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      difficulty: contest?.difficultyRange ? contest.difficultyRange[0] : 1,
      category: 'Arrays & Hashing',
      tags: 'kotlin, contest',
      problemStatement: '',
      functionSignature: 'fun solve(): Unit',
      starterCode: 'class Solution {\n    fun solve() {\n        // Write Kotlin solution here\n    }\n}',
      expectedInput: '',
      expectedOutput: '',
      constraints: '1 <= nums.length <= 10^5',
      sampleInput: '',
      sampleOutput: '',
      explanation: '',
      visibleTestCasesCount: 2,
      hiddenTestCasesCount: 4,
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Question Modal
  const handleOpenEditModal = (q: Question) => {
    setActiveQuestion(q);
    setFormData({
      title: q.title,
      difficulty: q.difficulty,
      category: q.category,
      tags: Array.isArray(q.tags) ? q.tags.join(', ') : '',
      problemStatement: q.problemStatement,
      functionSignature: q.functionSignature,
      starterCode: q.starterCode,
      expectedInput: q.expectedInput || '',
      expectedOutput: q.expectedOutput || '',
      constraints: q.constraints || '',
      sampleInput: q.sampleInput || '',
      sampleOutput: q.sampleOutput || '',
      explanation: q.explanation || '',
      visibleTestCasesCount: q.visibleTestCasesCount || 2,
      hiddenTestCasesCount: q.hiddenTestCasesCount || 4,
      status: q.status,
    });
    setIsEditModalOpen(true);
  };

  // Save / Author New Question Directly Into Contest
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.problemStatement.trim()) {
      toast.error('Please enter problem title and statement');
      return;
    }

    try {
      const payload = {
        ...formData,
        difficulty: Number(formData.difficulty),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const resp = await apiClient.post(`/admin/contests/${contestId}/questions`, payload);
      if (resp.success) {
        toast.success(`Question "${formData.title}" authored and attached to contest!`);
        setIsCreateModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to author question');
    }
  };

  // Update Existing Question
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion) return;

    try {
      const payload = {
        ...formData,
        difficulty: Number(formData.difficulty),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const resp = await apiClient.put(`/admin/contests/${contestId}/questions/${activeQuestion.id}`, payload);
      if (resp.success) {
        toast.success(`Question "${formData.title}" updated successfully!`);
        setIsEditModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update question');
    }
  };

  // Batch Attach Questions From Repository
  const handleAddFromBank = async () => {
    if (selectedBankIds.length === 0) {
      toast.error('Select at least one question to add');
      return;
    }

    try {
      const resp = await apiClient.post(`/admin/contests/${contestId}/questions`, {
        questionIds: selectedBankIds,
      });
      if (resp.success) {
        toast.success(`Added ${selectedBankIds.length} question(s) to contest!`);
        setIsAddBankModalOpen(false);
        setSelectedBankIds([]);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to attach questions');
    }
  };

  // Remove Question From Contest
  const handleRemoveQuestion = async () => {
    if (!confirmModal.question) return;

    try {
      const resp = await apiClient.delete(`/admin/contests/${contestId}/questions/${confirmModal.question.id}`);
      if (resp.success) {
        toast.info(`Removed "${confirmModal.question.title}" from this contest.`);
        setConfirmModal({ isOpen: false, type: 'REMOVE' });
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove question');
    }
  };

  // Difficulty badge color helper
  const getDifficultyBadge = (diff: number) => {
    if (diff <= 3) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (diff <= 6) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
    if (diff <= 8) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  // Filtered Questions in Contest
  const filteredQuestions = contestQuestions.filter((q) => {
    const matchSearch =
      !searchQuery ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.problemStatement.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDiff = difficultyFilter === 'ALL' || q.difficulty === Number(difficultyFilter);
    const matchCat = categoryFilter === 'ALL' || q.category === categoryFilter;

    return matchSearch && matchDiff && matchCat;
  });

  // Calculate Level Distribution (1 - 10)
  const levelDistribution = Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
    const count = contestQuestions.filter((q) => q.difficulty === lvl).length;
    return { level: lvl, count };
  });

  const assignedIdsSet = new Set(contestQuestions.map((q) => q.id));

  // Filter questions available in bank
  const availableBankQuestions = bankQuestions.filter((q) => {
    const matchSearch = !bankSearch || q.title.toLowerCase().includes(bankSearch.toLowerCase()) || q.category.toLowerCase().includes(bankSearch.toLowerCase());
    const matchDiff = bankDiffFilter === 'ALL' || q.difficulty === Number(bankDiffFilter);
    return matchSearch && matchDiff;
  });

  const categories = Array.from(new Set(bankQuestions.map((q) => q.category).filter(Boolean)));

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/contests"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Back to Contests"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 font-mono font-bold tracking-wider uppercase">Contest Challenge Pool</span>
              <span className="text-slate-600">•</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                contest?.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : contest?.status === 'SCHEDULED'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {contest?.status || 'DRAFT'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Code2 className="w-6 h-6 text-blue-400" />
              {contest?.name || 'Contest Questions Arena'}
            </h1>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSelectedBankIds([]);
              setIsAddBankModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            <ListPlus className="w-4 h-4 text-blue-400" /> Add from Question Bank
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Create New Question
          </button>

          <Link
            to={`/admin/contests/${contestId}/edit`}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
            title="Edit Contest Parameters"
          >
            <Sliders className="w-4 h-4" /> Configure Contest
          </Link>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Refresh Questions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contest Overview Summary Card */}
      {contest && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                {contest.description || 'Manage all coding challenges, test case constraints, starter templates, and difficulty distribution for this competition.'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{contest.durationMinutes} min Duration</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{contest.date || 'Scheduled Date'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Range: L{contest.difficultyRange?.[0] || 1} – L{contest.difficultyRange?.[1] || 10}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Level Distribution Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> Difficulty Level Calibration & Pool Balance (1–10)
              </span>
              <span className="text-xs font-bold text-blue-400">
                Total Attached: {contestQuestions.length} Problems
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {levelDistribution.map((item) => {
                const isConfiguredInRange =
                  contest.difficultyRange &&
                  item.level >= contest.difficultyRange[0] &&
                  item.level <= contest.difficultyRange[1];

                const hasQuestions = item.count > 0;

                return (
                  <button
                    key={item.level}
                    onClick={() => setDifficultyFilter(difficultyFilter === String(item.level) ? 'ALL' : String(item.level))}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      difficultyFilter === String(item.level)
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30'
                        : hasQuestions
                        ? 'bg-slate-800/90 text-white border-slate-700 hover:border-blue-500/50'
                        : isConfiguredInRange
                        ? 'bg-slate-900/50 text-slate-500 border-dashed border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 text-slate-600 border-slate-900 opacity-60'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold block">Level {item.level}</span>
                    <span className={`text-base font-extrabold mt-0.5 block ${hasQuestions ? 'text-white' : 'text-slate-600'}`}>
                      {item.count}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      {item.count === 1 ? 'problem' : 'problems'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title, keywords, statement..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Difficulty:
            </span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Levels (1–10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-purple-400" /> Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(difficultyFilter !== 'ALL' || categoryFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setDifficultyFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-slate-400 hover:text-white underline ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
            <Code2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Questions in this Contest Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {contestQuestions.length === 0
                ? 'Attach existing Kotlin problems from your Question Bank repository or author brand new custom questions for this contest.'
                : 'No questions matched your active search or difficulty filters.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddBankModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700"
            >
              <ListPlus className="w-4 h-4 text-blue-400" /> Pick From Question Bank
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25"
            >
              <PlusCircle className="w-4 h-4" /> Create First Question
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((q, index) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Question Details */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-slate-500 font-mono font-bold">#{index + 1}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getDifficultyBadge(q.difficulty)}`}>
                    Level {q.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {q.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{q.id}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {q.problemStatement}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-blue-300 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/50">
                    <FileCode className="w-3 h-3 text-blue-400" /> {q.functionSignature || 'fun solve()'}
                  </span>
                  <span>•</span>
                  <span>Test Cases: <b>{(q.visibleTestCasesCount || 2) + (q.hiddenTestCasesCount || 4)} ({q.visibleTestCasesCount || 2} visible, {q.hiddenTestCasesCount || 4} hidden)</b></span>
                  {q.successRate !== undefined && q.successRate > 0 && (
                    <>
                      <span>•</span>
                      <span>Success Rate: <b className="text-emerald-400">{q.successRate}%</b></span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/80">
                <button
                  onClick={() => {
                    setActiveQuestion(q);
                    setIsPreviewModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  title="Preview Statement & Signature"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> Preview
                </button>

                <button
                  onClick={() => handleOpenEditModal(q)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  title="Edit Problem Statement / Testcases"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                </button>

                <button
                  onClick={() => setConfirmModal({ isOpen: true, type: 'REMOVE', question: q })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
                  title="Remove from this Contest"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Add Questions from Question Bank */}
      {isAddBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-blue-400" /> Select Questions from Question Bank
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick algorithmic challenges to attach to {contest?.name}.
                </p>
              </div>
              <button
                onClick={() => setIsAddBankModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Filter repository questions..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={bankDiffFilter}
                  onChange={(e) => setBankDiffFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Levels</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <option key={lvl} value={lvl}>Level {lvl}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const unattached = availableBankQuestions
                      .filter((q) => !assignedIdsSet.has(q.id))
                      .map((q) => q.id);
                    setSelectedBankIds(unattached);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1"
                >
                  Select All Unattached
                </button>
                <button
                  onClick={() => setSelectedBankIds([])}
                  className="text-xs text-slate-400 hover:text-white font-semibold px-2 py-1"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Questions Picker List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {availableBankQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No questions match your filter.
                </div>
              ) : (
                availableBankQuestions.map((q) => {
                  const isAlreadyAttached = assignedIdsSet.has(q.id);
                  const isChecked = selectedBankIds.includes(q.id);

                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isAlreadyAttached
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                          : isChecked
                          ? 'bg-blue-600/15 border-blue-500/50'
                          : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isAlreadyAttached}
                        checked={isAlreadyAttached || isChecked}
                        onChange={() => {
                          if (isAlreadyAttached) return;
                          if (isChecked) {
                            setSelectedBankIds(selectedBankIds.filter((id) => id !== q.id));
                          } else {
                            setSelectedBankIds([...selectedBankIds, q.id]);
                          }
                        }}
                        className="mt-1 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getDifficultyBadge(q.difficulty)}`}>
                            Level {q.difficulty}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{q.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({q.category})</span>
                          {isAlreadyAttached && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              Already in Contest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                          {q.problemStatement}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">
                Selected: <b className="text-white">{selectedBankIds.length}</b> new questions
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedBankIds.length === 0}
                  onClick={handleAddFromBank}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  Add Selected to Contest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Author New Question Directly Into Contest */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-400" /> Author & Attach Question to Contest
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create a Kotlin problem directly for {contest?.name}.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Problem Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Subarray Product Less Than K"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Difficulty Level (1–10) *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Dynamic Programming"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="kotlin, array, sliding-window"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Problem Statement (Full Description) *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  placeholder="Describe the challenge rules, input definitions, and return objectives..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 font-mono">Kotlin Function Signature *</label>
                <input
                  type="text"
                  required
                  value={formData.functionSignature}
                  onChange={(e) => setFormData({ ...formData, functionSignature: e.target.value })}
                  placeholder="fun numSubarrayProductLessThanK(nums: IntArray, k: Int): Int"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-blue-300 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 font-mono">Starter Code Template</label>
                <textarea
                  rows={4}
                  value={formData.starterCode}
                  onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sample Input</label>
                  <input
                    type="text"
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    placeholder="nums = [10,5,2,6], k = 100"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sample Output</label>
                  <input
                    type="text"
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                    placeholder="8"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Constraints</label>
                <input
                  type="text"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="1 <= nums.length <= 3 * 10^4; 1 <= nums[i] <= 1000"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Visible Test Cases Count</label>
                  <input
                    type="number"
                    value={formData.visibleTestCasesCount}
                    onChange={(e) => setFormData({ ...formData, visibleTestCasesCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Hidden Evaluation Test Cases Count</label>
                  <input
                    type="number"
                    value={formData.hiddenTestCasesCount}
                    onChange={(e) => setFormData({ ...formData, hiddenTestCasesCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25"
                >
                  Create & Attach to Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Question */}
      {isEditModalOpen && activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-400" /> Edit Problem: {activeQuestion.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update problem configuration, difficulty calibration, and starter code.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Problem Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Difficulty Level (1–10) *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Problem Statement *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 font-mono">Kotlin Function Signature *</label>
                <input
                  type="text"
                  required
                  value={formData.functionSignature}
                  onChange={(e) => setFormData({ ...formData, functionSignature: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-blue-300 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 font-mono">Starter Code Template</label>
                <textarea
                  rows={4}
                  value={formData.starterCode}
                  onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sample Input</label>
                  <input
                    type="text"
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sample Output</label>
                  <input
                    type="text"
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Constraints</label>
                <input
                  type="text"
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Preview Question */}
      {isPreviewModalOpen && activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-extrabold border ${getDifficultyBadge(activeQuestion.difficulty)}`}>
                    Level {activeQuestion.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{activeQuestion.category}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {activeQuestion.title}
                </h2>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Statement</h4>
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {activeQuestion.problemStatement}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kotlin Function Signature</h4>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-blue-300 font-mono text-xs overflow-x-auto">
                  {activeQuestion.functionSignature}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Starter Code Template</h4>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto">
                  {activeQuestion.starterCode}
                </pre>
              </div>

              {activeQuestion.constraints && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Constraints</h4>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300">
                    {activeQuestion.constraints}
                  </div>
                </div>
              )}

              {(activeQuestion.sampleInput || activeQuestion.sampleOutput) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">Sample Input</span>
                    <code className="text-white font-mono text-xs">{activeQuestion.sampleInput || '-'}</code>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">Sample Output</span>
                    <code className="text-white font-mono text-xs">{activeQuestion.sampleOutput || '-'}</code>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'REMOVE'}
        onClose={() => setConfirmModal({ isOpen: false, type: 'REMOVE' })}
        onConfirm={handleRemoveQuestion}
        title={`Remove "${confirmModal.question?.title}" from Contest?`}
        description="This will detach this problem from the competition pool. The problem will remain intact in the general Question Bank."
        confirmText="Remove Question"
        variant="danger"
      />
    </div>
  );
}
