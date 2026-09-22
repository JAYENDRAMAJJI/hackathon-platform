import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Shield,
  Calendar,
  Clock,
  Edit2,
  Check,
  X,
  Users,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';

export default function FacultyProfile() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  const { showToast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.get('/faculty/profile');
      if (resp.success && resp.data) {
        setProfileData(resp.data);
        setName(resp.data.profile.name);
        setDepartment(resp.data.profile.department);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await apiClient.put('/faculty/profile', { name, department });
      if (resp.success) {
        showToast('success', 'Profile updated successfully');
        setIsEditing(false);
        fetchProfile();
      } else {
        showToast('error', resp.message || 'Failed to update profile');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error updating profile');
    }
  };

  if (loading || !profileData) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold">Loading supervisor profile...</p>
      </div>
    );
  }

  const { profile, assignedStudentsCount, assignedStudentsSummary } = profileData;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Faculty Supervisor Profile
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Personal details, university credentials, and assigned student supervision roster.
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 rounded-xl shadow-lg shadow-indigo-600/20"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Profile Card */}
      <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
            <img
              src={
                profile.profileImage ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
              }
              alt="Faculty Avatar"
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-xl"
            />

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-2xl font-black text-white">{profile.name}</h2>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit self-center sm:self-auto">
                  {profile.status}
                </span>
              </div>

              <p className="text-xs font-bold text-indigo-400">
                {profile.designation}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Employee ID: <span className="text-slate-200 font-semibold">{profile.employeeId}</span> • <span className="text-slate-300">{profile.department}</span>
              </p>
            </div>
          </div>

          {/* Profile Edit Form or Details Grid */}
          {isEditing ? (
            <form onSubmit={handleSave} className="py-6 space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">University Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 rounded-xl"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 text-xs">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">University Email</span>
                  <span className="font-semibold text-white font-mono text-xs">{profile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Platform Role</span>
                  <span className="font-semibold text-white text-xs">{profile.role} (Supervision & Monitoring)</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Created</span>
                  <span className="font-semibold text-white text-xs">
                    {new Date(profile.registrationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Last Active Session</span>
                  <span className="font-semibold text-white font-mono text-xs">
                    {new Date(profile.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Cohort Summary Roster */}
      <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-800">
          <CardTitle className="text-sm font-black text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Supervised Student Roster
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {assignedStudentsCount} Assigned Students
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignedStudentsSummary && assignedStudentsSummary.length > 0 ? (
              assignedStudentsSummary.map((s: any) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-slate-700 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white text-xs">{s.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{s.id}</p>
                  </div>
                  <span className="font-black text-indigo-400 text-sm">{s.score} pts</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 col-span-2 text-center py-4">No student records in cohort.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
