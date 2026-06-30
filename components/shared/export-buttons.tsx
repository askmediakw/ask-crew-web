'use client'

import { FileSpreadsheet, FileText } from 'lucide-react'
import { exportToCSV, exportToPDF, type ExportColumn } from '@/lib/export'
import { useToast } from '@/lib/toast'

type ExportButtonsProps<T extends Record<string, unknown>> = {
  label?: string
  rows?: T[]
  columns?: ExportColumn<T>[]
}

export function ExportButtons<T extends Record<string, unknown>>({
  label = 'البيانات',
  rows,
  columns,
}: ExportButtonsProps<T>) {
  const { toast } = useToast()
  const safeName = label.replace(/\s+/g, '_')

  const guard = () => {
    if (!rows || !columns || rows.length === 0) {
      toast.warning('لا توجد بيانات للتصدير')
      return false
    }
    return true
  }

  const handleCSV = () => {
    if (!guard()) return
    exportToCSV(rows!, columns!, `${safeName}.csv`)
    toast.success(`تم تصدير ${label} بصيغة CSV`)
  }

  const handlePDF = async () => {
    if (!guard()) return
    await exportToPDF(rows!, columns!, `${safeName}.pdf`, label)
    toast.success(`تم تصدير ${label} بصيغة PDF`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCSV}
        className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/15"
      >
        <FileSpreadsheet className="h-4 w-4 text-success" />
        تصدير CSV
      </button>
      <button
        onClick={handlePDF}
        className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/15"
      >
        <FileText className="h-4 w-4 text-destructive" />
        تصدير PDF
      </button>
    </div>
  )
}
