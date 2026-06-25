'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, Trash2, Tag, Calendar, Clock, ChevronDown
} from 'lucide-react'
import type { Task, UpdateTaskDto } from '@/lib/api/tasks'

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, dto: UpdateTaskDto) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    badge: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30',
    dot: 'bg-red-500',
    glow: 'hover:border-red-200 dark:hover:border-red-900/40',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
    dot: 'bg-amber-400',
    glow: 'hover:border-amber-200 dark:hover:border-amber-900/40',
  },
  low: {
    label: 'Low',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
    dot: 'bg-emerald-500',
    glow: 'hover:border-emerald-200 dark:hover:border-emerald-900/40',
  },
}

function formatDeadline(deadline?: string) {
  if (!deadline) return null
  const date = new Date(deadline)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diffDays < 0) return { label: `Overdue · ${formatted}`, urgent: true }
  if (diffDays === 0) return { label: `Today · ${formatted}`, urgent: true }
  if (diffDays === 1) return { label: `Tomorrow · ${formatted}`, urgent: false }
  return { label: `${diffDays}d · ${formatted}`, urgent: false }
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const deadline = formatDeadline(task.deadline)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await onUpdate(task.id, { completed: !task.completed })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${priority.glow} ${
        task.completed
          ? 'border-slate-100 dark:border-slate-800 opacity-70'
          : 'border-slate-100 dark:border-slate-800'
      }`}
    >
      {/* Priority accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${priority.dot} ml-3`} />

      <div className="pl-7 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Complete toggle */}
          <button
            id={`task-toggle-${task.id}`}
            onClick={handleToggle}
            disabled={loading}
            className="mt-0.5 shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-semibold text-base leading-snug truncate transition-colors ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {task.title}
              </h3>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.description && (
                  <button
                    id={`task-expand-${task.id}`}
                    onClick={() => setExpanded(!expanded)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
                <button
                  id={`task-delete-${task.id}`}
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority badge */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priority.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>

              {/* Subject */}
              {task.subject && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
                  <Tag className="w-3 h-3" />
                  {task.subject}
                </span>
              )}

              {/* Deadline */}
              {deadline && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                  deadline.urgent
                    ? 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/30'
                    : 'text-slate-500 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                }`}>
                  {deadline.urgent ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  {deadline.label}
                </span>
              )}
            </div>

            {/* Expandable description */}
            <AnimatePresence>
              {expanded && task.description && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed overflow-hidden"
                >
                  {task.description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
