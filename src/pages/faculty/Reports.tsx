import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Users,
  Trophy,
  Activity,
  AlertTriangle,
  FileCode,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { exportToCSV } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function FacultyReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'student';

  const [reportType, setReportType] = useState<string>(initialType);
  const [studentFilter, setStudentFilter] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const resp = await apiClient.get('/faculty/students');
        const list = Array.isArray(resp.data) ? resp.data : (resp.data?.rows || resp.data?.students || []);
        if (resp.success && list) {
          setStudents(list);
        }
      } catch (err) {
        console.error('Failed to load students for report:', err);
      }
    };
    loadStudents();
  }, []);

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && typeFromUrl !== reportType) {
      setReportType(typeFromUrl);
    }
  }, [searchParams]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.post('/faculty/reports/generate', {
        type: reportType,
        studentId: studentFilter || undefined,
      });

      if (resp.success && resp.data) {
        const dataPayload = resp.data;
        setReportData(dataPayload);
        const title = dataPayload.reportTitle || `${reportType.toUpperCase()} Report`;
        toast.success(`${title} generated successfully`, 'Report Ready');
      } else {
        toast.error(resp.message || 'Failed to generate report', 'Generation Error');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error generating report', 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [reportType]);

  const handleExportCSV = () => {
    const rows = reportData?.rows || (Array.isArray(reportData) ? reportData : []);
    if (!rows || rows.length === 0) {
      toast.warning('No report rows to export');
      return;
    }
    exportToCSV(rows, `${reportType}_supervisory_report_${new Date().toISOString().split('T')[0]}`);
    toast.success('Report CSV downloaded successfully', 'Export Complete');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Supervisory Report Generator
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate, preview, print, and export official CSV reports for student performance, contests, and sessions.
              </p>
            </div>
          </div>
        </div>

        {reportData && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </Button>
            <Button
              size="sm"
              onClick={handleExportCSV}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </Button>
          </div>
        )}
      </div>

      {/* Report Type Selector Tabs */}
      <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl print:hidden">
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'student', label: 'Student Performance', icon: Users },
              { id: 'contest', label: 'Contest Supervisory', icon: Trophy },
              { id: 'session', label: 'Live Sessions', icon: Activity },
              { id: 'anomaly', label: 'Anomaly Audit', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = reportType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setReportType(tab.id);
                    setSearchParams({ type: tab.id });
                  }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800 text-xs">
            {reportType === 'student' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Target Student:</span>
                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Assigned Students</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              size="sm"
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded-xl shadow-md shadow-indigo-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Generate Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Output Preview */}
      {reportData && (
        <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl print:border-none print:shadow-none">
          <CardHeader className="border-b border-slate-800 p-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-black text-white">
                  {reportData.reportTitle}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Generated by: <span className="font-bold text-slate-200">{reportData.generatedBy}</span> • Date: <span className="font-mono text-slate-300">{new Date(reportData.generatedAt).toLocaleString()}</span>
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 w-fit">
                Official Supervisory Record
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Summary KPI Strip */}
            {reportData.summary && Object.keys(reportData.summary).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {Object.entries(reportData.summary).map(([key, val]: [string, any], idx) => (
                  <div key={idx}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <p className="text-2xl font-black text-white mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tabular Data View */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-800/90 text-slate-200 uppercase font-bold tracking-wider border-b border-slate-700">
                  <tr>
                    {reportData.rows.length > 0 &&
                      Object.keys(reportData.rows[0]).map((col) => (
                        <th key={col} className="px-4 py-3.5">
                          {col.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.rows.length > 0 ? (
                    reportData.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td key={cIdx} className="px-4 py-3.5 font-medium text-slate-300">
                            {typeof val === 'boolean' ? (
                              val ? (
                                <span className="text-emerald-400 font-bold">YES</span>
                              ) : (
                                <span className="text-slate-500 font-bold">NO</span>
                              )
                            ) : (
                              String(val ?? '-')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={Object.keys(reportData.rows[0] || {}).length || 4} className="text-center py-8 text-slate-500">
                        No records found for this report configuration.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
