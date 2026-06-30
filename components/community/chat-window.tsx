'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, CheckCheck, Paperclip, SendHorizonal, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'
import { Uploader } from '@/components/shared/uploader'
import { AutoTranslateMessage, LocalTimeBadge } from '@/components/shared/geo-widgets'

// #27 Chat UI + #29 typing indicator & read receipts + #30 attachment modal.
// One-on-one Producer <-> Freelancer messaging. Real-time transport (Socket.io
// / Pusher, see #26) is stubbed: typing + receipt states are simulated locally.

type Receipt = 'sent' | 'delivered' | 'read'

type Message = {
  id: string
  body: string
  mine: boolean
  time: string
  receipt?: Receipt
  // Optional foreign-language original that can be auto-translated (#28).
  foreign?: { text: string; translation: string }
}

type Conversation = {
  id: string
  name: string
  role: string
  timezone: string
  unread: number
  preview: string
  messages: Message[]
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Sarah Lambert',
    role: 'مخرجة — لندن',
    timezone: 'Europe/London',
    unread: 2,
    preview: 'Can we change the shooting location?',
    messages: [
      {
        id: 'm1',
        mine: false,
        time: '10:02',
        body: 'مرحباً، شاهدت أعمالك وأعجبتني جداً.',
      },
      {
        id: 'm2',
        mine: false,
        time: '10:03',
        body: 'Can we change the shooting location to the beach?',
        foreign: {
          text: 'Can we change the shooting location to the beach?',
          translation: 'هل يمكننا تغيير موقع التصوير إلى الشاطئ؟',
        },
      },
      {
        id: 'm3',
        mine: true,
        time: '10:05',
        body: 'بالتأكيد، الشاطئ خيار رائع للإضاءة الطبيعية.',
        receipt: 'read',
      },
    ],
  },
  {
    id: 'c2',
    name: 'أحمد الفهد',
    role: 'منتج — الكويت',
    timezone: 'Asia/Kuwait',
    unread: 0,
    preview: 'تم اعتماد الميزانية النهائية.',
    messages: [
      { id: 'm1', mine: false, time: 'أمس', body: 'تم اعتماد الميزانية النهائية.' },
      { id: 'm2', mine: true, time: 'أمس', body: 'ممتاز، سأبدأ التحضير فوراً.', receipt: 'delivered' },
    ],
  },
  {
    id: 'c3',
    name: 'Maria Costa',
    role: 'مديرة تصوير — لشبونة',
    timezone: 'Europe/Lisbon',
    unread: 1,
    preview: 'Sending the equipment list now.',
    messages: [
      { id: 'm1', mine: false, time: '09:40', body: 'Sending the equipment list now.' },
    ],
  },
]

function ReceiptTicks({ receipt }: { receipt?: Receipt }) {
  if (!receipt) return null
  if (receipt === 'sent') return <Check className="h-3.5 w-3.5 text-muted-foreground" />
  // delivered = double gray, read = double blue (WhatsApp-style).
  return (
    <CheckCheck className={cn('h-3.5 w-3.5', receipt === 'read' ? 'text-primary' : 'text-muted-foreground')} />
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}

export function ChatWindow() {
  const { openModal } = useModal()
  const { toast } = useToast()
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id)
  const [conversations, setConversations] = useState(CONVERSATIONS)
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]

  // Simulate the other party typing then replying shortly after we send (#26/#29).
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [active.messages, typing])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const newMsg: Message = {
      id: Math.random().toString(36).slice(2),
      body: text,
      mine: true,
      time: new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      receipt: 'sent',
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, newMsg] } : c)),
    )
    setDraft('')

    // Progress the receipt: sent -> delivered -> read.
    setTimeout(() => updateReceipt(newMsg.id, 'delivered'), 600)
    setTimeout(() => updateReceipt(newMsg.id, 'read'), 1600)

    // Show typing indicator then a canned reply.
    setTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      setTyping(false)
      const reply: Message = {
        id: Math.random().toString(36).slice(2),
        body: 'تم الاستلام، شكراً لك!',
        mine: false,
        time: new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, reply] } : c)),
      )
    }, 2400)
  }

  const updateReceipt = (msgId: string, receipt: Receipt) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, receipt } : m)) }
          : c,
      ),
    )
  }

  const openAttachments = () => {
    openModal({
      title: 'إرفاق ملف',
      size: 'md',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            أرسل سيناريو، ملف PDF، أو صور المعدات. يمكنك سحب الملفات وإفلاتها في المنطقة أدناه.
          </p>
          <Uploader
            accept=".pdf,.doc,.docx,image/*"
            onFiles={(files) => toast.success(`تم إرفاق ${files.length} ملف بنجاح`)}
          />
        </div>
      ),
    })
  }

  return (
    <div className="glass grid h-[560px] grid-cols-1 overflow-hidden rounded-2xl border border-border md:grid-cols-[280px_1fr]">
      {/* Conversation list */}
      <aside className="hidden flex-col border-l border-border/60 md:flex">
        <div className="border-b border-border/60 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="بحث في المحادثات..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                'flex w-full items-center gap-3 border-b border-border/40 p-3 text-right transition hover:bg-white/5',
                c.id === activeId && 'bg-white/[0.06]',
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {c.name.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-foreground">{c.name}</span>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-muted-foreground" dir="auto">
                  {c.preview}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Active conversation */}
      <section className="flex min-w-0 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-border/60 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {active.name.charAt(0)}
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">{active.name}</h4>
              <p className="text-xs text-muted-foreground">{active.role}</p>
            </div>
          </div>
          <LocalTimeBadge timezone={active.timezone} />
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
          {active.messages.map((m) =>
            m.foreign ? (
              <div key={m.id} className="flex justify-start">
                <AutoTranslateMessage
                  message={m.foreign.text}
                  translation={m.foreign.translation}
                />
              </div>
            ) : (
              <div key={m.id} className={cn('flex', m.mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm',
                    m.mine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-secondary text-foreground',
                  )}
                  dir="auto"
                >
                  <p className="leading-relaxed">{m.body}</p>
                  <span
                    className={cn(
                      'mt-1 flex items-center justify-end gap-1 text-[10px]',
                      m.mine ? 'text-primary-foreground/70' : 'text-muted-foreground',
                    )}
                  >
                    {m.time}
                    {m.mine && <ReceiptTicks receipt={m.receipt} />}
                  </span>
                </div>
              </div>
            ),
          )}

          {/* Typing indicator (#29) */}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
                <TypingDots />
                <span className="text-xs text-muted-foreground">{active.name} يكتب الآن...</span>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="flex items-center gap-2 border-t border-border/60 p-3">
          <button
            onClick={openAttachments}
            aria-label="إرفاق ملف"
            className="rounded-xl border border-border bg-white/5 p-2.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="اكتب رسالة..."
            className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            aria-label="إرسال"
            className="rounded-xl bg-primary p-2.5 text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
