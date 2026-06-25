'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckSquare, Clock, ListChecks, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { tasksApi, type Task, type CreateTaskDto, type UpdateTaskDto } from '@/lib/api/tasks'
import { TaskCard } from '@/components/tasks/TaskCard'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'

type FilterTab = 'all' | 'pending' | 'completed'

const TAB_CONFIG: { key: FilterTab; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All Tasks', icon: ListChecks },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckSquare },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [modalOpen, setModalOpen] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tasksApi.getAll()
      setTasks(res.tasks)
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAdd = async (dto: CreateTaskDto) => {
    const res = await tasksApi.create(dto)
    setTasks(prev => [res.task, ...prev])
  }

  const handleUpdate = async (id: string, dto: UpdateTaskDto) => {
    const res = await tasksApi.update(id, dto)
    setTasks(prev => prev.map(t => (t.id === id ? res.task : t)))
  }

  const handleDelete = async (id: string) => {
    await tasksApi.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const pendingCount = tasks.filter(t => !t.completed).length
  const completedCount = tasks.filter(t => t.completed).length
  const dueToday = tasks.filter(t => {
    if (!t.deadline || t.completed) return false
    const d = new Date(t.deadline)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            {pendingCount} pending · {completedCount} done
            {dueToday > 0 && (
              <span className="ml-2 text-red-500 font-semibold">· {dueToday} due today!</span>
            )}
          </p>
        </div>
        <button
          id="open-add-task-modal"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-emerald-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: tasks.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pending', value: pendingCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Done', value: completedCount, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
            <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`filter-tab-${key}`}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              filter === key
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your tasks…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 flex items-center justify-center">
            <CheckSquare className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
              {filter === 'completed' ? 'No completed tasks yet' : filter === 'pending' ? 'All caught up!' : 'No tasks yet'}
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              {filter === 'all' ? 'Click "Add Task" to get started.' : 'Switch to a different filter.'}
            </p>
          </div>
          {filter === 'all' && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold text-sm shadow hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Add your first task
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}
