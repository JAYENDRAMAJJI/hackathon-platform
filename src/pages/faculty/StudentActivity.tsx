import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import StudentActivityTimeline from '../../components/StudentActivityTimeline';

export default function StudentActivity() {
  const { studentId: routeStudentId } = useParams<{ studentId: string }>();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(routeStudentId || '');

  const navigate = useNavigate();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const resp = await apiClient.get('/faculty/students');
        if (resp.success && resp.data) {
          setStudents(resp.data);
        }
      } catch (err) {
        console.error('Failed to load students for activity filter:', err);
      }
    };
    loadStudents();
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty/students')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Student Activity Timeline
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Institutional chronological telemetry stream of contest actions, code compilations, skips, and state transitions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs text-slate-400 whitespace-nowrap">Filter Student:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-200">
              All Assigned Candidates ({students.length})
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.name} ({s.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render Production-Grade StudentActivityTimeline */}
      <StudentActivityTimeline
        studentId={selectedStudentId || undefined}
        studentName={selectedStudent?.name}
        role="FACULTY"
      />
    </div>
  );
}
