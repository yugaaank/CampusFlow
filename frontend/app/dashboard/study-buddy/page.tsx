'use client'

import { useState } from 'react'
import { BookOpen, Layers, CheckCircle2, Loader2, PlayCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function StudyBuddyPage() {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    summary: string;
    flashcards: { front: string; back: string }[];
    quizzes: { question: string; options: string[]; correctAnswer: string }[];
  } | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!notes.trim()) return

    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/ai/study-buddy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ notes })
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.message || 'Failed to generate study materials')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-10">
      {/* Manifesto-style heading */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--color-accent)' }}>
          AI Study Tool
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-ink)' }}>
          Study Buddy
        </h1>
        <p className="text-base" style={{ color: 'var(--color-ink-2)' }}>
          Paste your lecture notes to get a summary, flashcards, and a practice quiz.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Col: Input */}
        <div
          className="lg:col-span-5 space-y-4 rounded-xl p-6 border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
        >
          <label className="block text-sm font-semibold" style={{ color: 'var(--color-ink-2)' }}>
            Lecture Notes
          </label>
          <textarea
            className="w-full h-96 p-4 rounded-lg border transition-colors resize-none text-sm leading-relaxed"
            style={{
              backgroundColor: 'var(--color-paper)',
              borderColor: 'var(--color-rule)',
              color: 'var(--color-ink)',
            }}
            placeholder="Paste your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && <p className="text-sm font-medium" style={{ color: 'var(--destructive)' }}>{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={!notes.trim() || loading}
            className="w-full py-3 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Materials...
              </>
            ) : (
              <>
                Generate Materials
              </>
            )}
          </button>
        </div>

        {/* Right Col: Output */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-8">
              {/* Summary */}
              <div
                className="rounded-xl p-6 border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
              >
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--color-ink)' }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'oklch(55% 0.14 150)' }} />
                  Summary
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
                  {result.summary}
                </p>
              </div>

              {/* Flashcards */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--color-ink)' }}>
                  <Layers className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  Flashcards ({result.flashcards.length})
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.flashcards.map((card, i) => (
                    <div key={i} className="group [perspective:1000px]">
                      <div className="relative w-full h-40 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer">
                        {/* Front */}
                        <div
                          className="absolute inset-0 [backface-visibility:hidden] rounded-xl p-5 border flex flex-col items-center justify-center text-center"
                          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
                        >
                          <span className="text-xs font-medium absolute top-3 uppercase tracking-[0.08em]" style={{ color: 'var(--color-muted)' }}>Question</span>
                          <p className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>{card.front}</p>
                        </div>
                        {/* Back */}
                        <div
                          className="absolute inset-0 [backface-visibility:hidden] rounded-xl p-5 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)]"
                          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--primary-foreground)' }}
                        >
                          <span className="text-xs font-semibold absolute top-3 uppercase tracking-[0.08em] opacity-70">Answer</span>
                          <p className="font-medium text-sm leading-snug">{card.back}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quizzes */}
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--color-ink)' }}>
                  <PlayCircle className="w-4 h-4" style={{ color: 'var(--color-accent-2)' }} />
                  Practice Quiz
                </h3>
                <div className="space-y-4">
                  {result.quizzes.map((quiz, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-6 border"
                      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
                    >
                      <p className="font-medium text-sm mb-4" style={{ color: 'var(--color-ink)' }}>
                        <span className="mr-2" style={{ color: 'var(--color-ink-2)' }}>{i + 1}.</span>
                        {quiz.question}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {quiz.options.map((opt, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer"
                            style={{
                              backgroundColor: 'var(--color-paper)',
                              borderColor: 'var(--color-rule)',
                            }}
                          >
                            <div className="w-3.5 h-3.5 rounded-full border transition-colors" style={{ borderColor: 'var(--color-rule)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="h-full rounded-xl border flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-rule)' }}
            >
              <BookOpen className="w-8 h-8 mb-4" style={{ color: 'var(--color-muted)' }} />
              <p className="text-base font-medium" style={{ color: 'var(--color-ink-2)' }}>Awaiting Notes</p>
              <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--color-muted)' }}>
                Paste your notes on the left to generate study materials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
