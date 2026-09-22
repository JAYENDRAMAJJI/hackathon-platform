/**
 * CSV and Document export utilities for the Admin Panel
 */

export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const sanitizeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(sanitizeCell).join(',');
  const rowLines = rows.map(row => row.map(sanitizeCell).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  const finalName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(csvContent, finalName, 'text/csv;charset=utf-8;');
}

export function exportJsonToCsv<T extends Record<string, any>>(
  filename: string,
  data: T[],
  columnMap?: Record<keyof T | string, string>
) {
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }

  const keys = columnMap ? Object.keys(columnMap) : Object.keys(data[0]);
  const headers = columnMap ? Object.values(columnMap) : keys;

  const rows = data.map(item =>
    keys.map(key => {
      const val = item[key];
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val;
    })
  );

  exportToCsv(filename, headers, rows);
}

export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
  exportJsonToCsv(filename, data);
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDate(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
