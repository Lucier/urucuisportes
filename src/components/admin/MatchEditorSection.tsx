'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateMatchAction, type MatchFormState } from '@/app/admin/actions'

type MatchRow = {
  id: string
  homeTeamName: string | null
  awayTeamName: string | null
  homeScore: number | null
  awayScore: number | null
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED'
  date: Date
}

interface Props {
  matches: MatchRow[]
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  LIVE: 'Ao vivo',
  FINISHED: 'Encerrado',
  POSTPONED: 'Adiado',
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
    >
      {pending ? '…' : 'Salvar'}
    </button>
  )
}

const initialState: MatchFormState = {}

function MatchRow({ match }: { match: MatchRow }) {
  const [state, formAction] = useActionState(updateMatchAction, initialState)

  const inputCls =
    'w-12 rounded-lg border border-slate-200 px-1.5 py-1.5 text-center text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

  return (
    <form action={formAction} className="rounded-xl border border-slate-100 p-3 sm:p-4">
      <input type="hidden" name="id" value={match.id} />

      {/* Times + Placar */}
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-right text-sm font-medium text-slate-700">
          {match.homeTeamName ?? '—'}
        </span>
        <div className="flex flex-shrink-0 items-center gap-1">
          <input name="homeScore" type="number" min={0} max={99}
            defaultValue={match.homeScore ?? ''} className={inputCls} placeholder="—" />
          <span className="text-slate-300">×</span>
          <input name="awayScore" type="number" min={0} max={99}
            defaultValue={match.awayScore ?? ''} className={inputCls} placeholder="—" />
        </div>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
          {match.awayTeamName ?? '—'}
        </span>
      </div>

      {/* Controles */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">
          {new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          {' '}
          {new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <select
          name="status"
          defaultValue={match.status}
          className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <SaveButton />
        {state.success && (
          <span className="text-xs font-medium text-emerald-600">{state.success}</span>
        )}
        {state.error && (
          <span className="text-xs font-medium text-red-600">{state.error}</span>
        )}
      </div>
    </form>
  )
}

export function MatchEditorSection({ matches }: Props) {
  if (matches.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-800">Partidas</h2>
        <p className="text-sm text-slate-400">Nenhuma partida cadastrada.</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-slate-800">Resultados de Partidas</h2>
      <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </div>
    </section>
  )
}
