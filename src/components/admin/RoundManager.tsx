'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  createRoundAction,
  deleteRoundAction,
  createMatchAction,
  deleteMatchAction,
  type RoundFormState,
  type MatchFormState,
} from '@/app/admin/rodadas/actions'

// ─── Types ────────────────────────────────────────────────────────────────────

type LeagueTipo = 'pontos_corridos' | 'grupos'

type Team = {
  id: string
  name: string
  logoUrl: string | null
  grupo: number | null
}

type MatchRow = {
  id: string
  roundId: string | null
  homeTeamId: string
  homeTeamName: string | null
  homeTeamLogo: string | null
  awayTeamId: string
  awayTeamName: string | null
  awayTeamLogo: string | null
  homeScore: number | null
  awayScore: number | null
  status: string
  date: Date
}

type Round = {
  id: string
  numero: number
  nome: string | null
  grupo: number | null
  matches: MatchRow[]
}

type League = {
  id: string
  name: string
  tipo: LeagueTipo
  numeroGrupos: number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function grupoLabel(n: number) {
  return String.fromCharCode(64 + n) // 1→A, 2→B …
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  SCHEDULED: { label: 'Agendado', cls: 'bg-slate-100 text-slate-600' },
  LIVE:      { label: 'Ao vivo',  cls: 'bg-red-100 text-red-700' },
  FINISHED:  { label: 'Encerrado', cls: 'bg-emerald-100 text-emerald-700' },
  POSTPONED: { label: 'Adiado',   cls: 'bg-amber-100 text-amber-700' },
}

const selectCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

// ─── Sub-buttons ──────────────────────────────────────────────────────────────

function SaveBtn({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? 'Salvando…' : label}
    </button>
  )
}

// ─── TeamAvatar ───────────────────────────────────────────────────────────────

function TeamAvatar({ name, logo }: { name: string | null; logo: string | null }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name ?? ''}
        className="h-6 w-6 flex-shrink-0 rounded-full border border-slate-100 object-contain bg-slate-50"
      />
    )
  }
  return (
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
      {(name ?? '?').charAt(0)}
    </div>
  )
}

// ─── AddMatchForm ─────────────────────────────────────────────────────────────

function AddMatchForm({
  round,
  leagueId,
  teams,
  onCancel,
  state,
  formAction,
}: {
  round: Round
  leagueId: string
  teams: Team[]
  onCancel: () => void
  state: MatchFormState
  formAction: (payload: FormData) => void
}) {
  const eligible = round.grupo !== null
    ? teams.filter((t) => t.grupo === round.grupo)
    : teams

  const [homeId, setHomeId] = useState('')

  return (
    <form action={formAction} className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Novo confronto</p>

      <input type="hidden" name="roundId" value={round.id} />
      <input type="hidden" name="leagueId" value={leagueId} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Time da casa */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Time da casa <span className="text-red-500">*</span>
          </label>
          <select
            name="homeTeamId"
            required
            value={homeId}
            onChange={(e) => setHomeId(e.target.value)}
            className={selectCls}
          >
            <option value="" disabled>Selecione…</option>
            {eligible.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Time visitante */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Time visitante <span className="text-red-500">*</span>
          </label>
          <select
            name="awayTeamId"
            required
            className={selectCls}
          >
            <option value="" disabled>Selecione…</option>
            {eligible
              .filter((t) => t.id !== homeId)
              .map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Data e hora */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Data e hora <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          name="date"
          required
          className={inputCls}
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.success}</p>
      )}

      <div className="flex gap-2">
        <SaveBtn label="Adicionar confronto" />
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── RoundCard ────────────────────────────────────────────────────────────────

function RoundCard({
  round,
  leagueId,
  teams,
  isAddingMatch,
  onToggleAdd,
  matchState,
  matchAction,
}: {
  round: Round
  leagueId: string
  teams: Team[]
  isAddingMatch: boolean
  onToggleAdd: () => void
  matchState: MatchFormState
  matchAction: (payload: FormData) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* Cabeçalho da rodada */}
      <div className="flex items-center gap-3 px-5 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {round.numero}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {round.nome
                ? round.nome
                : `Rodada ${round.numero}`}
            </p>
            <p className="text-xs text-slate-400">
              {round.matches.length} confronto{round.matches.length !== 1 ? 's' : ''}
            </p>
          </div>
          <svg
            className={`ml-1 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Ações da rodada */}
        <button
          type="button"
          onClick={onToggleAdd}
          className="rounded-lg border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
        >
          + Confronto
        </button>
        <form action={deleteRoundAction}>
          <input type="hidden" name="id" value={round.id} />
          <button
            type="submit"
            className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50"
            onClick={(e) => {
              if (!confirm(`Excluir rodada ${round.numero}? Os confrontos também serão removidos.`))
                e.preventDefault()
            }}
          >
            Excluir
          </button>
        </form>
      </div>

      {/* Confrontos */}
      {expanded && (
        <div className="border-t border-slate-50 px-5 pb-4">
          {round.matches.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">Nenhum confronto ainda.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {round.matches.map((m) => {
                const badge = STATUS_LABELS[m.status] ?? STATUS_LABELS.SCHEDULED
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    {/* Casa */}
                    <div className="flex flex-1 items-center justify-end gap-1.5">
                      <span className="font-medium text-slate-800 text-right leading-tight">
                        {m.homeTeamName ?? '—'}
                      </span>
                      <TeamAvatar name={m.homeTeamName} logo={m.homeTeamLogo} />
                    </div>

                    {/* Placar / VS */}
                    <div className="flex flex-col items-center gap-0.5">
                      {m.homeScore !== null && m.awayScore !== null ? (
                        <span className="font-bold text-slate-800 tabular-nums">
                          {m.homeScore} × {m.awayScore}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">VS</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Visitante */}
                    <div className="flex flex-1 items-center gap-1.5">
                      <TeamAvatar name={m.awayTeamName} logo={m.awayTeamLogo} />
                      <span className="font-medium text-slate-800 leading-tight">
                        {m.awayTeamName ?? '—'}
                      </span>
                    </div>

                    {/* Data */}
                    <span className="hidden text-xs text-slate-400 sm:block whitespace-nowrap">
                      {formatDate(m.date)}
                    </span>

                    {/* Excluir */}
                    <form action={deleteMatchAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded px-1 py-0.5 text-xs text-red-400 hover:bg-red-50"
                        onClick={(e) => {
                          if (!confirm('Excluir confronto?')) e.preventDefault()
                        }}
                      >
                        ✕
                      </button>
                    </form>
                  </li>
                )
              })}
            </ul>
          )}

          {isAddingMatch && (
            <AddMatchForm
              round={round}
              leagueId={leagueId}
              teams={teams}
              onCancel={onToggleAdd}
              state={matchState}
              formAction={matchAction}
            />
          )}
        </div>
      )}

      {/* Form de confronto fora do expand (quando expanded=false mas isAddingMatch=true) */}
      {!expanded && isAddingMatch && (
        <div className="border-t border-slate-50 px-5 pb-4">
          <AddMatchForm
            round={round}
            leagueId={leagueId}
            teams={teams}
            onCancel={onToggleAdd}
            state={matchState}
            formAction={matchAction}
          />
        </div>
      )}
    </div>
  )
}

// ─── CreateRoundForm ──────────────────────────────────────────────────────────

function CreateRoundForm({
  leagueId,
  grupo,
  state,
  formAction,
}: {
  leagueId: string
  grupo: number | null
  state: RoundFormState
  formAction: (payload: FormData) => void
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nova rodada
        {grupo !== null && ` — Grupo ${grupoLabel(grupo)}`}
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Nova rodada{grupo !== null ? ` — Grupo ${grupoLabel(grupo)}` : ''}
      </p>

      <input type="hidden" name="leagueId" value={leagueId} />
      {grupo !== null && <input type="hidden" name="grupo" value={grupo} />}

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Nome da rodada
          <span className="ml-1 text-slate-400 font-normal">(opcional — ex: Semifinal)</span>
        </label>
        <input
          name="nome"
          type="text"
          placeholder="Deixe em branco para usar o número automaticamente"
          className={inputCls}
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.success}</p>
      )}

      <div className="flex gap-2">
        <SaveBtn label="Criar rodada" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── GroupSection ─────────────────────────────────────────────────────────────

function GroupSection({
  grupo,
  rounds,
  leagueId,
  teams,
  activeMatchRound,
  onToggleMatch,
  matchState,
  matchAction,
  roundState,
  roundAction,
}: {
  grupo: number
  rounds: Round[]
  leagueId: string
  teams: Team[]
  activeMatchRound: string | null
  onToggleMatch: (id: string) => void
  matchState: MatchFormState
  matchAction: (payload: FormData) => void
  roundState: RoundFormState
  roundAction: (payload: FormData) => void
}) {
  const groupTeams = teams.filter((t) => t.grupo === grupo)
  const label = grupoLabel(grupo)

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
      {/* Cabeçalho do grupo */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
          {label}
        </span>
        <div>
          <h3 className="font-bold text-slate-800">Grupo {label}</h3>
          <p className="text-xs text-slate-400">
            {groupTeams.length} time{groupTeams.length !== 1 ? 's' : ''}
            {groupTeams.length > 0 && (
              <> · {groupTeams.map((t) => t.name).join(', ')}</>
            )}
          </p>
        </div>
      </div>

      {/* Rodadas do grupo */}
      <div className="space-y-3">
        {rounds.map((r) => (
          <RoundCard
            key={r.id}
            round={r}
            leagueId={leagueId}
            teams={teams}
            isAddingMatch={activeMatchRound === r.id}
            onToggleAdd={() => onToggleMatch(r.id)}
            matchState={matchState}
            matchAction={matchAction}
          />
        ))}

        <CreateRoundForm
          leagueId={leagueId}
          grupo={grupo}
          state={roundState}
          formAction={roundAction}
        />
      </div>
    </div>
  )
}

// ─── RoundManager (principal) ─────────────────────────────────────────────────

export function RoundManager({
  league,
  rounds,
  teams,
}: {
  league: League
  rounds: Round[]
  teams: Team[]
}) {
  const [roundState, roundAction] = useActionState(createRoundAction, {})
  const [matchState, matchAction] = useActionState(createMatchAction, {})
  const [activeMatchRound, setActiveMatchRound] = useState<string | null>(null)

  function toggleMatch(roundId: string) {
    setActiveMatchRound((prev) => (prev === roundId ? null : roundId))
  }

  const isGrupos = league.tipo === 'grupos'

  // ── Pontos corridos ────────────────────────────────────────────────────
  if (!isGrupos) {
    return (
      <div className="space-y-4">
        {rounds.map((r) => (
          <RoundCard
            key={r.id}
            round={r}
            leagueId={league.id}
            teams={teams}
            isAddingMatch={activeMatchRound === r.id}
            onToggleAdd={() => toggleMatch(r.id)}
            matchState={matchState}
            matchAction={matchAction}
          />
        ))}

        <CreateRoundForm
          leagueId={league.id}
          grupo={null}
          state={roundState}
          formAction={roundAction}
        />

        {teams.length === 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Nenhum time na liga ainda. Adicione times em{' '}
            <a href="/admin/ligas" className="underline">
              Ligas → Times
            </a>
            .
          </div>
        )}
      </div>
    )
  }

  // ── Por grupos ─────────────────────────────────────────────────────────
  const numGrupos = league.numeroGrupos ?? 0
  const grupos = Array.from({ length: numGrupos }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {grupos.map((g) => {
        const grupoRounds = rounds.filter((r) => r.grupo === g)
        return (
          <GroupSection
            key={g}
            grupo={g}
            rounds={grupoRounds}
            leagueId={league.id}
            teams={teams}
            activeMatchRound={activeMatchRound}
            onToggleMatch={toggleMatch}
            matchState={matchState}
            matchAction={matchAction}
            roundState={roundState}
            roundAction={roundAction}
          />
        )
      })}

      {teams.length === 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Nenhum time na liga ainda. Adicione times em{' '}
          <a href="/admin/ligas" className="underline">
            Ligas → Times
          </a>
          .
        </div>
      )}
    </div>
  )
}
