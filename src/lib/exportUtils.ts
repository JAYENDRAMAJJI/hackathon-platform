/**
 * Enhanced CSV and Document export utilities for Hackathon Arena 2.0
 * Fully compliant with RFC 4180 and Microsoft Excel / Google Sheets UTF-8 BOM encoding.
 */

/**
 * Format camelCase or snake_case key into human-readable Title Case header.
 * e.g. 'studentName' -> 'Student Name', 'ipAddress' -> 'IP Address', 'solvedCount' -> 'Solved Count'
 */
export function toReadableHeader(key: string): string {
  if (!key) return '';
  // Check common abbreviations
  const upperMap: Record<string, string> = {
    id: 'ID',
    ip: 'IP Address',
    ipaddress: 'IP Address',
    ip_address: 'IP Address',
    sessionid: 'Session ID',
    session_id: 'Session ID',
    studentid: 'Student ID',
    student_id: 'Student ID',
    userid: 'User ID',
    user_id: 'User ID',
    url: 'URL',
    kpi: 'KPI',
    csv: 'CSV',
    json: 'JSON',
  };

  const lower = key.toLowerCase();
  if (upperMap[lower]) return upperMap[lower];

  // Convert snake_case or camelCase
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
    .replace(/\bId\b/g, 'ID')
    .replace(/\bIp\b/g, 'IP')
    .trim();
}

/**
 * Cleanly format ISO date/timestamp strings for tabular presentation
 */
export function formatDate(isoString?: string | number | Date | null): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    
    // Format YYYY-MM-DD HH:mm:ss in local time
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return String(isoString);
  }
}

/**
 * Format remaining seconds into HH:MM:SS format
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Sanitize cell values according to RFC 4180
 * Excel compatibility: wrap strings in quotes, escape existing quotes with double quotes,
 * preserve numbers, clean nulls/undefined to empty strings, format dates and booleans.
 */
export function sanitizeCell(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }

  if (typeof val === 'boolean') {
    return val ? '"YES"' : '"NO"';
  }

  if (typeof val === 'number') {
    if (isNaN(val)) return '""';
    if (!isFinite(val)) return `"${val}"`;
    return String(val);
  }

  if (val instanceof Date) {
    return `"${formatDate(val)}"`;
  }

  if (Array.isArray(val)) {
    const joined = val
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join('; ');
    return `"${joined.replace(/"/g, '""')}"`;
  }

  if (typeof val === 'object') {
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }

  // String formatting
  const str = String(val);
  
  // Check if string matches ISO timestamp format (e.g., 2026-09-22T08:30:00.000Z)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
    return `"${formatDate(str)}"`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generate standardized Hackathon Arena CSV Filename
 * e.g., 'Hackathon_Arena_User_Management_2026-09-22.csv'
 */
export function generateCsvFilename(sectionName: string): string {
  const sanitized = sectionName
    .replace(/^Hackathon_Arena_/i, '')
    .replace(/\.csv$/i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const today = new Date().toISOString().slice(0, 10);
  return `Hackathon_Arena_${sanitized}_${today}.csv`;
}

/**
 * Triggers browser download of file with UTF-8 BOM prefix for Excel compatibility
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/csv;charset=utf-8;'
) {
  // Prepend UTF-8 BOM (\uFEFF) for CSV to force Excel to render UTF-8 characters properly
  let finalContent = content;
  if (mimeType.includes('csv') && !content.startsWith('\uFEFF')) {
    finalContent = '\uFEFF' + content;
  }

  const blob = new Blob([finalContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') || filename.endsWith('.json') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export 2D matrix of rows to CSV
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const headerLine = headers.map(sanitizeCell).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCell).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  const finalName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(csvContent, finalName, 'text/csv;charset=utf-8;');
}

/**
 * Core JSON to CSV exporter supporting:
 * - (filename, data, columnMap)
 * - (data, filename, columnMap)
 * - Automatic camelCase to Title Case header inference
 * - Nested dot-notated property access (e.g. 'user.department')
 */
export function exportJsonToCsv<T extends Record<string, any>>(
  arg1: string | T[],
  arg2: string | T[],
  columnMap?: Record<string, string>
): boolean {
  let filename: string;
  let data: T[];

  if (typeof arg1 === 'string') {
    filename = arg1;
    data = (Array.isArray(arg2) ? arg2 : []) as T[];
  } else {
    data = (Array.isArray(arg1) ? arg1 : []) as T[];
    filename = typeof arg2 === 'string' ? arg2 : 'Hackathon_Arena_Export';
  }

  if (!data || data.length === 0) {
    return false;
  }

  // Ensure standard filename
  const cleanFilename = filename.includes('Hackathon_Arena_')
    ? (filename.endsWith('.csv') ? filename : `${filename}.csv`)
    : generateCsvFilename(filename);

  let keys: string[];
  let headers: string[];

  if (columnMap && Object.keys(columnMap).length > 0) {
    keys = Object.keys(columnMap);
    headers = Object.values(columnMap);
  } else {
    // Infer keys from first item
    keys = Object.keys(data[0]);
    headers = keys.map(toReadableHeader);
  }

  // Nested property lookup helper
  const getNestedValue = (obj: any, path: string): any => {
    if (!obj || typeof obj !== 'object') return '';
    if (path in obj) return obj[path];
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
  };

  const rows = data.map((item) =>
    keys.map((key) => {
      const val = getNestedValue(item, key);
      return val;
    })
  );

  exportToCsv(cleanFilename, headers, rows);
  return true;
}

/**
 * Polymorphic alias for exportJsonToCsv
 */
export function exportToCSV<T extends Record<string, any>>(
  arg1: string | T[],
  arg2: string | T[],
  columnMap?: Record<string, string>
): boolean {
  return exportJsonToCsv(arg1, arg2, columnMap);
}
