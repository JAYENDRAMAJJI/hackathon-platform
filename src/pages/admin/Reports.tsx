import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Award,
  FileCode,
  Activity,
  History,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Filter,
  Users,
  Trophy,
  Sparkles,
  FileJson,
  X,
  ChevronDown,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { exportJsonToCsv, downloadFile, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

interface ReportTab {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  badge?: string;
}

const REPORT_TABS: ReportTab[] = [
  { key: 'rankings', label: 'Final Rankings', icon: Award, desc: 'Official student scores & solve metrics', badge: 'Core' },
  { key: 'submissions', label: 'Submission Audit', icon: FileCode, desc: 'Complete compilation verdicts log', badge: 'Telemetry' },
  { key: 'sessions', label: 'Attendance & Sessions', icon: Activity, desc: 'Participant IP & login timestamps', badge: 'Live' },
  { key: 'anomalies', label: 'Anomaly Audit Dossier', icon: AlertTriangle, desc: 'Security & tab fraud investigations', badge: 'Security' },
  { key: 'contest', label: 'Contest Overview', icon: Trophy, desc: 'Competition health & pass rates', badge: 'Summary' },
  { key: 'faculty', label: 'Faculty Supervision', icon: Users, desc: 'Supervisor student cohort progress', badge: 'Audit' },
  { key: 'activity', label: 'Event Trail', icon: History, desc: 'Granular platform action history', badge: 'Logs' },
];

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportType, setReportType] = useState<string>(searchParams.get('type') || 'rankings');
  const [reportData, setReportData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<Record<string, any>>({});
  const [reportTitle, setReportTitle] = useState<string>('Final Rankings & Scoring Report');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Filters
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState(reportType);
  const [modalDept, setModalDept] = useState('ALL');
  const [modalFormat, setModalFormat] = useState<'csv' | 'json' | 'preview'>('preview');

  const toast = useToast();

  const fetchReport = async (overrideType?: string, overrideDept?: string) => {
    const typeToFetch = overrideType || reportType;
    const deptToFetch = overrideDept !== undefined ? overrideDept : selectedDepartment;

    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/reports', {
        type: typeToFetch,
        department: deptToFetch !== 'ALL' ? deptToFetch : undefined,
      });

      if (resp.success) {
        let rows: any[] = [];
        let summary: Record<string, any> = {};
        let title = '';

        if (Array.isArray(resp.data)) {
          rows = resp.data;
        } else if (resp.data && typeof resp.data === 'object') {
          rows = Array.isArray(resp.data.rows)
            ? resp.data.rows
            : (Array.isArray(resp.data.data) ? resp.data.data : []);
          summary = resp.data.summary || {};
          title = resp.data.reportTitle || '';
        }

        if (rows.length === 0 && Array.isArray(resp.rows)) {
          rows = resp.rows;
        }
        if (!summary && resp.summary) {
          summary = resp.summary;
        }
        if (!title && resp.reportTitle) {
          title = resp.reportTitle;
        }

        setReportData(rows);
        setSummaryData(summary);
        if (title) setReportTitle(title);
      } else {
        toast.error(resp.message || 'Failed to generate report dataset', 'Report Error');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report data', 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDepartment]);

  // Handle direct manual report generation trigger
  const handleTriggerGenerate = async () => {
    setGenerating(true);
    try {
      await Promise.all([
        fetchReport(),
        new Promise((r) => setTimeout(r, 600)),
      ]);
      toast.success(`${reportTitle} compiled successfully with ${reportData.length} records`, 'Report Generated');
    } finally {
      setGenerating(false);
    }
  };

  // Filtered rows for instant in-table search
  const filteredRows = useMemo(() => {
    if (!filterSearch.trim()) return reportData;
    const q = filterSearch.toLowerCase().trim();
    return reportData.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      )
    );
  }, [reportData, filterSearch]);

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = filteredRows && filteredRows.length > 0 ? filteredRows : reportData;
    if (!dataToExport || dataToExport.length === 0) {
      toast.warning('No report data available to export');
      return;
    }
    const filename = `Hackathon_Arena_${reportType.toUpperCase()}_Report`;
    exportJsonToCsv(filename, dataToExport);
    toast.success(`Exported ${dataToExport.length} ${reportType.toUpperCase()} report records to CSV`, 'Export Complete');
  };

  const handleExportJSON = () => {
    const dataToExport = filteredRows && filteredRows.length > 0 ? filteredRows : reportData;
    if (!dataToExport || dataToExport.length === 0) {
      toast.warning('No report data available to export');
      return;
    }
    const exportPayload = {
      title: reportTitle,
      type: reportType,
      exportedAt: new Date().toISOString(),
      summary: summaryData,
      totalRecords: dataToExport.length,
      records: dataToExport,
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    downloadFile(jsonStr, `Hackathon_Arena_${reportType.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    toast.success('JSON Report dataset exported successfully', 'Export Complete');
  };

  const handlePrint = () => {
    if (loading || generating) {
      toast.warning('Report dataset is currently loading. Please wait.');
      return;
    }
    const dataToPrint = filteredRows && filteredRows.length > 0 ? filteredRows : reportData;
    if (!dataToPrint || dataToPrint.length === 0) {
      toast.warning('No report data available to print');
      return;
    }
    window.print();
  };

  // Quick generate modal submit
  const handleModalGenerate = async () => {
    setReportType(modalType);
    setSelectedDepartment(modalDept);
    setSearchParams({ type: modalType });
    setShowGenerateModal(false);

    setLoading(true);
    try {
      const resp = await apiClient.post('/admin/reports/generate', {
        type: modalType,
        department: modalDept !== 'ALL' ? modalDept : undefined,
      });

      let rows: any[] = [];
      let summary: Record<string, any> = {};
      let title = '';

      if (Array.isArray(resp.data)) {
        rows = resp.data;
      } else if (resp.data && typeof resp.data === 'object') {
        rows = Array.isArray(resp.data.rows) ? resp.data.rows : (Array.isArray(resp.data.data) ? resp.data.data : []);
        summary = resp.data.summary || {};
        title = resp.data.reportTitle || '';
      } else if (Array.isArray(resp.rows)) {
        rows = resp.rows;
      }

      setReportData(rows);
      setSummaryData(summary);
      if (title) setReportTitle(title);

      if (modalFormat === 'csv' && rows.length > 0) {
        exportJsonToCsv(`Hackathon_Arena_${modalType.toUpperCase()}_Report`, rows);
        toast.success(`${modalType.toUpperCase()} Report generated and CSV downloaded!`, 'Report Ready');
      } else if (modalFormat === 'json' && rows.length > 0) {
        const jsonStr = JSON.stringify({ title, type: modalType, summary, records: rows }, null, 2);
        downloadFile(jsonStr, `Hackathon_Arena_${modalType.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        toast.success(`${modalType.toUpperCase()} Report generated and JSON downloaded!`, 'Report Ready');
      } else {
        toast.success(`${title || modalType.toUpperCase()} report generated successfully!`, 'Report Ready');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error generating report', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to render formatted badge cell
  const renderCellContent = (key: string, val: any) => {
    const str = String(val ?? '-');
    const upperKey = key.toUpperCase();

    if (upperKey === 'STATUS' || upperKey === 'SESSIONSTATUS') {
      const isOnline = str.toUpperCase() === 'ACTIVE' || str.toUpperCase() === 'ONLINE';
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            isOnline
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          {str}
        </span>
      );
    }

    if (upperKey === 'RESULT' || upperKey === 'VERDICT') {
      const isPass = str === 'ACCEPTED' || str === 'CORRECT' || str === 'PASS';
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
            isPass
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          }`}
        >
          {str}
        </span>
      );
    }

    if (upperKey === 'SEVERITY') {
      const isHigh = str === 'HIGH' || str === 'CRITICAL';
      const isMed = str === 'MEDIUM';
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
            isHigh
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : isMed
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
          }`}
        >
          {str}
        </span>
      );
    }

    if (upperKey === 'RANK') {
      const rankNum = Number(val);
      const isTop3 = rankNum >= 1 && rankNum <= 3;
      return (
        <span
          className={`font-mono font-bold ${
            rankNum === 1
              ? 'text-amber-400'
              : rankNum === 2
              ? 'text-slate-300'
              : rankNum === 3
              ? 'text-amber-600'
              : 'text-slate-400'
          }`}
        >
          {isTop3 ? `★ #${val}` : `#${val}`}
        </span>
      );
    }

    if (upperKey === 'SCORE') {
      return <span className="font-mono font-extrabold text-blue-400">{str} pts</span>;
    }

    return <span>{str}</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16 print:bg-white print:text-black">
      {/* Top Banner & Primary Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Official Accreditation & Regulatory Reporting
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400" /> Platform Compliance & Reports Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Generate, customize, and export university leaderboard standings, submission telemetry audits, attendance dossiers, and security anomaly reports.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main "Generate Report" Button */}
          <button
            id="generate-report-btn"
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Generate Report
          </button>

          {/* Quick CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" /> CSV
          </button>

          {/* Quick JSON Export */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
            title="Download JSON"
          >
            <FileJson className="w-4 h-4 text-blue-400" /> JSON
          </button>

          {/* Print Document */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Print
          </button>

          {/* Re-fetch & Refresh */}
          <button
            onClick={handleTriggerGenerate}
            disabled={loading || generating}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading || generating ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* Report Categories Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 print:hidden">
        {REPORT_TABS.map((tab) => {
          const isActive = reportType === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setReportType(tab.key);
                setSearchParams({ type: tab.key });
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-indigo-500/25 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white mb-1 line-clamp-1">{tab.label}</div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary KPI Strip */}
      {summaryData && Object.keys(summaryData).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:border-b print:pb-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Total Extracted Records</span>
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {summaryData.totalRecords ?? reportData.length}
            </div>
          </div>

          {summaryData.averageScore !== undefined && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Cohort Average Score</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-300 mt-1">
                {summaryData.averageScore} pts
              </div>
            </div>
          )}

          {summaryData.topScore !== undefined && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Top Benchmark Score</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {summaryData.topScore} pts
              </div>
            </div>
          )}

          {summaryData.passRate !== undefined && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Test Suite Pass Rate</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                {summaryData.passRate}
              </div>
            </div>
          )}

          {summaryData.criticalAlerts !== undefined && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>High Severity Flags</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                {summaryData.criticalAlerts}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Live Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* In-Table Live Search Field */}
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search in extracted report..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {filterSearch && (
              <button
                onClick={() => setFilterSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter (For Rankings / Student reports) */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Showing <b>{filteredRows.length}</b> of <b>{reportData.length}</b> rows</span>
          {filterSearch && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none p-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
                CERTIFIED RECORD
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: RPT-{reportType.toUpperCase()}-{new Date().getFullYear()}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1">
              {reportTitle}
            </h2>
            <p className="text-xs text-slate-400">
              Generated: <b>{new Date().toLocaleString()}</b> • Dataset Records: <b>{filteredRows.length}</b>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Database Extraction Verified
            </span>
          </div>
        </div>

        {/* Dynamic Data Table */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <div className="text-sm font-semibold text-white">Extracting & Compiling Report Dataset...</div>
            <div className="text-xs text-slate-500 mt-1">Querying verified database records & computing metrics</div>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-300">No report records found</div>
            <p className="text-xs text-slate-500 mt-1">Try clearing active search filters or selecting another report category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 print:overflow-visible print:border-slate-300">
            <table className="w-full text-left text-xs text-slate-300 print:text-slate-900">
              <thead className="bg-slate-800/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
                <tr>
                  {Object.keys(filteredRows[0]).map((col) => (
                    <th key={col} className="p-3.5 font-semibold text-slate-300 whitespace-nowrap print:whitespace-normal print:p-2 print:text-slate-900 print:border print:border-slate-300">
                      {col.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 print:divide-slate-300">
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors print:hover:bg-transparent">
                    {Object.entries(row).map(([key, val]: any, cIdx) => (
                      <td key={cIdx} className="p-3.5 font-medium whitespace-nowrap print:whitespace-normal print:p-2 print:text-slate-900 print:border print:border-slate-300">
                        {renderCellContent(key, val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* "Generate Report" Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Generate Custom Report</h3>
                  <p className="text-xs text-slate-400">Configure parameters and compile platform dataset</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Report Type */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Report Category
                </label>
                <select
                  value={modalType}
                  onChange={(e) => setModalType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {REPORT_TABS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label} ({t.desc})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Target Department Cohort
                </label>
                <select
                  value={modalDept}
                  onChange={(e) => setModalDept(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Departments (Entire Cohort)</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                </select>
              </div>

              {/* Output Action */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Export Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'preview', label: 'Preview On Screen', icon: FileSpreadsheet },
                    { id: 'csv', label: 'Direct CSV Export', icon: Download },
                    { id: 'json', label: 'Direct JSON Export', icon: FileJson },
                  ].map((act) => {
                    const Icon = act.icon;
                    const isSel = modalFormat === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => setModalFormat(act.id as any)}
                        className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                          isSel
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalGenerate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Sparkles className="w-4 h-4" /> Generate & Compile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
