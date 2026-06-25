'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2, AlignLeft, Tag, Calendar, Flag, BookOpen } from 'lucide-react'
import type { CreateTaskDto } from '@/lib/api/tasks'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (dto: CreateTaskDto) => Promise<void>
}

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-emerald-500', ring: 'ring-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-400', ring: 'ring-amber-400', text: 'text-amber-600 dark:text-amber-400' },
  { value: 'high', label: 'High', color: 'bg-red-500', ring: 'ring-red-400', text: 'text-red-600 dark:text-red-400' },
]

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [form, setForm] = useState<CreateTaskDto>({
    title: '',
    subject: '',
    description: '',
    deadline: '',
    priority: 'medium',
    add_to_calendar: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setForm({ title: '', subject: '', description: '', deadline: '', priority: 'medium', add_to_calendar: false })
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

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm'

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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-lg"
          >
            <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-md">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Task</h2>
                </div>
                <button
                  id="add-task-modal-close"
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-900/30">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <Plus className="w-3.5 h-3.5" /> Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="task-title-input"
                    type="text"
                    required
                    placeholder="e.g. Submit OS Assignment"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    autoFocus
                  />
                </div>

                {/* Subject + Priority row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <BookOpen className="w-3.5 h-3.5" /> Subject
                    </label>
                    <input
                      id="task-subject-input"
                      type="text"
                      placeholder="e.g. Computer Networks"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <Flag className="w-3.5 h-3.5" /> Priority
                    </label>
                    <div className="flex gap-2 pt-1">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          id={`priority-${p.value}`}
                          onClick={() => setForm({ ...form, priority: p.value as any })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            form.priority === p.value
                              ? `${p.color} text-white border-transparent shadow-md scale-105`
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5" /> Deadline
                  </label>
                  <input
                    id="task-deadline-input"
                    type="datetime-local"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <AlignLeft className="w-3.5 h-3.5" /> Description
                  </label>
                  <textarea
                    id="task-description-input"
                    placeholder="Any additional details..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Calendar toggle */}
                <label className="flex items-center gap-3 py-2 cursor-pointer group">
                  <div
                    onClick={() => setForm({ ...form, add_to_calendar: !form.add_to_calendar })}
                    className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
                      form.add_to_calendar ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${
                        form.add_to_calendar ? 'translate-x-4.5' : ''
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Add to Google Calendar
                  </span>
                </label>

                {/* Submit */}
                <button
                  id="add-task-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-emerald-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating…
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
