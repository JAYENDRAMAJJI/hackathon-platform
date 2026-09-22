import React, { useState, useMemo, useEffect } from 'react';
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
  Mail,
  User as UserIcon,
  BookOpen,
  Hash,
  KeyRound,
  Check,
  Briefcase,
  School,
  FileCheck2,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { apiClient } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';

type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlRole = searchParams.get('role')?.toUpperCase() as Role;
  const [selectedRole, setSelectedRole] = useState<Role>(
    urlRole === 'STUDENT' || urlRole === 'FACULTY' || urlRole === 'ADMIN' ? urlRole : 'STUDENT'
  );

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Student Fields
  const [college, setCollege] = useState('University Engineering Campus');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [rollNo, setRollNo] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [batch, setBatch] = useState('Batch A');
  const [preferredLanguage, setPreferredLanguage] = useState('Kotlin');

  // Faculty Fields
  const [facultyEmployeeId, setFacultyEmployeeId] = useState('');
  const [facultyDepartment, setFacultyDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [specialization, setSpecialization] = useState('Algorithms & Data Structures');

  // Admin Fields
  const [adminEmployeeId, setAdminEmployeeId] = useState('');
  const [adminUnit, setAdminUnit] = useState('Platform Directorate');
  const [adminDesignation, setAdminDesignation] = useState('System Administrator');
  const [adminCode, setAdminCode] = useState('');

  // Success State & Countdown
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);
  const [countdown, setCountdown] = useState(4);

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

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasMinLength) score += 1;
    if (passwordCriteria.hasUppercase) score += 1;
    if (passwordCriteria.hasLowercase) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecialChar) score += 1;
    return score;
  }, [passwordCriteria]);

  const passwordStrengthLabel = useMemo(() => {
    if (!password) return { label: 'Empty', color: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400' };
    if (passwordScore <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (passwordScore <= 4) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [password, passwordScore]);

  const isPasswordValid =
    passwordCriteria.hasMinLength &&
    passwordCriteria.hasUppercase &&
    passwordCriteria.hasLowercase &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecialChar;

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Clear single field error
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (formError) setFormError(null);
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    setFormError(null);

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address (e.g. name@university.edu).';
    }

    if (!username.trim()) {
      errors.username = 'Username / Identifier is required.';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (!isPasswordValid) {
      errors.password = 'Password must be at least 6 characters and contain uppercase, lowercase, number, and special character.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errors.terms = 'You must agree to the platform terms and code of conduct.';
    }

    // Role-specific validations
    if (selectedRole === 'STUDENT') {
      if (!college.trim()) errors.college = 'University/College name is required.';
      if (!department.trim()) errors.department = 'Department is required.';
      if (!rollNo.trim()) errors.rollNo = 'Student Roll Number / PRN is required.';
    } else if (selectedRole === 'FACULTY') {
      if (!facultyEmployeeId.trim()) errors.facultyEmployeeId = 'Faculty Employee ID is required.';
      if (!facultyDepartment.trim()) errors.facultyDepartment = 'Department is required.';
      if (!designation.trim()) errors.designation = 'Academic designation is required.';
    } else if (selectedRole === 'ADMIN') {
      if (!adminEmployeeId.trim()) errors.adminEmployeeId = 'Admin Employee ID is required.';
      if (!adminUnit.trim()) errors.adminUnit = 'Administrative Unit is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormError('Please fill in all required fields accurately.');
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);

      const payload: any = {
        role: selectedRole,
        name: name.trim(),
        email: email.trim(),
        username: username.trim().toLowerCase(),
        password: password,
      };

      if (selectedRole === 'STUDENT') {
        payload.college = college.trim();
        payload.department = department.trim();
        payload.rollNo = rollNo.trim();
        payload.yearOfStudy = yearOfStudy;
        payload.batch = batch.trim();
        payload.preferredLanguage = preferredLanguage;
      } else if (selectedRole === 'FACULTY') {
        payload.employeeId = facultyEmployeeId.trim();
        payload.department = facultyDepartment.trim();
        payload.designation = designation.trim();
        payload.specialization = specialization.trim();
      } else if (selectedRole === 'ADMIN') {
        payload.employeeId = adminEmployeeId.trim();
        payload.adminUnit = adminUnit.trim();
        payload.designation = adminDesignation.trim();
        payload.adminCode = adminCode.trim() || 'ADMIN2026';
      }

      const resp = await apiClient.post('/auth/register', payload);

      if (resp.success && resp.data) {
        setRegisteredData(resp.data.user);
        setIsSuccess(true);
      } else {
        setFormError(resp.message || 'Registration failed. Please check your details and try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setFormError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automated redirect timer upon successful registration
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/login?role=${selectedRole}&registered=true&email=${encodeURIComponent(email.trim())}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, navigate, selectedRole, email]);

  const handleProceedToLogin = () => {
    navigate(`/login?role=${selectedRole}&registered=true&email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex selection:bg-indigo-500 selection:text-white font-sans text-slate-900 dark:text-slate-100">
      <div className="w-full flex flex-col lg:flex-row">
        {/* LEFT COLUMN: BRANDING & PERKS (DESKTOP) */}
        <div className="hidden lg:flex lg:w-5/12 bg-slate-900 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <Logo size="lg" variant="dark" />
          </div>

          {/* Middle Content */}
          <div className="space-y-6 max-w-lg relative z-10 my-auto py-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Create Your Institutional Account</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Join the Competitive Algorithmic Arena
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Register to participate in live timed programming contests, access 10 dynamic difficulty levels, or supervise institutional candidate submissions.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Synchronized contest timer and real-time live telemetry</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant automated test-case evaluation engine</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time dynamic institutional leaderboard</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Comprehensive faculty supervision and audit logging</span>
              </div>
            </div>

            {/* Quick Role Switcher Tip */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-2">
              <p className="font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-400" /> Role Guidelines:
              </p>
              <ul className="list-disc pl-4 text-slate-400 space-y-1 text-[11px]">
                <li><strong className="text-slate-200">Student</strong>: Compete in contests and solve algorithm problems.</li>
                <li><strong className="text-slate-200">Faculty</strong>: Monitor live student sessions, anomalies, and analytics.</li>
                <li><strong className="text-slate-200">Admin</strong>: Manage platform questions, users, contests, and approvals.</li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 text-[11px] text-slate-500">
            {BRAND_CONFIG.copyright}
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div className="w-full lg:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 max-w-2xl mx-auto">
          {/* Top Mobile Brand & Back links */}
          <div className="flex items-center justify-between pb-4">
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Link
                to={`/login?role=${selectedRole}`}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                Already have an account? Sign In
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

          {/* SUCCESS MODAL / VIEW */}
          {isSuccess ? (
            <div className="my-auto py-8 max-w-lg w-full mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Account Created Successfully!
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Your <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedRole}</span> account has been registered and verified in the platform directory.
                </p>
              </div>

              {/* Summary Card */}
              {registeredData && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Account ID</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{registeredData.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{registeredData.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Email Address</span>
                    <span className="text-slate-800 dark:text-slate-200">{registeredData.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Role</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {registeredData.role}
                    </span>
                  </div>
                  {registeredData.department && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Department</span>
                      <span className="text-slate-800 dark:text-slate-200">{registeredData.department}</span>
                    </div>
                  )}
                  {registeredData.rollNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Roll Number / PRN</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{registeredData.rollNo}</span>
                    </div>
                  )}
                  {registeredData.employeeId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Employee ID</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{registeredData.employeeId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Auto-redirect notification */}
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  Redirecting to Sign In in <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{countdown}s</strong>...
                </span>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleProceedToLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* MAIN REGISTRATION FORM */
            <div className="my-auto py-4 space-y-5 max-w-xl w-full mx-auto">
              {/* Header Title */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create Platform Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your institutional role and enter your details to register
                </p>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. ROLE SELECTION CARDS */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  1. Select Registration Role <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Student Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('STUDENT');
                      setFormError(null);
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
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student</h4>
                      <p className="text-[10px] text-slate-400">Compete & Code</p>
                    </div>
                  </button>

                  {/* Faculty Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('FACULTY');
                      setFormError(null);
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
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Faculty</h4>
                      <p className="text-[10px] text-slate-400">Supervise & Mentor</p>
                    </div>
                  </button>

                  {/* Admin Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('ADMIN');
                      setFormError(null);
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
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Admin</h4>
                      <p className="text-[10px] text-slate-400">Manage Platform</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. REGISTRATION FORM */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* --- A. BASIC INFORMATION --- */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    2. Personal & Account Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearFieldError('name');
                          }}
                          placeholder="e.g. Alex Morgan"
                          className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                            fieldErrors.name
                              ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                              : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                          }`}
                        />
                      </div>
                      {fieldErrors.name && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError('email');
                          }}
                          placeholder="e.g. alex@university.edu"
                          className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                            fieldErrors.email
                              ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                              : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                          }`}
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Username / Platform Handle <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          clearFieldError('username');
                        }}
                        placeholder="e.g. alex_coder26"
                        className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                          fieldErrors.username
                            ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                            : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        {fieldErrors.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* --- B. ROLE-SPECIFIC INSTITUTIONAL FIELDS --- */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    {selectedRole === 'STUDENT' && <BookOpen className="w-3.5 h-3.5 text-indigo-500" />}
                    {selectedRole === 'FACULTY' && <GraduationCap className="w-3.5 h-3.5 text-blue-500" />}
                    {selectedRole === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-purple-500" />}
                    3. {selectedRole} Institutional Credentials
                  </h3>

                  {/* STUDENT FIELDS */}
                  {selectedRole === 'STUDENT' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* College */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            University / College <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <School className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={college}
                              onChange={(e) => {
                                setCollege(e.target.value);
                                clearFieldError('college');
                              }}
                              placeholder="College / Institute Name"
                              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Department / Branch <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={department}
                            onChange={(e) => {
                              setDepartment(e.target.value);
                              clearFieldError('department');
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Data Science & AI">Data Science & AI</option>
                            <option value="Electronics & Communication">Electronics & Communication</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Roll No */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Roll No / PRN <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={rollNo}
                            onChange={(e) => {
                              setRollNo(e.target.value);
                              clearFieldError('rollNo');
                            }}
                            placeholder="e.g. STU-2026-042"
                            className={`w-full px-3.5 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                              fieldErrors.rollNo
                                ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                            }`}
                          />
                          {fieldErrors.rollNo && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400">
                              {fieldErrors.rollNo}
                            </p>
                          )}
                        </div>

                        {/* Year of Study */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Year of Study
                          </label>
                          <select
                            value={yearOfStudy}
                            onChange={(e) => setYearOfStudy(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Postgraduate">Postgraduate</option>
                          </select>
                        </div>

                        {/* Batch */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Batch / Section
                          </label>
                          <input
                            type="text"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            placeholder="Batch A"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FACULTY FIELDS */}
                  {selectedRole === 'FACULTY' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Faculty Employee ID */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Faculty Employee ID <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={facultyEmployeeId}
                              onChange={(e) => {
                                setFacultyEmployeeId(e.target.value);
                                clearFieldError('facultyEmployeeId');
                              }}
                              placeholder="e.g. FAC-2024-115"
                              className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                                fieldErrors.facultyEmployeeId
                                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                              }`}
                            />
                          </div>
                          {fieldErrors.facultyEmployeeId && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400">
                              {fieldErrors.facultyEmployeeId}
                            </p>
                          )}
                        </div>

                        {/* Designation */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Academic Designation <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Lecturer">Lecturer</option>
                            <option value="Department Head / HOD">Department Head / HOD</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Department */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Department <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={facultyDepartment}
                            onChange={(e) => setFacultyDepartment(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Software Systems">Software Systems</option>
                            <option value="Artificial Intelligence">Artificial Intelligence</option>
                          </select>
                        </div>

                        {/* Specialization */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Primary Specialization
                          </label>
                          <input
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g. Competitive Algorithms, AI/ML"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADMIN FIELDS */}
                  {selectedRole === 'ADMIN' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Admin Employee ID */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Admin ID <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Shield className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={adminEmployeeId}
                              onChange={(e) => {
                                setAdminEmployeeId(e.target.value);
                                clearFieldError('adminEmployeeId');
                              }}
                              placeholder="e.g. ADM-2026-03"
                              className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                                fieldErrors.adminEmployeeId
                                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700 focus:ring-purple-500'
                              }`}
                            />
                          </div>
                          {fieldErrors.adminEmployeeId && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400">
                              {fieldErrors.adminEmployeeId}
                            </p>
                          )}
                        </div>

                        {/* Administrative Unit */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Administrative Unit
                          </label>
                          <select
                            value={adminUnit}
                            onChange={(e) => setAdminUnit(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Platform Directorate">Platform Directorate</option>
                            <option value="Contest Operations">Contest Operations</option>
                            <option value="Examination Directorate">Examination Directorate</option>
                            <option value="Security & Compliance">Security & Compliance</option>
                          </select>
                        </div>
                      </div>

                      {/* Admin Passcode */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Admin Authorization Passcode
                          </label>
                          <span className="text-[10px] text-slate-400">Default key: ADMIN2026</span>
                        </div>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            placeholder="Enter institutional admin passcode (ADMIN2026)"
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- C. PASSWORD & SECURITY --- */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    4. Security & Password Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        {password && (
                          <span className={`text-[10px] font-bold ${passwordStrengthLabel.text}`}>
                            {passwordStrengthLabel.label}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError('password');
                          }}
                          placeholder="Create a strong password"
                          className={`w-full pl-10 pr-10 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                            fieldErrors.password
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
                      {fieldErrors.password && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        {confirmPassword && (
                          <span
                            className={`text-[10px] font-bold ${
                              passwordsMatch ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {passwordsMatch ? 'Match' : 'No Match'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearFieldError('confirmPassword');
                          }}
                          placeholder="Re-enter password"
                          className={`w-full pl-10 pr-10 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                            fieldErrors.confirmPassword
                              ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                              : confirmPassword && passwordsMatch
                              ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-500'
                              : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- D. TERMS & HONOR CODE --- */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        clearFieldError('terms');
                      }}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      I agree to the platform{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">
                        Terms of Service
                      </span>
                      , Contest Honor Code, and institutional anti-cheating policy.
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                      {fieldErrors.terms}
                    </p>
                  )}
                </div>

                {/* --- SUBMIT BUTTON --- */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-2 ${
                    selectedRole === 'STUDENT'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                      : selectedRole === 'FACULTY'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                      : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  }`}
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration as {selectedRole}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Sign In Redirect */}
              <div className="pt-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                Already registered with an account?{' '}
                <Link
                  to={`/login?role=${selectedRole}`}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Sign in here <ArrowRight className="w-3 h-3 inline" />
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Help */}
          <div className="text-center text-[11px] text-slate-400 pt-4">
            Need institutional support? Contact{' '}
            <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-indigo-600 hover:underline">
              {BRAND_CONFIG.supportEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
