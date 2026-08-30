'use client'

import { useState } from 'react'
import { formatDate } from '@/shared/utils'

const MOCK_COMMENTS = [
  {
    id: '1',
    author: 'Pedro Alves',
    initial: 'P',
    content: 'Excelente matéria! Muito bem detalhada e completa. Parabéns à redação.',
    date: new Date('2026-08-28'),
  },
  {
    id: '2',
    author: 'Carla Mendes',
    initial: 'C',
    content: 'Ótima reportagem. Aguardando mais conteúdo assim. Sempre acompanho o portal!',
    date: new Date('2026-08-29'),
  },
]

export function CommentsSection({ postId }: { postId: string }) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    setSubmitted(true)
    setName('')
    setText('')
  }

  return (
    <section className="mt-16 border-t border-slate-200 pt-10" aria-label="Comentários">
      <h2 className="mb-6 text-xl font-bold text-slate-900">
        Comentários{' '}
        <span className="text-base font-normal text-gray-400">({MOCK_COMMENTS.length})</span>
      </h2>

      {/* Lista */}
      <div className="space-y-5">
        {MOCK_COMMENTS.map((c) => (
          <div key={c.id} className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {c.initial}
            </div>
            <div className="flex-1 rounded-xl bg-slate-50 px-5 py-4">
              <div className="mb-1 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800">{c.author}</span>
                <time
                  dateTime={c.date.toISOString()}
                  className="text-xs text-gray-400"
                >
                  {formatDate(c.date)}
                </time>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulário */}
      <div className="mt-10">
        <h3 className="mb-5 text-base font-semibold text-slate-900">Deixe seu comentário</h3>

        {submitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            ✓ Comentário enviado com sucesso! Ele será exibido após moderação.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor={`comment-name-${postId}`}
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Nome
              </label>
              <input
                id={`comment-name-${postId}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:max-w-xs"
              />
            </div>

            <div>
              <label
                htmlFor={`comment-text-${postId}`}
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Comentário
              </label>
              <textarea
                id={`comment-text-${postId}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva seu comentário…"
                rows={4}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
            >
              Publicar comentário
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
