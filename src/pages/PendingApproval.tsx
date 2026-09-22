import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';

export default function PendingApproval() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login } = useAuthStore();

  const [email, setEmail] = useState(searchParams.get('email') || user?.email || '');
  const [studentId, setStudentId] = useState(searchParams.get('studentId') || user?.id || '');
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<string>(user?.status || 'PENDING');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      setChecking(true);
      setMessage(null);
      const params: Record<string, string> = {};
      if (studentId) params.studentId = studentId;
      if (email) params.email = email;

      const resp = await apiClient.get('/auth/check-approval', params);
      if (resp.success && resp.data) {
        const student = resp.data;
        setStatus(student.status);

        if (student.approved && student.status === 'ACTIVE') {
          setMessage('Congratulations! Your account has been approved.');
          if (student.token) {
            login(student, student.token);
          }
          setTimeout(() => {
            navigate('/student/dashboard');
          }, 1500);
        } else if (student.status === 'REJECTED') {
          setRejectionReason(student.rejectionReason || 'University enrollment verification could not be completed.');
        } else {
          setMessage('Your account is still awaiting approval from contest supervision.');
        }
      }
    } catch (err: any) {
      console.error('Error checking approval status:', err);
      setMessage(err.message || 'Unable to contact verification server.');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // If user already approved, forward to dashboard
    if (user?.role === 'STUDENT' && user?.approved && user?.status === 'ACTIVE') {
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pt-4">
        <Logo size="sm" showSubtitle={false} />

        <Link
          to="/"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6 text-center">
        {/* Google Authentication Success Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Google Authentication Complete</span>
        </div>

        {status === 'REJECTED' ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Account Not Approved
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your registration was reviewed by contest supervision and was not approved.
              </p>
            </div>

            {rejectionReason && (
              <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-left text-xs text-rose-900 dark:text-rose-200 space-y-1">
                <span className="font-bold text-[11px] uppercase tracking-wider block text-rose-700 dark:text-rose-400">
                  Supervisor Reason:
                </span>
                <p className="leading-relaxed">{rejectionReason}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Your Account is Awaiting Approval
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                An authorized supervisor must approve your student identity before you can enter the contest arena.
              </p>
            </div>

            {/* Status Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Registration Status
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                  PENDING APPROVAL
                </span>
              </div>
              {email && (
                <p className="text-[11px] font-mono text-slate-500">
                  Identity: {email}
                </p>
              )}
            </div>

            {message && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 animate-in fade-in">
                {message}
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <Button
                onClick={checkStatus}
                disabled={checking}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Verifying with Supervision...' : 'Check Approval Status'}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full text-xs font-semibold py-2.5 rounded-xl text-slate-700 dark:text-slate-300"
              >
                Back to Home
              </Button>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
          Need urgent authorization? Contact your faculty contest proctor at{' '}
          <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-indigo-600 hover:underline">
            {BRAND_CONFIG.supportEmail}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 pb-4">
        {BRAND_CONFIG.copyright}
      </div>
    </div>
  );
}
