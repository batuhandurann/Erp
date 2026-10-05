/**
 * Export Utilities for BusinessFlow ERP
 * Generates UTF-8 encoded CSV files with Byte Order Mark (BOM) for seamless Microsoft Excel compatibility.
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): void {
  // \uFEFF is the UTF-8 BOM so Excel opens Turkish characters (ç, ğ, ı, ö, ş, ü, İ) correctly
  const BOM = '\uFEFF';

  const formatCell = (cell: any): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(formatCell).join(';');
  const rowLines = rows.map(row => row.map(formatCell).join(';'));
  const csvContent = BOM + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
