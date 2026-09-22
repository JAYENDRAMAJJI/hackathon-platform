import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { KotlinEditor } from '../../components/KotlinEditor';
import { ContestTimer } from '../../components/ContestTimer';
import {
  Play,
  Send,
  SkipForward,
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
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';

export default function ContestArena() {
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  const navigate = useNavigate();

  const [arenaData, setArenaData] = useState<any>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'problem' | 'result'>('problem');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [consoleHeight, setConsoleHeight] = useState(220);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState<string>('// Execution Console: Run or submit code to view compiler and test diagnostics...');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // In-Arena Code Lock Gate
  const [unjoinedError, setUnjoinedError] = useState<string | null>(null);
  const [gateCode, setGateCode] = useState('');
  const [unlockingGate, setUnlockingGate] = useState(false);

  const toast = useToast();
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Fetch Current Contest State & Active Question
  const loadContestState = async () => {
    try {
      setLoadingQuestion(true);
      setUnjoinedError(null);
      const url = contestId ? `/student/contest/state?contestId=${contestId}` : '/student/contest/state';
      const resp = await apiClient.get(url);
      if (resp.success && resp.data) {
        setArenaData(resp.data);
        const q = resp.data.question;
        const savedDraft = localStorage.getItem(`draft_code_${q.id}`);
        setCode(savedDraft || q.starterCode || 'class Solution {\n    // Write your Kotlin solution here\n}');
        setResult(null);
        setActiveTab('problem');
      }
    } catch (err: any) {
      console.error('Failed to load contest state:', err);
      const errorMsg = err.message || 'Unable to synchronize contest arena.';
      if (
        errorMsg.toLowerCase().includes('not joined') ||
        errorMsg.toLowerCase().includes('access code') ||
        err.code === 'CONTEST_NOT_JOINED'
      ) {
        setUnjoinedError(errorMsg);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoadingQuestion(false);
    }
  };

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
        contestId: contestId || undefined,
      });
      if (resp.success) {
        toast.success('Contest access code verified! Entering arena...');
        setUnjoinedError(null);
        await loadContestState();
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid contest code');
    } finally {
      setUnlockingGate(false);
    }
  };

  useEffect(() => {
    loadContestState();
  }, [contestId]);

  // Resizable Console Drag Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - e.clientY;
      const newHeight = Math.max(100, Math.min(600, startHeight.current + delta));
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

  // Local Draft Auto-Saving
  useEffect(() => {
    if (!arenaData?.question?.id || !code) return;
    const qId = arenaData.question.id;
    const handler = setTimeout(() => {
      const savedCode = localStorage.getItem(`draft_code_${qId}`);
      if (code !== savedCode) {
        localStorage.setItem(`draft_code_${qId}`, code);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [code, arenaData?.question?.id]);

  const question = arenaData?.question;
  const session = arenaData?.session || { score: 0, currentDifficulty: 1, rank: 1 };
  const contest = arenaData?.contest || { timeRemainingSeconds: 5650 };

  // 1. Run Code against Visible Test Cases Only
  const handleRunCode = async () => {
    if (!question?.id) return;
    setIsExecuting(true);
    setActiveTab('result');
    setResult(null);
    setConsoleOutput('Compiling Kotlin source code in sandbox...\n');
    setIsConsoleExpanded(true);

    try {
      const resp = await apiClient.post('/student/run-code', {
        questionId: question.id,
        code,
      });

      if (resp.success && resp.data) {
        const d = resp.data;
        setResult(d);
        if (d.status === 'COMPILATION_ERROR') {
          setConsoleOutput(`[Compiler Diagnostic]\n${d.stderr || d.message}`);
          toast.error('Compilation Error. Review syntax and signatures.');
        } else if (d.status === 'PASSED') {
          setConsoleOutput(d.stdout || `All visible test cases passed.\nExecution finished in ${d.executionTime}.`);
          toast.success('Visible test cases passed!');
        } else {
          setConsoleOutput(`[Execution]\n${d.stderr || d.message}`);
        }
      } else {
        setConsoleOutput(`[Sandbox Error]\n${resp.message || 'Execution error'}`);
        toast.error(resp.message || 'Execution failed');
      }
    } catch (err: any) {
      console.error('Run code error:', err);
      setConsoleOutput(`[Error]\n${err.message || 'Unable to execute code.'}`);
      toast.error(err.message || 'Sandbox error');
    } finally {
      setIsExecuting(false);
    }
  };

  // 2. Submit Code against Visible and Hidden Test Suites
  const handleSubmit = async () => {
    if (!question?.id) return;
    setIsExecuting(true);
    setActiveTab('result');
    setResult(null);
    setConsoleOutput('Evaluating solution against full test suite (Visible & Confidential Hidden Cases)...\n');
    setIsConsoleExpanded(true);

    try {
      const resp = await apiClient.post('/student/submit-code', {
        questionId: question.id,
        code,
        language: 'Kotlin 2.0 (JVM 21)',
      });

      if (resp.success && resp.data) {
        const d = resp.data;
        setResult(d);

        if (d.verdict === 'ACCEPTED' || d.status === 'SUCCESS') {
          setConsoleOutput(
            `> kotlinc solution.kt -include-runtime -d solution.jar\n> java -jar solution.jar\n\n[Submission Accepted]\nAll 6 test cases passed (2 visible + 4 hidden edge tests).\nExecution time: ${d.time}\nMemory used: ${d.memory}\nScore added: +${d.scoreAdded} points\nNew Tournament Score: ${d.newTotalScore} pts\nPromoted to: Level ${d.nextDifficulty || d.currentDifficulty}`
          );
          toast.success(`🎉 Problem Solved! +${d.scoreAdded} Points Added!`);
          
          // Update live session in state
          setArenaData((prev: any) => ({
            ...prev,
            session: {
              ...prev.session,
              score: d.newTotalScore,
              currentDifficulty: d.nextDifficulty || prev.session.currentDifficulty,
            },
          }));
        } else if (d.status === 'COMPILATION_ERROR') {
          setConsoleOutput(`[Compilation Error]\n${d.compilerOutput || d.message}`);
          toast.error('Compilation failed. Please resolve syntax errors.');
        } else {
          setConsoleOutput(`[Evaluation Failed]\n${d.message || 'Some test cases did not pass expected criteria.'}`);
          toast.error('Solution failed on edge test cases.');
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

  // 3. Skip Question Handler
  const handleConfirmSkip = async () => {
    if (!question?.id) return;
    try {
      setSkipping(true);
      const resp = await apiClient.post('/student/skip-question', {
        questionId: question.id,
        reason: 'Student initiated skip in contest arena',
      });
      if (resp.success) {
        toast.warning('Question skipped (-5 penalty applied). Loading next challenge...');
        setShowSkipModal(false);
        await loadContestState();
      }
    } catch (err: any) {
      console.error('Skip question error:', err);
      toast.error(err.message || 'Failed to skip question.');
    } finally {
      setSkipping(false);
    }
  };

  if (unjoinedError) {
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
              {unjoinedError || 'You must enter the official access code to unlock the arena and begin submitting code.'}
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
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg shadow-amber-500/20"
            >
              {unlockingGate ? 'Verifying Code...' : 'Verify & Unlock Arena'}
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-center">
            <button
              onClick={() => navigate('/student')}
              className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingQuestion && !arenaData) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center -mx-8 -my-8 bg-slate-900 text-white">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold">Connecting to Sandbox Arena...</h3>
        <p className="text-sm text-slate-400 mt-1">Synchronizing active question and test fixtures.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -mx-8 -my-8 font-sans">
      {/* Contest Header Bar */}
      <div className="h-14 bg-slate-950 text-white flex items-center justify-between px-6 border-b border-slate-800 shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <Badge variant="info" className="bg-blue-900/60 text-blue-300 border border-blue-700 font-bold px-2.5 py-1 text-xs">
            Level {question?.difficulty || session.currentDifficulty}
          </Badge>
          <span className="font-extrabold text-base text-white truncate max-w-md">
            {question?.title || 'Algorithmic Challenge'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold hidden md:inline">
            {question?.category}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <ContestTimer initialSeconds={contest.timeRemainingSeconds || 5650} />

          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400 font-semibold">Score:</span>
            <span className="font-mono font-black text-sm text-white">{session.score || 0}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden bg-slate-950">
        {/* Left Panel: Problem Description / Execution Result */}
        <div className="w-1/3 min-w-[380px] max-w-[540px] flex flex-col border-r border-slate-800 bg-slate-900 text-slate-100">
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Level {question?.difficulty} • {question?.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{question?.title}</h2>
                  <div className="text-slate-300 whitespace-pre-wrap font-sans mt-3 leading-relaxed text-sm">
                    {question?.problemStatement}
                  </div>
                </div>

                {/* Function Signature */}
                {question?.functionSignature && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Kotlin Signature</h3>
                    <div className="bg-slate-950 text-blue-300 p-3 rounded-xl text-xs font-mono border border-slate-800">
                      {question.functionSignature}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {question?.constraints && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Constraints</h3>
                    <div className="bg-slate-950/60 p-3 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 whitespace-pre-wrap">
                      {question.constraints}
                    </div>
                  </div>
                )}

                {/* Visible Examples */}
                {question?.examples && question.examples.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Sample Test Cases</h3>
                    {question.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Sample Case {idx + 1}
                        </p>
                        <div className="space-y-2 mt-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Input</span>
                            <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                              {ex.input}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Output</span>
                            <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
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
                      Compiling and executing Kotlin in isolated sandbox...
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
                          <span>+{result.scoreAdded || 20} Points Awarded</span>
                        </div>

                        <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 block uppercase font-bold text-[10px]">Execution Time</span>
                            <span className="font-mono font-bold text-white">{result.time || '34 ms'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase font-bold text-[10px]">Memory Used</span>
                            <span className="font-mono font-bold text-white">{result.memory || '14.2 MB'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase font-bold text-[10px]">Promoted Level</span>
                            <span className="font-mono font-bold text-blue-400">Level {result.nextDifficulty || session.currentDifficulty}</span>
                          </div>
                        </div>

                        <Button
                          onClick={loadContestState}
                          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          Next Challenge <SkipForward className="w-4 h-4" />
                        </Button>
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
                            {result.status === 'PASSED' ? 'Visible Tests Passed' : result.status || 'Execution Failed'}
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
                      Run code against visible tests or submit solution for formal automated grading.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Kotlin Editor & Diagnostics Console */}
        <div className="flex-1 flex flex-col relative">
          {/* Editor Header Bar */}
          <div className="h-10 flex items-center justify-between px-4 shrink-0 bg-slate-900 text-slate-400 border-b border-slate-800">
            <div className="text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              solution.kt (Kotlin 2.0 / JVM 21)
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
                className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
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
            <div className="absolute bottom-20 right-6 bg-slate-800/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Draft auto-saved</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-2xl">
            <Button
              variant="ghost"
              onClick={() => setShowSkipModal(true)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Question (-5 pts)
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleRunCode}
                disabled={isExecuting}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs px-4"
              >
                <Play className="w-3.5 h-3.5 mr-2 text-slate-300" />
                Run Code (Visible Tests)
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isExecuting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <span>Submit Solution</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Skip Current Challenge?</h3>
                <p className="text-xs text-slate-400">Level {question?.difficulty} • Penalty Rule</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              Per competition rules, skipping this problem will apply a <b className="text-rose-400 font-bold">5 point deduction</b> from your total tournament score and advance you to the next challenge at Level {question?.difficulty}.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSkipModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={skipping}
                onClick={handleConfirmSkip}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50 transition-all"
              >
                {skipping ? 'Skipping...' : 'Confirm Skip (-5 pts)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
