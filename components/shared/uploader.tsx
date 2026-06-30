'use client'

import { useRef, useState } from 'react'
import { UploadCloud, File as FileIcon, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// DRAG & DROP UPLOADER (#7)
// ----------------------------------------------------------------------------
// Drag-and-drop or click to select files, with a simulated progress bar.
// Wire `onFiles` to your real upload endpoint (e.g. Vercel Blob) when ready.
// ============================================================================

type UploadItem = { id: string; name: string; size: number; progress: number }

export function Uploader({
  accept = 'image/*',
  onFiles,
}: {
  accept?: string
  onFiles?: (files: File[]) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return
    const files = Array.from(fileList)
    onFiles?.(files)
    files.forEach((file) => {
      const id = Math.random().toString(36).slice(2)
      setItems((prev) => [...prev, { id, name: file.name, size: file.size, progress: 0 }])
      // Simulated progress — replace with real XHR/fetch upload progress.
      let p = 0
      const timer = setInterval(() => {
        p += Math.random() * 25
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, progress: Math.min(100, Math.round(p)) } : it)),
        )
        if (p >= 100) clearInterval(timer)
      }, 250)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition',
          dragging ? 'border-primary bg-primary/10' : 'border-border bg-white/5 hover:border-primary/50',
        )}
      >
        <UploadCloud className={cn('mb-3 h-10 w-10', dragging ? 'text-primary' : 'text-muted-foreground')} />
        <p className="text-sm font-bold text-foreground">اسحب الملفات هنا أو اضغط للاختيار</p>
        <p className="mt-1 text-xs text-muted-foreground">يدعم الصور والملفات حتى 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {items.map((it) => (
        <div key={it.id} className="glass flex items-center gap-3 rounded-xl border border-border p-3">
          <FileIcon className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-bold text-foreground">{it.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {(it.size / 1024).toFixed(0)} KB
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn('h-full rounded-full transition-all', it.progress === 100 ? 'bg-success' : 'bg-primary')}
                style={{ width: `${it.progress}%` }}
              />
            </div>
          </div>
          {it.progress === 100 ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          ) : (
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
              className="shrink-0 text-muted-foreground transition hover:text-foreground"
              aria-label="إزالة"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
