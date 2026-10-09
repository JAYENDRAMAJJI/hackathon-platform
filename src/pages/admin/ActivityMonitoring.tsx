import React from 'react';
import { History } from 'lucide-react';
import StudentActivityTimeline from '../../components/StudentActivityTimeline';

export default function ActivityMonitoring() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-cyan-400" /> System-Wide Participant Activity Timeline
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time institutional stream of student compiler events, question opens, problem skips, and session state transitions across all contests.
        </p>
      </div>

      {/* Full Admin Timeline Component */}
      <StudentActivityTimeline role="ADMIN" />
    </div>
  );
}
