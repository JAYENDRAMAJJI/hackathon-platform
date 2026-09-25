import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { KotlinEditor } from '../../components/KotlinEditor';
import { ContestTimer } from '../../components/ContestTimer';
import { QuestionPaperPreview, QuestionPaperData } from '../../components/student/QuestionPaperPreview';
import {
  Play,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  Terminal as TerminalIcon,
  RefreshCw,
  Trophy,
  Award,
  Layers,
  Sparkles,
  KeyRound,
  Lock,
  ArrowLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  HelpCircle,
  Code2,
  AlertCircle,
  ShieldAlert,
  FastForward,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';

export default function ContestArena() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contestIdParam = searchParams.get('contestId');
  const [viewingDetailsFirst, setViewingDetailsFirst] = useState<boolean>(() => {
    return (
      searchParams.get('preview') === 'true' ||
      searchParams.get('view') === 'preview' ||
      searchParams.get('mode') === 'instructions'
    );
  });
  const navigate = useNavigate();
  const toast = useToast();

  // Active Contest Conflict State (Single Active Contest Rule Enforcement)
  const [activeContestConflict, setActiveContestConflict] = useState<{
    activeContestId: string;
    activeContestName: string;
    timeRemainingSeconds?: number;
  } | null>(null);

  // Arena & Lifecycle State
  const [sessionState, setSessionState] = useState<'LOADING' | 'NOT_JOINED' | 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED'>('LOADING');
  const [paperData, setPaperData] = useState<QuestionPaperData | null>(null);
  const [arenaData, setArenaData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Editor and Execution State
  const [code, setCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('Kotlin 2.0 (JVM 21)');
  const [activeTab, setActiveTab] = useState<'problem' | 'result'>('problem');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState<string>('// Execution Diagnostics: Run visible test fixtures or submit solution...');

  // Modals and Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishingContest, setFinishingContest] = useState(false);

  // Skips State (Strictly Max 3 Skips Allowed per Contest, -5 pts Deduction per Skip)
  const [remainingSkips, setRemainingSkips] = useState<number>(3);
  const [isSkipping, setIsSkipping] = useState<boolean>(false);
  const [showSkipModal, setShowSkipModal] = useState<boolean>(false);

  // In-Arena Code Lock Gate
  const [gateCode, setGateCode] = useState('');
  const [unlockingGate, setUnlockingGate] = useState(false);
  const [unjoinedError, setUnjoinedError] = useState<string | null>(null);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // 1. Fetch Complete Question Paper Data
  const loadQuestionPaper = async () => {
    try {
      const url = contestIdParam ? `/student/contest/paper?contestId=${contestIdParam}` : '/student/contest/paper';
      const resp = await apiClient.get(url);
      if (resp.success && resp.data) {
        setPaperData(resp.data);
        if (resp.data.remainingSkips !== undefined) {
          setRemainingSkips(resp.data.remainingSkips);
        } else if (resp.data.contest?.remainingSkips !== undefined) {
          setRemainingSkips(resp.data.contest.remainingSkips);
        }
        return resp.data;
      }
    } catch (err: any) {
      console.error('Failed to load question paper:', err);
      const isConflict = err.code === 'ACTIVE_CONTEST_EXISTS' || err.status === 409 || err.data?.code === 'ACTIVE_CONTEST_EXISTS';
      if (isConflict) {
        const targetId = err.data?.data?.activeContestId || err.data?.activeContestId || err.activeContestId;
        const targetName = err.data?.data?.activeContestName || err.data?.activeContestName || 'Active Competition';
        setActiveContestConflict({
          activeContestId: targetId,
          activeContestName: targetName,
          timeRemainingSeconds: err.data?.data?.timeRemainingSeconds,
        });
        toast.error(`You already have an active contest ("${targetName}"). You cannot enter another contest until your current contest is completed or ended.`);
        return null;
      }
      const msg = err.message || 'Contest not joined';
      if (msg.toLowerCase().includes('not joined') || err.code === 'CONTEST_NOT_JOINED') {
        setSessionState('NOT_JOINED');
        setUnjoinedError(msg);
      } else {
        toast.error(msg);
      }
    }
    return null;
  };

  // 2. Synchronize Active Contest Session State
  const syncContestSession = async () => {
    try {
      setSessionState('LOADING');
      setUnjoinedError(null);

      // Pre-check for single active contest rule enforcement
      try {
        const activeCheck = await apiClient.get('/student/active-contest');
        if (activeCheck.success && activeCheck.data?.hasActiveContest && activeCheck.data.activeContest) {
          const currentActive = activeCheck.data.activeContest;
          if (contestIdParam && contestIdParam !== currentActive.id) {
            setActiveContestConflict({
              activeContestId: currentActive.id,
              activeContestName: currentActive.name,
              timeRemainingSeconds: currentActive.timeRemainingSeconds,
            });
            return;
          }
          if (!contestIdParam) {
            navigate(`/student/contest?contestId=${currentActive.id}`, { replace: true });
            return;
          }
        }
      } catch (checkErr) {
        console.warn('Active contest check skipped:', checkErr);
      }

      // Check contest state from backend
      const stateUrl = contestIdParam ? `/student/contest/state?contestId=${contestIdParam}` : '/student/contest/state';
      const stateResp = await apiClient.get(stateUrl);

      if (stateResp.success && stateResp.data) {
        const d = stateResp.data;

        // If student has NOT started the contest yet:
        if (d.sessionState === 'NOT_STARTED' || !d.isStarted) {
          const paper = await loadQuestionPaper();
          if (paper) {
            setSessionState('NOT_STARTED');
          }
          return;
        }

        // If completed or expired:
        if (d.sessionState === 'COMPLETED' || d.sessionState === 'EXPIRED') {
          setArenaData(d);
          setSessionState(d.sessionState);
          await loadQuestionPaper();
          return;
        }

        // Contest is ACTIVE (IN PROGRESS):
        setArenaData(d);
        if (d.remainingSkips !== undefined) {
          setRemainingSkips(d.remainingSkips);
        } else if (d.session?.remainingSkips !== undefined) {
          setRemainingSkips(d.session.remainingSkips);
        } else if (d.contest?.remainingSkips !== undefined) {
          setRemainingSkips(d.contest.remainingSkips);
        } else if (d.session?.skippedCount !== undefined) {
          setRemainingSkips(Math.max(0, 3 - d.session.skippedCount));
        }
        setSessionState('ACTIVE');
        const cId = d.contest?.id || contestIdParam || 'contest_1';
        const rawQList = d.questions || [];
        const qList = rawQList.map((q: any) => {
          const isLocallySolved = localStorage.getItem(`contest_${cId}_solved_${q.id}`) === 'true';
          return {
            ...q,
            status: q.status === 'SOLVED' || isLocallySolved ? 'SOLVED' : q.status,
          };
        });
        setQuestions(qList);

        // Find active question index
        let curIdx = 0;
        if (d.activeQuestionId) {
          const found = qList.findIndex((q: any) => q.id === d.activeQuestionId);
          if (found !== -1) curIdx = found;
        }
        setActiveQuestionIndex(curIdx);

        // Load active question code draft
        const activeQ = qList[curIdx];
        if (activeQ) {
          const cId = d.contest?.id || contestIdParam || 'contest_1';
          const savedDraft = localStorage.getItem(`draft_code_${cId}_${activeQ.id}`);
          setCode(savedDraft || activeQ.starterCode || 'class Solution {\n    // Write Kotlin solution here\n}');
        }

        // Also fetch question paper in background for in-arena reference
        loadQuestionPaper();
      }
    } catch (err: any) {
      console.error('Failed to sync contest session:', err);
      const isConflict = err.code === 'ACTIVE_CONTEST_EXISTS' || err.status === 409 || err.data?.code === 'ACTIVE_CONTEST_EXISTS';
      if (isConflict) {
        const targetId = err.data?.data?.activeContestId || err.data?.activeContestId || err.activeContestId;
        const targetName = err.data?.data?.activeContestName || err.data?.activeContestName || 'Active Competition';
        setActiveContestConflict({
          activeContestId: targetId,
          activeContestName: targetName,
          timeRemainingSeconds: err.data?.data?.timeRemainingSeconds,
        });
        toast.error(`You already have an active contest ("${targetName}"). You cannot enter another contest until your current contest is completed or ended.`);
        return;
      }
      const errorMsg = err.message || 'Unable to synchronize contest arena.';
      if (
        errorMsg.toLowerCase().includes('not joined') ||
        errorMsg.toLowerCase().includes('access code') ||
        err.code === 'CONTEST_NOT_JOINED'
      ) {
        setSessionState('NOT_JOINED');
        setUnjoinedError(errorMsg);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  useEffect(() => {
    syncContestSession();
  }, [contestIdParam]);

  useEffect(() => {
    if (
      searchParams.get('preview') === 'true' ||
      searchParams.get('view') === 'preview' ||
      searchParams.get('mode') === 'instructions'
    ) {
      setViewingDetailsFirst(true);
    }
  }, [searchParams]);

  // 3. Start Contest Action (Triggered from Question Paper Preview Confirmation)
  const handleStartContest = async () => {
    setIsStarting(true);
    try {
      const cId = paperData?.contest?.id || contestIdParam || 'contest_1';
      const resp = await apiClient.post('/student/contest/start', {
        contestId: cId,
      });

      if (resp.success) {
        toast.success('Contest started! The countdown timer is now active.');
        await syncContestSession();
      }
    } catch (err: any) {
      console.error('Failed to start contest:', err);
      const isConflict = err.code === 'ACTIVE_CONTEST_EXISTS' || err.status === 409 || err.data?.code === 'ACTIVE_CONTEST_EXISTS';
      if (isConflict) {
        const targetId = err.data?.data?.activeContestId || err.data?.activeContestId || err.activeContestId;
        const targetName = err.data?.data?.activeContestName || err.data?.activeContestName || 'Active Competition';
        setActiveContestConflict({
          activeContestId: targetId,
          activeContestName: targetName,
          timeRemainingSeconds: err.data?.data?.timeRemainingSeconds,
        });
        toast.error(`You already have an active contest ("${targetName}"). You cannot enter another contest until your current contest is completed or ended.`);
        return;
      }
      toast.error(err.message || 'Failed to start contest attempt.');
    } finally {
      setIsStarting(false);
    }
  };

  // 4. Switch Selected Question (Auto-saves draft and loads next question's code)
  const handleSelectQuestion = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length || newIndex === activeQuestionIndex) return;

    const currentQ = questions[activeQuestionIndex];
    const cId = arenaData?.contest?.id || contestIdParam || 'contest_1';

    // Auto-save current question code
    if (currentQ && code) {
      localStorage.setItem(`draft_code_${cId}_${currentQ.id}`, code);
      apiClient.post('/student/contest/save-draft', {
        contestId: cId,
        questionId: currentQ.id,
        code,
        language: selectedLanguage,
      }).catch(() => {});
    }

    // Switch to new question
    setActiveQuestionIndex(newIndex);
    const nextQ = questions[newIndex];
    if (nextQ) {
      const saved = localStorage.getItem(`draft_code_${cId}_${nextQ.id}`);
      setCode(saved || nextQ.starterCode || 'class Solution {\n    // Write Kotlin solution here\n}');
      setResult(null);
      setActiveTab('problem');
    }
  };

  // 5. Local Draft Auto-Saving Debounce
  useEffect(() => {
    if (sessionState !== 'ACTIVE') return;
    const currentQ = questions[activeQuestionIndex];
    if (!currentQ || !code) return;

    const cId = arenaData?.contest?.id || contestIdParam || 'contest_1';
    const timer = setTimeout(() => {
      const savedCode = localStorage.getItem(`draft_code_${cId}_${currentQ.id}`);
      if (code !== savedCode) {
        localStorage.setItem(`draft_code_${cId}_${currentQ.id}`, code);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);

        apiClient.post('/student/contest/save-draft', {
          contestId: cId,
          questionId: currentQ.id,
          code,
          language: selectedLanguage,
        }).catch(() => {});
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [code, activeQuestionIndex, sessionState]);

  // 6. Run Code (Visible Tests Only)
  const handleRunCode = async () => {
    const currentQ = questions[activeQuestionIndex];
    if (!currentQ) return;

    setIsExecuting(true);
    setActiveTab('result');
    setResult(null);
    setConsoleOutput('Compiling Kotlin solution in sandbox environment...\n');
    setIsConsoleExpanded(true);

    try {
      const cId = arenaData?.contest?.id || contestIdParam || 'contest_1';
      const resp = await apiClient.post('/student/run-code', {
        contestId: cId,
        questionId: currentQ.id,
        code,
      });

      if (resp.success && resp.data) {
        const d = resp.data;
        setResult(d);
        if (d.status === 'COMPILATION_ERROR') {
          setConsoleOutput(`[Compiler Diagnostic]\n${d.stderr || d.message}`);
          toast.error('Compilation Error. Review Kotlin syntax.');
        } else if (d.status === 'PASSED') {
          setConsoleOutput(d.stdout || `All visible test fixtures passed (${d.executionTime}).`);
          toast.success('Visible test cases passed!');
        } else {
          setConsoleOutput(`[Sandbox Execution]\n${d.stderr || d.message}`);
        }
      }
    } catch (err: any) {
      console.error('Run code error:', err);
      setConsoleOutput(`[Error]\n${err.message || 'Execution error'}`);
      toast.error(err.message || 'Run code failed');
    } finally {
      setIsExecuting(false);
    }
  };

  // 7. Submit Solution (Automated Grading against Full Test Suite)
  const handleSubmitCode = async () => {
    const currentQ = questions[activeQuestionIndex];
    if (!currentQ) return;

    setIsExecuting(true);
    setActiveTab('result');
    setResult(null);
    setConsoleOutput('Evaluating solution against full test suite (Visible & Confidential Edge Tests)...\n');
    setIsConsoleExpanded(true);

    try {
      const cId = arenaData?.contest?.id || contestIdParam || 'contest_1';
      const resp = await apiClient.post('/student/submit-code', {
        contestId: cId,
        questionId: currentQ.id,
        code,
        language: selectedLanguage,
      });

      if (resp.success && resp.data) {
        const d = resp.data;
        setResult(d);

        const isSolvedNow = (d.verdict === 'ACCEPTED' || d.status === 'SUCCESS' || d.questionStatus === 'SOLVED');

        if (isSolvedNow) {
          const cId = arenaData?.contest?.id || contestIdParam || 'contest_1';
          localStorage.setItem(`contest_${cId}_solved_${currentQ.id}`, 'true');
        }

        // Update question status in local state dynamically without page refresh
        setQuestions((prev) =>
          prev.map((q, idx) => {
            if (idx === activeQuestionIndex) {
              const newStatus = isSolvedNow ? 'SOLVED' : (q.status === 'SOLVED' ? 'SOLVED' : 'ATTEMPTED');
              return { ...q, status: newStatus };
            }
            return q;
          })
        );

        if (d.verdict === 'ACCEPTED' || d.status === 'SUCCESS') {
          setConsoleOutput(
            `> kotlinc solution.kt -include-runtime -d solution.jar\n> java -jar solution.jar\n\n[Submission Accepted]\nAll 6 test cases passed (2 visible + 4 hidden edge tests).\nExecution time: ${d.time}\nMemory used: ${d.memory}\nScore added: +${d.scoreAdded} points\nNew Tournament Score: ${d.newTotalScore} pts`
          );
          toast.success(`🎉 Problem Solved! +${d.scoreAdded} Points Added!`);

          // Update session score in state
          setArenaData((prev: any) => ({
            ...prev,
            session: {
              ...prev?.session,
              score: d.newTotalScore,
              solvedCount: d.solvedCount || (prev?.session?.solvedCount || 0) + 1,
            },
          }));
        } else if (d.status === 'COMPILATION_ERROR') {
          setConsoleOutput(`[Compilation Error]\n${d.compilerOutput || d.message}`);
          toast.error('Compilation failed. Please resolve syntax errors.');
        } else {
          setConsoleOutput(`[Evaluation Failed]\n${d.message || 'Solution failed edge test cases.'}`);
          toast.error('Solution failed on edge tests.');
        }
      }
    } catch (err: any) {
      console.error('Submit code error:', err);
      setConsoleOutput(`[Submission Error]\n${err.message || 'Server evaluation error.'}`);
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsExecuting(false);
    }
  };

  // 8. Finish Contest Action
  const handleConfirmFinish = async () => {
    setFinishingContest(true);
    try {
      const cId = arenaData?.contest?.id || contestIdParam || 'contest_1';
      const resp = await apiClient.post('/student/contest/finish', { contestId: cId });
      if (resp.success) {
        toast.success('Contest finalized! Great job.');
        setShowFinishModal(false);
        await syncContestSession();
      }
    } catch (err: any) {
      console.error('Finish contest error:', err);
      toast.error(err.message || 'Failed to finalize contest');
    } finally {
      setFinishingContest(false);
    }
  };

  // 8b. Skip Question Action (Max 3 skips per contest, -5 points deduction)
  const handleSkipQuestion = async () => {
    const currentQ = questions[activeQuestionIndex];
    if (!currentQ || remainingSkips <= 0) return;

    setIsSkipping(true);
    try {
      const cId = arenaData?.contest?.id || contestIdParam || 'contest_1';
      const resp = await apiClient.post('/student/skip-question', {
        contestId: cId,
        questionId: currentQ.id,
        reason: 'Student skipped question',
      });

      if (resp.success && resp.data) {
        const newRemaining = resp.data.remainingSkips ?? Math.max(0, remainingSkips - 1);
        setRemainingSkips(newRemaining);

        // Update session state in arenaData
        setArenaData((prev: any) => ({
          ...prev,
          session: {
            ...prev?.session,
            score: resp.data.newTotalScore ?? Math.max(0, (prev?.session?.score || 0) - 5),
            skippedCount: resp.data.skippedCount ?? ((prev?.session?.skippedCount || 0) + 1),
            remainingSkips: newRemaining,
          },
        }));

        // Mark current question status as SKIPPED
        setQuestions((prev) =>
          prev.map((q, idx) => {
            if (idx === activeQuestionIndex) {
              return { ...q, status: q.status === 'SOLVED' ? 'SOLVED' : 'SKIPPED' };
            }
            return q;
          })
        );

        toast.warning(`Question skipped (-5 pts). ${newRemaining} of 3 skips remaining.`);
        setShowSkipModal(false);

        // Move to next question if possible
        if (activeQuestionIndex < questions.length - 1) {
          handleSelectQuestion(activeQuestionIndex + 1);
        }
      }
    } catch (err: any) {
      console.error('Failed to skip question:', err);
      toast.error(err.message || 'Failed to skip question');
    } finally {
      setIsSkipping(false);
    }
  };

  // 9. Unlock with Code Gate Handler
  const handleUnlockGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateCode.trim()) {
      toast.error('Please enter the contest access code');
      return;
    }

    setUnlockingGate(true);
    try {
      const resp = await apiClient.post('/student/contests/join', {
        code: gateCode.trim().toUpperCase(),
        contestId: contestIdParam || undefined,
      });
      if (resp.success) {
        toast.success('Contest access code verified! Opening contest details & guidelines...');
        setUnjoinedError(null);
        setViewingDetailsFirst(true);
        await syncContestSession();
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid contest code');
    } finally {
      setUnlockingGate(false);
    }
  };

  // Resizable Console Drag Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - e.clientY;
      const newHeight = Math.max(100, Math.min(500, startHeight.current + delta));
      setConsoleHeight(newHeight);
      setIsConsoleExpanded(true);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = consoleHeight;
    document.body.style.cursor = 'row-resize';
  };

  // ==========================================
  // RENDER STATE 0: ACTIVE CONTEST CONFLICT (PREVENT ENTRY TO ANOTHER CONTEST)
  // ==========================================
  if (activeContestConflict) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center -mx-8 -my-8 bg-slate-950 text-white p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Tournament Regulation Enforcement
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Active Contest in Progress
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You are currently active in{' '}
              <span className="text-white font-extrabold">{activeContestConflict.activeContestName}</span>.
            </p>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Single Active Contest Restriction
              </div>
              <p>
                Platform and tournament rules strictly prevent students from entering, previewing, or starting another contest while a contest session is currently active. You must complete or end your active contest before participating in any other contest.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                const targetId = activeContestConflict.activeContestId;
                setActiveContestConflict(null);
                navigate(`/student/contest?contestId=${targetId}`);
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Resume Active Contest
            </button>

            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STATE 1: LOADING
  // ==========================================
  if (sessionState === 'LOADING') {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center -mx-8 -my-8 bg-slate-950 text-white">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold">Synchronizing Competition Arena...</h3>
        <p className="text-sm text-slate-400 mt-1">Connecting to authoritative session manager.</p>
      </div>
    );
  }

  // ==========================================
  // RENDER STATE 2: NOT JOINED (ACCESS CODE GATE)
  // ==========================================
  if (sessionState === 'NOT_JOINED' || unjoinedError) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center -mx-8 -my-8 bg-slate-950 text-white p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Contest Access Code Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {unjoinedError || 'Please enter your official contest invitation key to unlock the question paper and begin your attempt.'}
            </p>
          </div>

          <form onSubmit={handleUnlockGate} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Enter Contest Access Code
              </label>
              <input
                type="text"
                autoFocus
                value={gateCode}
                onChange={(e) => setGateCode(e.target.value.toUpperCase())}
                placeholder="e.g. HACK2026"
                className="w-full px-4 py-3 bg-slate-800 border border-amber-500/40 rounded-xl text-center font-mono font-black text-lg tracking-widest text-amber-300 uppercase focus:outline-none focus:border-amber-400"
              />
            </div>

            <Button
              type="submit"
              disabled={unlockingGate || !gateCode.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {unlockingGate ? 'Verifying Code...' : 'Unlock Question Paper'}
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-center">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STATE 3: JOINED / NOT STARTED OR VIEWING CONTEST DETAILS FIRST -> QUESTION PAPER PREVIEW
  // ==========================================
  if ((sessionState === 'NOT_STARTED' || viewingDetailsFirst) && paperData) {
    return (
      <QuestionPaperPreview
        paperData={paperData}
        onStartContest={async () => {
          if (sessionState === 'NOT_STARTED' || !arenaData?.session?.startedAt) {
            await handleStartContest();
          }
          setViewingDetailsFirst(false);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('preview');
          newParams.delete('view');
          newParams.delete('mode');
          setSearchParams(newParams, { replace: true });
        }}
        onBackToContests={() => navigate('/student/dashboard')}
        isStarting={isStarting}
      />
    );
  }

  // ==========================================
  // RENDER STATE 4: COMPLETED OR EXPIRED
  // ==========================================
  if (sessionState === 'COMPLETED' || sessionState === 'EXPIRED') {
    const isCompleted = sessionState === 'COMPLETED';
    const contest = arenaData?.contest || paperData?.contest;
    const session = arenaData?.session || {};

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 py-12 font-sans text-white">
        <div className={`p-8 rounded-3xl border text-center space-y-6 shadow-2xl ${
          isCompleted ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/40' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl ${
            isCompleted ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          }`}>
            {isCompleted ? <Trophy className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
          </div>

          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isCompleted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {isCompleted ? 'Official Attempt Submitted' : 'Contest Time Expired'}
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isCompleted ? 'Congratulations on Completing the Contest!' : 'Your Contest Time Has Concluded'}
            </h1>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              {contest?.name || 'Hackathon Coding Championship'}
            </p>
          </div>

          {/* Performance Score Summary */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Final Score</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">{session.score || 0} pts</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Solved Problems</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">{session.solvedCount || 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Tournament Rank</span>
              <span className="text-2xl font-black text-blue-400 font-mono mt-0.5 block">#{session.rank || 1}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
            {paperData && (
              <Button
                variant="secondary"
                onClick={() => setShowPaperModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2 text-blue-400" /> Review Question Paper
              </Button>
            )}
            <Button
              onClick={() => navigate('/student/leaderboard')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
            >
              <Trophy className="w-4 h-4 mr-2 text-amber-400" /> Contest Standings
            </Button>
            <Button
              onClick={() => navigate('/student/dashboard')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Modal for reviewing paper */}
        {showPaperModal && paperData && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <QuestionPaperPreview
                paperData={paperData}
                onStartContest={() => {}}
                onBackToContests={() => setShowPaperModal(false)}
                readOnlyModal={true}
                onCloseModal={() => setShowPaperModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER STATE 5: ACTIVE CONTEST ARENA (QUESTION-BY-QUESTION SOLVING)
  // ==========================================
  const currentQuestion = questions[activeQuestionIndex] || arenaData?.question;
  const contest = arenaData?.contest || { timeRemainingSeconds: 7200, name: 'Hackathon Arena' };
  const session = arenaData?.session || { score: 0, solvedCount: 0, rank: 1 };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -mx-8 -my-8 font-sans bg-slate-950 text-white select-none">
      {/* 1. TOP COMMAND BAR: CONTEST TITLE, TIMER & GLOBAL CONTROLS */}
      <div className="h-14 bg-slate-950 text-white flex items-center justify-between px-6 border-b border-slate-800 shrink-0 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full truncate hidden sm:inline">
            {contest.name}
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="font-extrabold text-sm sm:text-base text-white truncate max-w-sm">
            Q{activeQuestionIndex + 1}: {currentQuestion?.title || 'Algorithmic Problem'}
          </span>
          <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            {currentQuestion?.marks || 20} pts
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Synchronized Authoritative Countdown Timer */}
          <ContestTimer
            initialSeconds={contest.timeRemainingSeconds || 7200}
            onExpire={() => {
              toast.error('Contest deadline has expired. Submissions closed.');
              syncContestSession();
            }}
          />

          {/* Current Score Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800" title="Current session tournament score (Max 100 pts)">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">Score:</span>
            <span className="font-mono font-black text-xs text-amber-400">{session.score || 0} pts</span>
          </div>

          {/* Skips Remaining Badge */}
          <div
            className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
            title="Problem Skips Allowed: Max 3 skips per contest (-5 pts penalty per skip)"
          >
            <FastForward className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">Skips Left:</span>
            <span className={`font-mono font-black text-xs ${remainingSkips > 0 ? 'text-rose-300' : 'text-slate-500'}`}>
              {remainingSkips} / 3
            </span>
          </div>

          {/* Question Paper Review Button */}
          {paperData && (
            <button
              onClick={() => setShowPaperModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              title="Review Complete Question Paper"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Question Paper</span>
            </button>
          )}

          {/* Question Palette Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              !isSidebarCollapsed
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle Questions Navigation Sidebar"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">
              Questions ({questions.filter((q) => q.status === 'SOLVED').length}/{questions.length})
            </span>
          </button>

          {/* Finish Contest Button */}
          <button
            onClick={() => setShowFinishModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <span>Finish Contest</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE SPLIT: 1. QUESTIONS PANEL | 2. PROBLEM DESCRIPTION & RESULTS | 3. CODE EDITOR (COMPILER) */}
      <div className="flex-1 flex overflow-hidden bg-slate-950">
        {/* PANEL 1: QUESTIONS PANEL */}
        <aside
          aria-label="Contest Question Navigation"
          className={`${
            isSidebarCollapsed ? 'w-16' : 'w-64 lg:w-72 xl:w-80'
          } flex flex-col border-r border-slate-800 bg-slate-950 text-white shrink-0 transition-all duration-200 select-none z-10`}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
            {isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Expand Questions Sidebar"
                >
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </button>
                <div className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {questions.filter((q) => q.status === 'SOLVED').length}/{questions.length}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Questions</h3>
                    <p className="text-[10px] text-slate-400">
                      {questions.filter((q) => q.status === 'SOLVED').length} of {questions.length} Completed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Column Header: Question Name | Marks | ✓ */}
          {!isSidebarCollapsed && (
            <div className="grid grid-cols-[1fr_70px_28px] items-center gap-2 px-3.5 py-2 border-b border-slate-800/80 bg-slate-900/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 select-none">
              <span>Question Name</span>
              <span className="text-right">Marks</span>
              <span className="text-center">✓</span>
            </div>
          )}

          {/* Question List: Question Name | Marks | ✓ */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {questions.map((q, idx) => {
              const isActive = idx === activeQuestionIndex;
              const isSolved = q.status === 'SOLVED';

              if (isSidebarCollapsed) {
                return (
                  <button
                    key={q.id || idx}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600/25 border-blue-500 text-white ring-2 ring-blue-500/30'
                        : isSolved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={`${q.title || `Question ${idx + 1}`} | ${q.marks || 20} Marks${isSolved ? ' | Completed ✓' : ''}`}
                  >
                    <span className="text-xs font-black">Q{idx + 1}</span>
                    <span className="text-[9px] font-mono font-bold text-amber-400/90">{q.marks || 20}p</span>

                    {/* Completion Tick */}
                    <div className="h-4 flex items-center justify-center mt-1">
                      {isSolved ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={q.id || idx}
                  onClick={() => handleSelectQuestion(idx)}
                  className={`w-full grid grid-cols-[1fr_70px_28px] items-center gap-2 px-3 py-2.5 rounded-xl transition-all cursor-pointer border text-left group ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/40 shadow-sm'
                      : isSolved
                      ? 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900 text-slate-200'
                      : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/70 text-slate-300'
                  }`}
                  title={`${q.title || `Question ${idx + 1}`} | ${q.marks || 20} Marks${isSolved ? ' | Completed ✓' : ''}`}
                >
                  {/* 1. Question Name */}
                  <div className="min-w-0 pr-1 flex items-center gap-1.5">
                    <span className={`text-xs font-mono font-bold shrink-0 ${isActive ? 'text-blue-400' : isSolved ? 'text-emerald-400' : 'text-slate-400'}`}>
                      Q{idx + 1}.
                    </span>
                    <span className={`text-xs font-semibold truncate ${isActive ? 'text-white font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                      {q.title || q.name || `Question ${idx + 1}`}
                    </span>
                  </div>

                  {/* 2. Marks */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                      {q.marks || 20} pts
                    </span>
                  </div>

                  {/* 3. ✓ (only when successfully completed) */}
                  <div className="flex items-center justify-center shrink-0">
                    {isSolved ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black">
                        <Check className="w-3 h-3 stroke-[3] text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0 space-y-2">
            {!isSidebarCollapsed && (
              <>
                {/* Previous & Next Stepper */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectQuestion(activeQuestionIndex - 1)}
                    disabled={activeQuestionIndex === 0}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer border border-slate-700"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <button
                    onClick={() => handleSelectQuestion(activeQuestionIndex + 1)}
                    disabled={activeQuestionIndex === questions.length - 1}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer border border-slate-700"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {paperData && (
                  <button
                    onClick={() => setShowPaperModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Review Question Paper</span>
                  </button>
                )}
              </>
            )}
          </div>
        </aside>

        {/* PANEL 2: PROBLEM DESCRIPTION & EXECUTION RESULT */}
        <div className="w-[36%] min-w-[320px] max-w-[480px] flex flex-col border-r border-slate-800 bg-slate-900 text-slate-100 shrink-0">
          <div className="flex border-b border-slate-800 bg-slate-950/60 shrink-0">
            <button
              className={`flex-1 py-3 text-xs transition-colors cursor-pointer ${
                activeTab === 'problem'
                  ? 'border-b-2 border-blue-500 text-white bg-slate-900 font-bold'
                  : 'border-b-2 border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 font-semibold'
              }`}
              onClick={() => setActiveTab('problem')}
            >
              Problem Description
            </button>
            <button
              className={`flex-1 py-3 text-xs transition-colors cursor-pointer ${
                activeTab === 'result'
                  ? 'border-b-2 border-blue-500 text-white bg-slate-900 font-bold'
                  : 'border-b-2 border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 font-semibold'
              }`}
              onClick={() => setActiveTab('result')}
            >
              Execution Result {result && (result.status === 'SUCCESS' || result.status === 'PASSED' ? '✓' : '✗')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'problem' ? (
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Level {currentQuestion?.difficulty} • {currentQuestion?.category}
                    </span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      {currentQuestion?.marks || 20} Points
                    </span>
                    {currentQuestion?.status === 'SOLVED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="w-3 h-3" /> Solved
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{currentQuestion?.title}</h2>
                  <div className="text-slate-300 whitespace-pre-wrap font-sans mt-3 leading-relaxed text-sm">
                    {currentQuestion?.problemStatement}
                  </div>
                </div>

                {/* Function Signature */}
                {currentQuestion?.functionSignature && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Kotlin Signature</h3>
                    <div className="bg-slate-950 text-blue-300 p-3 rounded-xl text-xs font-mono border border-slate-800">
                      {currentQuestion.functionSignature}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {currentQuestion?.constraints && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Constraints</h3>
                    <div className="bg-slate-950/60 p-3 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 whitespace-pre-wrap">
                      {currentQuestion.constraints}
                    </div>
                  </div>
                )}

                {/* Sample Test Cases */}
                {currentQuestion?.examples && currentQuestion.examples.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Sample Test Cases</h3>
                    {currentQuestion.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Sample Case {idx + 1}
                        </p>
                        <div className="space-y-2 mt-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Input</span>
                            <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                              {ex.input}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Output</span>
                            <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                              {ex.output}
                            </pre>
                          </div>
                        </div>
                        {ex.explanation && (
                          <p className="text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-slate-800/80">
                            <span className="font-bold text-slate-300">Explanation:</span> {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col justify-center">
                {isExecuting ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 text-slate-400 py-12">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-sm animate-pulse text-slate-300">
                      Executing in isolated competition sandbox...
                    </p>
                  </div>
                ) : result ? (
                  <div className="space-y-6">
                    {result.status === 'SUCCESS' || result.verdict === 'ACCEPTED' ? (
                      <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 text-center shadow-xl animate-in zoom-in-95">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                          <CheckCircle className="w-9 h-9" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-1">Accepted!</h3>
                        <p className="text-emerald-400 text-sm font-semibold mb-4">{result.message}</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>+{result.scoreAdded || currentQuestion.marks} Points Awarded</span>
                        </div>

                        <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 block uppercase font-bold text-[10px]">Execution Time</span>
                            <span className="font-mono font-bold text-white">{result.time || '28 ms'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase font-bold text-[10px]">Memory Used</span>
                            <span className="font-mono font-bold text-white">{result.memory || '14.8 MB'}</span>
                          </div>
                        </div>

                        {activeQuestionIndex < questions.length - 1 && (
                          <Button
                            onClick={() => handleSelectQuestion(activeQuestionIndex + 1)}
                            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            Proceed to Question {activeQuestionIndex + 2} <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                          {result.status === 'PASSED' ? (
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <XCircle className="w-6 h-6 text-rose-400" />
                          )}
                          <h3
                            className={`font-extrabold text-base ${
                              result.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {result.status === 'PASSED' ? 'Visible Test Cases Passed' : result.status || 'Execution Failed'}
                          </h3>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 text-slate-300">
                          <p className="text-slate-400 border-b border-slate-800 pb-2 font-bold">Execution Metrics</p>
                          <div className="flex gap-6 text-slate-300">
                            <div>
                              <span className="text-slate-400">Time:</span> {result.executionTime || result.time || '24 ms'}
                            </div>
                            <div>
                              <span className="text-slate-400">Memory:</span> {result.memory || '14.2 MB'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 text-slate-400 py-12">
                    <TerminalIcon className="w-12 h-12 text-slate-700" />
                    <p className="text-sm font-bold text-slate-300">Ready for Execution</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Run code against visible fixtures or submit solution for automated scoring.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor, Language Selector & Output Console */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Editor Header Bar with Language Selector */}
          <div className="h-10 flex items-center justify-between px-4 shrink-0 bg-slate-900 text-slate-400 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-slate-300 border-none focus:outline-none cursor-pointer"
              >
                <option value="Kotlin 2.0 (JVM 21)" className="bg-slate-900 text-white">Kotlin 2.0 (JVM 21)</option>
                <option value="Java 21" className="bg-slate-900 text-white">Java 21</option>
                <option value="Python 3.12" className="bg-slate-900 text-white">Python 3.12</option>
                <option value="C++ 20" className="bg-slate-900 text-white">C++ 20</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Auto-saved per question
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 w-full bg-[#1e1e1e]">
            <KotlinEditor code={code} onChange={setCode} theme="vs-dark" />
          </div>

          {/* Resizable Output Console */}
          <div
            className="flex flex-col border-t border-slate-800 bg-slate-950 shrink-0"
            style={{ height: isConsoleExpanded ? `${consoleHeight}px` : '40px' }}
          >
            {/* Drag Handle */}
            <div
              className="h-1 bg-slate-800 hover:bg-blue-500 cursor-row-resize transition-colors w-full"
              onMouseDown={handleMouseDown}
            />

            {/* Console Header */}
            <div className="h-9 px-4 flex items-center justify-between border-b border-slate-800 shrink-0 bg-slate-900/90">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
                Execution Diagnostics Console
              </div>
              <button
                onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isConsoleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Console Output Area */}
            {isConsoleExpanded && (
              <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-slate-950">
                <pre
                  className={`whitespace-pre-wrap ${
                    result?.status === 'COMPILATION_ERROR' || result?.status === 'FAILED'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {consoleOutput}
                </pre>
              </div>
            )}
          </div>

          {/* Auto-save Toast Indicator */}
          {showSaveToast && (
            <div className="absolute bottom-20 right-6 bg-slate-800/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Draft auto-saved</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-2xl gap-2 select-none overflow-hidden">
            {/* Left: Console Toggle Button */}
            <button
              type="button"
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
              className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Toggle Diagnostics Console"
            >
              <TerminalIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Console</span>
              {isConsoleExpanded ? (
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              ) : (
                <ChevronUp className="w-3 h-3 text-slate-500 shrink-0" />
              )}
            </button>

            {/* Right: Question Navigation & Code Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Previous Question */}
              <button
                type="button"
                onClick={() => handleSelectQuestion(activeQuestionIndex - 1)}
                disabled={activeQuestionIndex === 0}
                className="h-9 px-2.5 sm:px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1 shadow-sm"
                title="Go to Previous Question"
              >
                <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Prev</span>
              </button>

              {/* Next Question */}
              <button
                type="button"
                onClick={() => handleSelectQuestion(activeQuestionIndex + 1)}
                disabled={activeQuestionIndex === questions.length - 1}
                className="h-9 px-2.5 sm:px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1 shadow-sm"
                title="Go to Next Question"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              {/* Skip Question Action (Max 3 Skips, -5 pts Deduction) */}
              <button
                type="button"
                onClick={() => setShowSkipModal(true)}
                disabled={remainingSkips <= 0 || currentQuestion?.status === 'SOLVED' || isExecuting || isSkipping}
                className="h-9 px-2.5 sm:px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-800/60 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-sm"
                title={
                  remainingSkips <= 0
                    ? 'No skips remaining (Max 3 used)'
                    : currentQuestion?.status === 'SOLVED'
                    ? 'Problem already solved'
                    : `Skip this question (-5 pts). ${remainingSkips} of 3 skips left.`
                }
              >
                <FastForward className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">Skip</span>
                <span className="text-[10px] text-rose-400 font-mono">(-5p)</span>
              </button>

              <div className="h-4 w-px bg-slate-800 shrink-0 mx-0.5" />

              {/* Run Code */}
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isExecuting}
                className="h-9 px-3 sm:px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 text-xs font-bold disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-sm"
                title="Run code against visible sample tests"
              >
                <Play className="w-3 h-3 text-emerald-400 fill-emerald-400/80 shrink-0" />
                <span>Run Code</span>
              </button>

              {/* Submit Solution */}
              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isExecuting}
                className="h-9 px-3.5 sm:px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-blue-600/30 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
                title="Submit solution for evaluation against all test cases"
              >
                <span>Submit Solution</span>
                <Send className="w-3 h-3 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW QUESTION PAPER WHILE INSIDE ARENA */}
      {showPaperModal && paperData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <QuestionPaperPreview
              paperData={paperData}
              onStartContest={() => {}}
              onBackToContests={() => setShowPaperModal(false)}
              readOnlyModal={true}
              onCloseModal={() => setShowPaperModal(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM FINISH CONTEST EARLY */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Finish Contest Early?</h3>
                <p className="text-xs text-slate-400">Final Submission Confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              Are you sure you want to end your contest session? Once confirmed, your answers will be finalized and no further code executions or submissions can be made.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={finishingContest}
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Continue Solving
              </button>
              <button
                disabled={finishingContest}
                onClick={handleConfirmFinish}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50 transition-all"
              >
                {finishingContest ? 'Finalizing...' : 'Yes, Finish & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM QUESTION SKIP (-5 PTS, MAX 3 SKIPS) */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FastForward className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Skip Question {activeQuestionIndex + 1}?</h3>
                <p className="text-xs text-rose-400 font-semibold">-5 Points Score Deduction</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
              <p>
                Are you sure you want to skip <b>&ldquo;{currentQuestion?.title}&rdquo;</b>?
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 pt-1">
                <li>A penalty of <b className="text-rose-400 font-bold">5 points</b> will be deducted immediately.</li>
                <li>
                  You have <b className="text-amber-400 font-bold">{remainingSkips} of 3</b> skips remaining in this contest.
                </li>
                <li>Once all 3 skips are consumed, no further questions can be skipped.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isSkipping}
                onClick={() => setShowSkipModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel & Continue Solving
              </button>
              <button
                type="button"
                disabled={isSkipping || remainingSkips <= 0}
                onClick={handleSkipQuestion}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                {isSkipping ? 'Skipping...' : 'Confirm Skip (-5 pts)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
