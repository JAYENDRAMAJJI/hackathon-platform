import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Code,
  GraduationCap,
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Check,
  X,
  Info,
  Zap,
  KeyRound,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';

type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, login, logout } = useAuthStore();

  const urlRole = searchParams.get('role')?.toUpperCase() as Role | undefined;
  const isJustRegistered = searchParams.get('registered') === 'true';
  const registeredEmail = searchParams.get('email') || '';

  // Default: urlRole if valid, or null to allow explicit selection
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    urlRole === 'STUDENT' || urlRole === 'FACULTY' || urlRole === 'ADMIN' ? urlRole : null
  );

  const [identifier, setIdentifier] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Field validation errors
  const [roleError, setRoleError] = useState<string | null>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [roleMismatchError, setRoleMismatchError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(
    isJustRegistered ? 'Account registered successfully! Please sign in below.' : null
  );

  // Password Requirements Checker
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password),
    };
  }, [password]);

  const isPasswordValid =
    passwordCriteria.hasMinLength &&
    passwordCriteria.hasUppercase &&
    passwordCriteria.hasLowercase &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecialChar;

  const validateForm = () => {
    let isValid = true;
    setRoleError(null);
    setIdentifierError(null);
    setPasswordError(null);
    setFormError(null);
    setRoleMismatchError(null);

    if (!selectedRole) {
      setRoleError('Please select your role (Student, Faculty, or Admin) to proceed.');
      isValid = false;
    }

    if (!identifier.trim()) {
      setIdentifierError('Email address or username is required.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  // Google OAuth Authentication
  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setRoleError('Please select a role (Student, Faculty, or Admin) before continuing with Google.');
      return;
    }

    try {
      setIsGoogleLoading(true);
      setFormError(null);
      setRoleMismatchError(null);
      setRoleError(null);

      // Default mock Google OAuth emails for simulation if identifier is blank
      let googleEmail = identifier.trim().toLowerCase();
      if (!googleEmail) {
        if (selectedRole === 'STUDENT') googleEmail = 'student@hackathon.com';
        else if (selectedRole === 'FACULTY') googleEmail = 'faculty@hackathon.com';
        else googleEmail = 'admin@hackathon.com';
      }

      const resp = await apiClient.post('/auth/google', {
        role: selectedRole,
        email: googleEmail,
        name: googleEmail.split('@')[0].replace('.', ' '),
        googleId: `google_oauth2_${Date.now()}`,
      });

      if (resp.status === 'PENDING_APPROVAL' || resp.code === 'PENDING_APPROVAL') {
        navigate(`/account/pending?email=${encodeURIComponent(googleEmail)}&studentId=${resp.data?.user?.id || resp.user?.id || ''}`);
        return;
      }

      if (resp.status === 'REJECTED' || resp.code === 'ACCOUNT_REJECTED') {
        navigate(`/account/pending?email=${encodeURIComponent(googleEmail)}&studentId=${resp.data?.user?.id || resp.user?.id || ''}`);
        return;
      }

      const authUser = resp?.data?.user || resp?.user;
      const token = resp?.data?.token || resp?.token;

      if ((resp?.success || authUser) && authUser && token) {
        login(authUser, token);

        if (authUser.role === 'STUDENT') {
          navigate('/student/dashboard');
        } else if (authUser.role === 'FACULTY') {
          navigate('/faculty/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
        return;
      }

      if (resp?.code === 'ROLE_MISMATCH' || resp?.message?.toLowerCase().includes('mismatch')) {
        setRoleMismatchError(resp.message || 'Selected role does not match this account.');
      } else {
        setFormError(resp?.message || 'Google authentication failed.');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      const msg = err.message || 'An error occurred during Google authentication.';
      
      if (msg.toLowerCase().includes('role not authorized') || msg.toLowerCase().includes('mismatch')) {
        setRoleMismatchError(msg);
      } else if (msg.toLowerCase().includes('pending')) {
        navigate(`/account/pending?email=${encodeURIComponent(identifier || 'student@hackathon.com')}`);
      } else {
        setFormError(msg);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      setRoleMismatchError(null);

      const resp = await apiClient.post('/auth/login', {
        role: selectedRole,
        email: identifier.trim(),
        password: password,
      });

      const authUser = resp?.data?.user || resp?.user;
      const token = resp?.data?.token || resp?.token;

      if ((resp?.success || authUser) && authUser && token) {
        login(authUser, token);

        if (authUser.role === 'STUDENT') {
          navigate('/student/dashboard');
        } else if (authUser.role === 'FACULTY') {
          navigate('/faculty/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
        return;
      }

      if (resp?.code === 'ROLE_MISMATCH' || resp?.message?.toLowerCase().includes('mismatch')) {
        setRoleMismatchError(resp.message || 'Selected role does not match this account.');
      } else if (resp?.code === 'PENDING_APPROVAL' || resp?.status === 'PENDING_APPROVAL') {
        navigate(`/account/pending?email=${encodeURIComponent(identifier.trim())}`);
      } else {
        setFormError(resp?.message || 'Invalid email or password. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || 'An error occurred during authentication.';
      
      if (msg.toLowerCase().includes('role not authorized') || msg.toLowerCase().includes('mismatch')) {
        setRoleMismatchError(msg);
      } else if (msg.toLowerCase().includes('pending')) {
        navigate(`/account/pending?email=${encodeURIComponent(identifier.trim())}`);
      } else {
        setFormError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    logout();
    setSessionNotice('Current session logged out. Please sign in below.');
    setFormError(null);
    setRoleMismatchError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex selection:bg-indigo-500 selection:text-white font-sans text-slate-900 dark:text-slate-100">
      <div className="w-full flex flex-col lg:flex-row">
        {/* LEFT COLUMN: BRANDING & PLATFORM HIGHLIGHTS (DESKTOP) */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <Logo size="lg" variant="dark" />
          </div>

          {/* Middle Hero Content */}
          <div className="space-y-6 max-w-lg relative z-10 my-auto py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Competitive Algorithmic Arena</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight leading-tight text-white">
              {BRAND_CONFIG.tagline}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Sign in with your university Google account or institutional credentials to participate in synchronized Kotlin challenges, supervise student cohorts, or manage the platform.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Role-partitioned dashboards for Students, Faculty & Admins</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Isolated server-side Kotlin sandbox execution</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Immutable audit logs and supervisory anomaly detection</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 text-[11px] text-slate-500">
            {BRAND_CONFIG.copyright}
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION CARD */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl mx-auto lg:max-w-none">
          {/* Top Navigation */}
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {isAuthenticated && (
                <>
                  <button
                    onClick={handleResetSession}
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3 h-3" /> Log Out
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                </>
              )}

              <Link
                to={`/register?role=${selectedRole || 'STUDENT'}`}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                New user? Register
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link
                to="/"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </Link>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="my-auto py-6 space-y-6 max-w-md w-full mx-auto">
            {/* Active Session Notice Banner */}
            {isAuthenticated && currentUser && (
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <p className="font-bold">
                    Signed in as: {currentUser.name}
                  </p>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Role: {currentUser.role} • {currentUser.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (currentUser.role === 'STUDENT') navigate('/student/dashboard');
                      else if (currentUser.role === 'FACULTY') navigate('/faculty/dashboard');
                      else navigate('/admin/dashboard');
                    }}
                    className="text-xs h-7.5 px-3 bg-indigo-600 text-white"
                  >
                    Open Dashboard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetSession}
                    className="text-xs h-7.5 px-2 text-rose-600"
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            )}

            {sessionNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sessionNotice}</span>
              </div>
            )}

            {/* Header Title */}
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Sign In to Platform
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your role and authenticate with Google or institutional credentials
              </p>
            </div>

            {/* Error Banners */}
            {roleMismatchError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-3 animate-in fade-in relative">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-900 dark:text-rose-100">Role Not Authorized</p>
                      <p className="leading-relaxed">{roleMismatchError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRoleMismatchError(null)}
                    className="text-rose-400 hover:text-rose-600 p-1 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Role Switch Helper Buttons */}
                <div className="pt-1 flex flex-wrap gap-2">
                  {roleMismatchError.includes('STUDENT') && selectedRole !== 'STUDENT' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('STUDENT');
                        setRoleMismatchError(null);
                        setFormError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                    >
                      <Code className="w-3 h-3" /> Switch to Student & Retry
                    </button>
                  )}
                  {roleMismatchError.includes('FACULTY') && selectedRole !== 'FACULTY' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('FACULTY');
                        setRoleMismatchError(null);
                        setFormError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                    >
                      <GraduationCap className="w-3 h-3" /> Switch to Faculty & Retry
                    </button>
                  )}
                  {roleMismatchError.includes('ADMIN') && selectedRole !== 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('ADMIN');
                        setRoleMismatchError(null);
                        setFormError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                    >
                      <Shield className="w-3 h-3" /> Switch to Admin & Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {formError && !roleMismatchError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="font-medium">{formError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-rose-400 hover:text-rose-600 p-0.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {roleError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-600" />
                  <span className="font-medium">{roleError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoleError(null)}
                  className="text-amber-500 hover:text-amber-700 p-0.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 1. ROLE SELECTION CARDS */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Your Role <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Student Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('STUDENT');
                    if (!identifier || identifier.includes('@hackathon.com') || identifier.includes('@hackarena.edu')) {
                      setIdentifier('student@hackarena.edu');
                      setPassword('Pass@123');
                    }
                    setRoleMismatchError(null);
                    setFormError(null);
                    setRoleError(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedRole === 'STUDENT'
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedRole === 'STUDENT'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Student
                    </h4>
                    <p className="text-[10px] text-slate-400">Compete</p>
                  </div>
                </button>

                {/* Faculty Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('FACULTY');
                    if (!identifier || identifier.includes('@hackathon.com') || identifier.includes('@hackarena.edu')) {
                      setIdentifier('faculty@hackarena.edu');
                      setPassword('Pass@123');
                    }
                    setRoleMismatchError(null);
                    setFormError(null);
                    setRoleError(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedRole === 'FACULTY'
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedRole === 'FACULTY'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Faculty
                    </h4>
                    <p className="text-[10px] text-slate-400">Supervise</p>
                  </div>
                </button>

                {/* Admin Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ADMIN');
                    if (!identifier || identifier.includes('@hackathon.com') || identifier.includes('@hackarena.edu')) {
                      setIdentifier('admin@hackarena.edu');
                      setPassword('Pass@123');
                    }
                    setRoleMismatchError(null);
                    setFormError(null);
                    setRoleError(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selectedRole === 'ADMIN'
                      ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 shadow-xs ring-1 ring-purple-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedRole === 'ADMIN'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Admin
                    </h4>
                    <p className="text-[10px] text-slate-400">Manage</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. GOOGLE OAUTH CONTINUATION BUTTON */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-70"
              >
                {isGoogleLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating with Google...</span>
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google {selectedRole ? `(${selectedRole})` : ''}</span>
                  </>
                )}
              </button>

              <div className="flex items-center my-3 gap-3">
                <div className="grow border-t border-slate-200 dark:border-slate-800" />
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                  or sign in with credentials
                </span>
                <div className="grow border-t border-slate-200 dark:border-slate-800" />
              </div>
            </div>

            {/* DEMO CREDENTIALS QUICK FILL CARD */}
            <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Demo Login Quick-Fill</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Pass: <strong className="text-slate-800 dark:text-slate-200">Pass@123</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('STUDENT');
                    setIdentifier('student@hackarena.edu');
                    setPassword('Pass@123');
                    setRoleError(null);
                    setIdentifierError(null);
                    setPasswordError(null);
                    setFormError(null);
                    setRoleMismatchError(null);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === 'STUDENT' && (identifier === 'student@hackarena.edu' || identifier === 'student@hackathon.com')
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-1 ring-indigo-500/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    <Code className="w-3 h-3 text-indigo-500" />
                    <span>Student</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">student@hackarena.edu</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('FACULTY');
                    setIdentifier('faculty@hackarena.edu');
                    setPassword('Pass@123');
                    setRoleError(null);
                    setIdentifierError(null);
                    setPasswordError(null);
                    setFormError(null);
                    setRoleMismatchError(null);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === 'FACULTY' && (identifier === 'faculty@hackarena.edu' || identifier === 'faculty@hackathon.com')
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 ring-1 ring-blue-500/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    <GraduationCap className="w-3 h-3 text-blue-500" />
                    <span>Faculty</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">faculty@hackarena.edu</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ADMIN');
                    setIdentifier('admin@hackarena.edu');
                    setPassword('Pass@123');
                    setRoleError(null);
                    setIdentifierError(null);
                    setPasswordError(null);
                    setFormError(null);
                    setRoleMismatchError(null);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === 'ADMIN' && (identifier === 'admin@hackarena.edu' || identifier === 'admin@hackathon.com')
                      ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/60 ring-1 ring-purple-500/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    <Shield className="w-3 h-3 text-purple-500" />
                    <span>Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">admin@hackarena.edu</p>
                </button>
              </div>
            </div>

            {/* 3. MANUAL CREDENTIALS LOGIN FORM */}
            <form onSubmit={handleManualLogin} className="space-y-4">
              {/* Email / Username Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address or Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (identifierError) setIdentifierError(null);
                      if (formError) setFormError(null);
                    }}
                    placeholder={
                      selectedRole === 'ADMIN'
                        ? 'admin@hackarena.edu or admin'
                        : selectedRole === 'FACULTY'
                        ? 'faculty@hackarena.edu or faculty'
                        : selectedRole === 'STUDENT'
                        ? 'student@hackarena.edu or student'
                        : 'Enter your email address or username'
                    }
                    autoComplete="username"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                      identifierError
                        ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {identifierError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    {identifierError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                      passwordError
                        ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In {selectedRole ? `as ${selectedRole}` : ''}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Bottom Support Contact */}
          <div className="text-center text-[11px] text-slate-400">
            Need assistance with your credentials? Contact{' '}
            <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-indigo-600 hover:underline">
              {BRAND_CONFIG.supportEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
