import React, { useState } from 'react';
import {
  Trophy,
  Clock,
  FileText,
  AlertTriangle,
  Play,
  ArrowLeft,
  Printer,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Award,
  Layers,
  Code2,
  BookOpen,
  Hash,
  ChevronRight,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface QuestionPaperData {
  contest: {
    id: string;
    name: string;
    code?: string;
    description?: string;
    instructions?: string[];
    rules?: {
      attemptRules?: string;
      skipRules?: string;
      attemptPenalty?: number;
      skipImpact?: number;
    };
    durationMinutes: number;
    difficultyRange: [number, number];
    startTime?: string;
    endTime?: string;
    status: string;
    kotlinOnly?: boolean;
    isJoined?: boolean;
    participantsCount?: number;
  };
  questions: Array<{
    id: string;
    questionNumber: number;
    title: string;
    difficulty: number;
    category: string;
    tags: string[];
    marks: number;
    problemStatement: string;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    sampleInput?: string;
    sampleOutput?: string;
    explanation?: string;
    examples?: Array<{ input: string; output: string; explanation?: string }>;
    visibleTestCasesCount?: number;
    functionSignature?: string;
    starterCode?: string;
    status?: string;
  }>;
  totalQuestions: number;
  totalMarks: number;
  sessionState?: string;
  isStarted?: boolean;
  startedAt?: string | null;
  timeRemainingSeconds?: number;
}

interface QuestionPaperPreviewProps {
  paperData: QuestionPaperData;
  onStartContest: () => Promise<void> | void;
  onBackToContests: () => void;
  isStarting?: boolean;
  readOnlyModal?: boolean;
  onCloseModal?: () => void;
}

export function QuestionPaperPreview({
  paperData,
  onStartContest,
  onBackToContests,
  isStarting = false,
  readOnlyModal = false,
  onCloseModal,
}: QuestionPaperPreviewProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { contest, questions, totalQuestions, totalMarks } = paperData;

  const getDifficultyBadge = (diff: number) => {
    if (diff <= 3) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (diff <= 6) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (diff <= 8) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  const scrollToQuestion = (qNum: number) => {
    const el = document.getElementById(`question-paper-item-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-300 pb-28 font-sans text-slate-100 print:text-black print:bg-white print:max-w-none print:p-0 print:m-0">
      {/* EXAM PAPER HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md print:border-black print:bg-white print:shadow-none print:rounded-none">
        {/* Top Watermark & Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5 print:border-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 print:border-black print:text-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-400 block print:text-gray-700">
                Hackathon Arena 2.0 • Official Examination Paper
              </span>
              <span className="text-xs text-slate-400 print:text-gray-600 font-semibold">
                Contest Code: <b className="font-mono text-amber-300 print:text-black">{contest.code || 'ARENA2026'}</b>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {readOnlyModal ? (
              <button
                onClick={onCloseModal}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition-colors"
                title="Close Paper View"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onBackToContests}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Contests
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
              title="Print Question Paper"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Contest Name and Description */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:border-black print:text-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping print:hidden" />
              Published Question Paper
            </span>
            <span className="text-slate-600 print:hidden">•</span>
            <span className="text-xs text-slate-400 font-semibold print:text-gray-700">
              Departmental Competitive Coding Assessment
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight print:text-black">
            {contest.name}
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed max-w-4xl print:text-gray-800">
            {contest.description ||
              'Standard competitive algorithmic hackathon. Please review all problems, scoring distributions, sample input/output fixtures, and sandbox limits carefully before commencing your timed session.'}
          </p>
        </div>

        {/* METRICS SPECIFICATION GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs print:border-gray-400">
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 print:border-gray-400 print:bg-gray-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block print:text-gray-600">
              Contest Duration
            </span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base mt-1 print:text-black">
              <Clock className="w-4 h-4 text-blue-400 print:text-black" />
              <span>{contest.durationMinutes} Minutes</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 print:text-gray-600">
              ({(contest.durationMinutes / 60).toFixed(1)} Hours Time Limit)
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 print:border-gray-400 print:bg-gray-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block print:text-gray-600">
              Total Questions
            </span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base mt-1 print:text-black">
              <BookOpen className="w-4 h-4 text-indigo-400 print:text-black" />
              <span>{totalQuestions} Problems</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 print:text-gray-600">
              All questions mandatory
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 print:border-gray-400 print:bg-gray-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block print:text-gray-600">
              Total Marks / Points
            </span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base mt-1 print:text-black">
              <Trophy className="w-4 h-4 text-amber-400 print:text-black" />
              <span>{totalMarks} Points</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 print:text-gray-600">
              Max achievable score
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 print:border-gray-400 print:bg-gray-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block print:text-gray-600">
              Difficulty Spectrum
            </span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base mt-1 print:text-black">
              <Layers className="w-4 h-4 text-emerald-400 print:text-black" />
              <span>
                L{contest.difficultyRange?.[0] || 1} – L{contest.difficultyRange?.[1] || 10}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 print:text-gray-600">
              Graduated complexity
            </span>
          </div>
        </div>
      </div>

      {/* CONTEST INSTRUCTIONS & RULES ACCORDION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 print:border-gray-400 print:bg-white">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 print:border-gray-400">
          <ShieldCheck className="w-5 h-5 text-amber-400 print:text-black" />
          <h2 className="text-base font-extrabold text-white tracking-tight print:text-black">
            Official Contest Instructions & Examination Guidelines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2.5">
            {(contest.instructions || []).map((instruction, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 print:border-black print:text-black">
                  {idx + 1}
                </span>
                <p className="text-slate-300 leading-relaxed print:text-gray-800">
                  {instruction}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 print:border-gray-400 print:bg-gray-100">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 print:text-black">
              <Info className="w-4 h-4 text-blue-400 print:text-black" /> Key Technical Parameters
            </h3>
            <div className="space-y-2 text-slate-300 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60 print:border-gray-300">
                <span className="text-slate-400">Target Language:</span>
                <span className="font-mono font-bold text-white print:text-black">Kotlin 2.0 (JVM 21)</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60 print:border-gray-300">
                <span className="text-slate-400">Memory & CPU Quota:</span>
                <span className="font-mono font-semibold text-slate-200 print:text-black">256MB / 5.0 seconds</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60 print:border-gray-300">
                <span className="text-slate-400">Grading Mechanism:</span>
                <span className="font-semibold text-emerald-400 print:text-black">Automated Unit Evaluation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Timer Initiation:</span>
                <span className="font-bold text-amber-300 print:text-black">Starts only after confirmation</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-amber-300/90 print:bg-transparent print:border-black print:text-black">
              <b>Important Notice:</b> Your contest timer will start immediately upon clicking &ldquo;Start Contest&rdquo; and confirming the prompt below. Once active, the timer cannot be paused or reset.
            </div>
          </div>
        </div>
      </div>

      {/* QUICK QUESTIONS DIRECTORY / TABLE OF CONTENTS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Question Paper Overview & Score Weighting
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Click any question to jump to its specification
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => scrollToQuestion(q.questionNumber)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    Q{q.questionNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyBadge(q.difficulty)}`}>
                    Level {q.difficulty}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white truncate mt-1.5 group-hover:text-blue-400 transition-colors">
                  {q.title}
                </h4>
                <p className="text-[11px] text-slate-400">{q.category}</p>
              </div>

              <div className="shrink-0 text-right">
                <span className="font-mono font-black text-amber-400 text-xs block">
                  {q.marks} pts
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Marks</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FULL QUESTION PAPER: QUESTION-BY-QUESTION FULL DETAILS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:border-black">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 print:text-black">
            <FileText className="w-5 h-5 text-blue-400 print:text-black" />
            Complete Problem Statements & Test Specifications
          </h2>
          <span className="text-xs text-slate-400 print:text-black font-semibold">
            {questions.length} Questions Total
          </span>
        </div>

        {questions.map((q) => (
          <div
            key={q.id}
            id={`question-paper-item-${q.questionNumber}`}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-all print:border-black print:bg-white print:shadow-none print:break-inside-avoid print:rounded-none"
          >
            {/* Question Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 print:border-gray-400">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-black text-sm flex items-center justify-center shadow-md print:border-black print:text-black print:bg-gray-200">
                  {q.questionNumber}
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight print:text-black">
                    {q.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${getDifficultyBadge(q.difficulty)} print:border-black print:text-black`}>
                      Level {q.difficulty}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 print:border-black print:text-black print:bg-transparent">
                      {q.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono print:text-gray-600">ID: {q.id}</span>
                  </div>
                </div>
              </div>

              {/* Marks Banner */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl print:border-black print:bg-gray-100">
                <Award className="w-4 h-4 text-amber-400 print:text-black" />
                <span className="text-xs text-slate-300 print:text-black font-semibold">Maximum Marks:</span>
                <span className="font-mono font-black text-amber-400 text-sm print:text-black">{q.marks} Points</span>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
                Problem Description
              </h4>
              <div className="text-sm leading-relaxed text-slate-200 font-sans whitespace-pre-wrap print:text-black">
                {q.problemStatement}
              </div>
            </div>

            {/* Kotlin Signature Specification */}
            {q.functionSignature && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
                  Method Signature Specification
                </h4>
                <pre className="p-3 bg-slate-950 text-blue-300 text-xs font-mono rounded-xl border border-slate-800 overflow-x-auto print:border-gray-400 print:text-black print:bg-gray-100">
                  {q.functionSignature}
                </pre>
              </div>
            )}

            {/* Input & Output Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5 print:border-gray-400 print:bg-gray-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-black">
                  Input Format
                </span>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px] print:text-black">
                  {q.inputFormat || 'Parameters delivered as specified in function signature.'}
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5 print:border-gray-400 print:bg-gray-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-black">
                  Output Format
                </span>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px] print:text-black">
                  {q.outputFormat || 'Evaluated return value matching specified signature type.'}
                </p>
              </div>
            </div>

            {/* Constraints */}
            {q.constraints && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
                  Constraints & Bounds
                </h4>
                <div className="p-3 bg-slate-950/80 text-slate-300 text-xs font-mono rounded-xl border border-slate-800/80 whitespace-pre-wrap print:border-gray-400 print:text-black print:bg-gray-100">
                  {q.constraints}
                </div>
              </div>
            )}

            {/* Sample Cases */}
            {q.examples && q.examples.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
                  Sample Test Cases (Visible Examples)
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {q.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2.5 print:border-gray-400 print:bg-gray-50"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 print:text-black">
                        <span>Sample Case #{exIdx + 1}</span>
                        <span className="text-emerald-400 text-[10px] print:text-black">Public Test Case</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 print:text-gray-700">
                            Sample Input
                          </span>
                          <pre className="p-2.5 bg-slate-950 font-mono text-slate-200 text-xs rounded-xl border border-slate-800 overflow-x-auto print:border-gray-400 print:text-black print:bg-white">
                            {ex.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 print:text-gray-700">
                            Expected Output
                          </span>
                          <pre className="p-2.5 bg-slate-950 font-mono text-emerald-300 text-xs rounded-xl border border-slate-800 overflow-x-auto print:border-gray-400 print:text-black print:bg-white">
                            {ex.output}
                          </pre>
                        </div>
                      </div>

                      {ex.explanation && (
                        <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 print:border-gray-300 print:text-gray-800">
                          <b className="text-slate-300 print:text-black">Explanation:</b> {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* STICKY BOTTOM ACTION BAR (Hidden in print and modal) */}
      {!readOnlyModal && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 shadow-2xl print:hidden">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToContests}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Back to Contests
              </button>
              <div className="text-xs text-slate-400 hidden md:block">
                <span>Total Questions: <b className="text-white">{totalQuestions}</b></span>
                <span className="mx-2">•</span>
                <span>Max Points: <b className="text-amber-400">{totalMarks}</b></span>
                <span className="mx-2">•</span>
                <span>Duration: <b className="text-blue-400">{contest.durationMinutes} min</b></span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={() => setShowConfirmModal(true)}
                disabled={isStarting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Contest Arena</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL BEFORE STARTING TIMER */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 text-white">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Confirm Contest Start</h3>
                <p className="text-xs text-slate-400">{contest.name}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <p className="font-semibold text-white">
                Are you ready to start the contest? Your contest timer will begin once you confirm.
              </p>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li>You will have <b className="text-white">{contest.durationMinutes} minutes</b> to complete all {totalQuestions} problems.</li>
                <li>The countdown timer runs continuously on the server and cannot be paused or reset.</li>
                <li>You may navigate between questions in any order within the coding arena.</li>
                <li>Your code drafts are continuously auto-saved.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isStarting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel (Keep Reviewing)
              </button>
              <Button
                disabled={isStarting}
                onClick={async () => {
                  setShowConfirmModal(false);
                  await onStartContest();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
              >
                {isStarting ? 'Starting Timer...' : 'Start Contest Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
