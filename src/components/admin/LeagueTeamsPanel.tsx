'use client'

import Link from 'next/link'
import { addTeamToLeagueAction, removeTeamFromLeagueAction } from '@/app/admin/ligas/actions'

type Team = {
  id: string
  name: string
  logoUrl: string | null
  leagueId: string | null
}

function Avatar({ name, logoUrl, inLeague }: { name: string; logoUrl: string | null; inLeague: boolean }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="h-8 w-8 flex-shrink-0 rounded-full border border-slate-100 object-contain bg-slate-50"
      />
    )
  }
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
      inLeague ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
    }`}>
      {name.charAt(0)}
    </div>
  )
}

export function LeagueTeamsPanel({
  leagueId,
  inLeague,
  outLeague,
  noTeams,
}: {
  leagueId: string
  inLeague: Team[]
  outLeague: Team[]
  noTeams: boolean
}) {
  if (noTeams) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-400">Nenhum time cadastrado ainda.</p>
        <Link
          href="/admin/times"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Cadastrar times
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Times na liga */}
      <div className="mb-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-800">
            Times na liga
            <span className="ml-2 text-sm font-normal text-gray-400">({inLeague.length})</span>
          </h2>
        </div>

        {inLeague.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">
            Nenhum time adicionado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {inLeague.map((team) => (
              <li key={team.id} className="flex items-center gap-3 px-6 py-3">
                <Avatar name={team.name} logoUrl={team.logoUrl} inLeague />
                <span className="flex-1 text-sm font-medium text-slate-800">{team.name}</span>
                <form action={removeTeamFromLeagueAction}>
                  <input type="hidden" name="teamId" value={team.id} />
                  <input type="hidden" name="leagueId" value={leagueId} />
                  <button
                    type="submit"
                    className="rounded px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      if (!confirm(`Remover "${team.name}" da liga?`)) e.preventDefault()
                    }}
                  >
                    Remover
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Times disponíveis */}
      {outLeague.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold text-slate-800">
              Adicionar times
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({outLeague.length} disponíveis)
              </span>
            </h2>
          </div>

          <ul className="divide-y divide-slate-50">
            {outLeague.map((team) => (
              <li key={team.id} className="flex items-center gap-3 px-6 py-3">
                <Avatar name={team.name} logoUrl={team.logoUrl} inLeague={false} />
                <span className="flex-1 text-sm text-slate-600">{team.name}</span>
                {team.leagueId && (
                  <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    outra liga
                  </span>
                )}
                <form action={addTeamToLeagueAction}>
                  <input type="hidden" name="teamId" value={team.id} />
                  <input type="hidden" name="leagueId" value={leagueId} />
                  <button
                    type="submit"
                    className="rounded px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    + Adicionar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
