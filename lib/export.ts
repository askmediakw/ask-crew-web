// Real client-side data export helpers (CSV + PDF).
// Dynamically imports jsPDF so it stays out of the initial bundle.

export type ExportColumn<T> = {
  key: keyof T
  header: string
}

// Build CSV from an array of objects and trigger a download.
// The BOM (\uFEFF) ensures Excel renders Arabic/UTF-8 correctly.
export function exportToCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename = 'data.csv',
): void {
  if (!rows.length) return

  const headerLine = columns.map((c) => escapeCSV(c.header)).join(',')
  const dataLines = rows.map((row) =>
    columns.map((c) => escapeCSV(formatCell(row[c.key]))).join(','),
  )
  const csv = [headerLine, ...dataLines].join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename)
}

// Build a paginated PDF table via jsPDF + autotable and trigger a download.
export async function exportToPDF<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename = 'report.pdf',
  title?: string,
): Promise<void> {
  if (!rows.length) return

  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF()
  if (title) {
    doc.setFontSize(14)
    doc.text(title, 14, 16)
  }

  autoTable(doc, {
    startY: title ? 22 : 14,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => formatCell(row[c.key]))),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241] },
  })

  doc.save(filename)
}

function escapeCSV(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا'
  return String(value)
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
