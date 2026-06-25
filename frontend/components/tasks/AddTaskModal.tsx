'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2, AlignLeft, Calendar, Flag, BookOpen } from 'lucide-react'
import type { CreateTaskDto } from '@/lib/api/tasks'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (dto: CreateTaskDto) => Promise<void>
}

const PRIORITIES = [
  { value: 'low', label: 'Low', accent: 'oklch(55% 0.14 150)', bg: 'oklch(55% 0.14 150 / 0.1)', text: 'oklch(50% 0.12 150)' },
  { value: 'medium', label: 'Medium', accent: 'oklch(65% 0.16 75)', bg: 'oklch(65% 0.16 75 / 0.1)', text: 'oklch(60% 0.14 75)' },
  { value: 'high', label: 'High', accent: 'oklch(60% 0.20 25)', bg: 'oklch(60% 0.20 25 / 0.1)', text: 'oklch(55% 0.18 25)' },
]

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [form, setForm] = useState<CreateTaskDto>({
    title: '',
    subject: '',
    description: '',
    deadline: '',
    priority: 'medium',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setForm({ title: '', subject: '', description: '', deadline: '', priority: 'medium' })
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Task title is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onAdd({
        ...form,
        subject: form.subject || undefined,
        description: form.description || undefined,
        deadline: form.deadline || undefined,
      })
      reset()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'oklch(0% 0 0 / 0.3)' }}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-lg"
          >
            <div
              className="rounded-t-2xl sm:rounded-2xl border overflow-hidden shadow-xl"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--color-rule)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    <Plus className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
                  </div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>New Task</h2>
                </div>
                <button
                  id="add-task-modal-close"
                  onClick={handleClose}
                  className="p-2 rounded-md transition-colors"
                  style={{ color: 'var(--color-ink-2)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-paper-2)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {error && (
                  <div
                    className="px-4 py-3 rounded-lg text-sm font-medium border"
                    style={{
                      backgroundColor: 'oklch(60% 0.20 25 / 0.08)',
                      color: 'var(--destructive)',
                      borderColor: 'oklch(60% 0.20 25 / 0.15)',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-ink-2)' }}>
                    <Plus className="w-3 h-3" /> Title
                  </label>
                  <input
                    id="task-title-input"
                    type="text"
                    required
                    placeholder="e.g. Submit OS Assignment"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg text-sm border transition-all placeholder:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-paper)',
                      borderColor: 'var(--color-rule)',
                      color: 'var(--color-ink)',
                    }}
                    autoFocus
                  />
                </div>

                {/* Subject + Priority row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-ink-2)' }}>
                      <BookOpen className="w-3 h-3" /> Subject
                    </label>
                    <input
                      id="task-subject-input"
                      type="text"
                      placeholder="e.g. Computer Networks"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg text-sm border transition-all placeholder:opacity-50"
                      style={{
                        backgroundColor: 'var(--color-paper)',
                        borderColor: 'var(--color-rule)',
                        color: 'var(--color-ink)',
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-ink-2)' }}>
                      <Flag className="w-3 h-3" /> Priority
                    </label>
                    <div className="flex gap-2 pt-0.5">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          id={`priority-${p.value}`}
                          onClick={() => setForm({ ...form, priority: p.value as any })}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all"
                          style={{
                            backgroundColor: form.priority === p.value ? p.accent : 'var(--color-paper)',
                            color: form.priority === p.value ? '#fff' : p.text,
                            borderColor: form.priority === p.value ? 'transparent' : 'var(--color-rule)',
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-ink-2)' }}>
                    <Calendar className="w-3 h-3" /> Deadline
                  </label>
                  <input
                    id="task-deadline-input"
                    type="datetime-local"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg text-sm border transition-all"
                    style={{
                      backgroundColor: 'var(--color-paper)',
                      borderColor: 'var(--color-rule)',
                      color: 'var(--color-ink)',
                    }}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-ink-2)' }}>
                    <AlignLeft className="w-3 h-3" /> Description
                  </label>
                  <textarea
                    id="task-description-input"
                    placeholder="Any additional details..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-sm border transition-all resize-none placeholder:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-paper)',
                      borderColor: 'var(--color-rule)',
                      color: 'var(--color-ink)',
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  id="add-task-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Task
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
