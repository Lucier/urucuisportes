'use server'

import { revalidatePath } from 'next/cache'
import { eq, and, max, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/database/client'
import { rounds, matches, matchGoals } from '@/database/schema'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@/shared/types/auth'

export type RoundFormState = { error?: string; success?: string }
export type MatchFormState = { error?: string; success?: string }

function revalidate() {
  revalidatePath('/admin/rodadas')
  revalidatePath('/estatisticas')
}

// ─── Rodadas ──────────────────────────────────────────────────────────────────

const roundSchema = z.object({
  leagueId: z.string().uuid('Liga inválida.'),
  nome: z.string().max(255).optional().or(z.literal('')),
  grupo: z.coerce.number().int().min(1).nullable(),
})

export async function createRoundAction(
  _prev: RoundFormState,
  formData: FormData,
): Promise<RoundFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const rawGrupo = formData.get('grupo')
  const parsed = roundSchema.safeParse({
    leagueId: formData.get('leagueId'),
    nome: formData.get('nome') || '',
    grupo: rawGrupo ? Number(rawGrupo) : null,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { leagueId, nome, grupo } = parsed.data

  // Calcula o próximo número de rodada para este contexto (grupo ou liga)
  const [result] = await db
    .select({ maxNumero: max(rounds.numero) })
    .from(rounds)
    .where(
      grupo !== null
        ? and(eq(rounds.leagueId, leagueId), eq(rounds.grupo, grupo))
        : eq(rounds.leagueId, leagueId),
    )

  const numero = (result?.maxNumero ?? 0) + 1

  try {
    await db.insert(rounds).values({ leagueId, numero, nome: nome || null, grupo })
  } catch {
    return { error: 'Erro ao criar rodada.' }
  }

  revalidate()
  return { success: `Rodada ${numero} criada.` }
}

export async function deleteRoundAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const id = formData.get('id') as string | null
  if (!id) return
  await db.delete(rounds).where(eq(rounds.id, id))
  revalidate()
}

// ─── Confrontos ───────────────────────────────────────────────────────────────

const matchSchema = z
  .object({
    roundId: z.string().uuid('Rodada inválida.'),
    leagueId: z.string().uuid('Liga inválida.'),
    homeTeamId: z.string().uuid('Time da casa inválido.'),
    awayTeamId: z.string().uuid('Time visitante inválido.'),
    date: z.string().min(1, 'Data obrigatória.'),
    streamUrl: z.string().url('URL de transmissão inválida.').optional().or(z.literal('')),
  })
  .refine((d) => d.homeTeamId !== d.awayTeamId, {
    message: 'Time da casa e visitante devem ser diferentes.',
    path: ['awayTeamId'],
  })

export async function createMatchAction(
  _prev: MatchFormState,
  formData: FormData,
): Promise<MatchFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const parsed = matchSchema.safeParse({
    roundId: formData.get('roundId'),
    leagueId: formData.get('leagueId'),
    homeTeamId: formData.get('homeTeamId'),
    awayTeamId: formData.get('awayTeamId'),
    date: formData.get('date'),
    streamUrl: formData.get('streamUrl') || '',
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { roundId, leagueId, homeTeamId, awayTeamId, date, streamUrl } = parsed.data

  try {
    await db.insert(matches).values({
      roundId,
      leagueId,
      homeTeamId,
      awayTeamId,
      date: new Date(date),
      status: 'SCHEDULED',
      streamUrl: streamUrl || null,
    })
  } catch {
    return { error: 'Erro ao criar confronto.' }
  }

  revalidate()
  return { success: 'Confronto adicionado.' }
}

export async function deleteMatchAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const id = formData.get('id') as string | null
  if (!id) return
  await db.delete(matches).where(eq(matches.id, id))
  revalidate()
}

// ─── Placar e gols ────────────────────────────────────────────────────────────

const scoreSchema = z.object({
  matchId: z.string().uuid('Partida inválida.'),
  homeScore: z.coerce.number().int().min(0).max(99).nullable(),
  awayScore: z.coerce.number().int().min(0).max(99).nullable(),
  status: z.enum(['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED']),
  streamUrl: z.string().url('URL de transmissão inválida.').optional().or(z.literal('')),
})

export async function updateMatchScoreAction(
  _prev: MatchFormState,
  formData: FormData,
): Promise<MatchFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const homeScoreRaw = formData.get('homeScore')
  const awayScoreRaw = formData.get('awayScore')

  const parsed = scoreSchema.safeParse({
    matchId: formData.get('matchId'),
    homeScore: homeScoreRaw !== '' && homeScoreRaw !== null ? homeScoreRaw : null,
    awayScore: awayScoreRaw !== '' && awayScoreRaw !== null ? awayScoreRaw : null,
    status: formData.get('status'),
    streamUrl: formData.get('streamUrl') || '',
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { matchId, homeScore, awayScore, status, streamUrl } = parsed.data

  // Collect goals: form keys "goal_{playerId}:{teamId}" → count
  const goalEntries: { matchId: string; playerId: string; teamId: string; goals: number }[] = []
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('goal_')) continue
    const count = Number(value)
    if (!count || count < 1) continue
    const [playerId, teamId] = key.slice('goal_'.length).split(':')
    if (playerId && teamId) {
      goalEntries.push({ matchId, playerId, teamId, goals: count })
    }
  }

  try {
    await db.update(matches).set({ homeScore, awayScore, status, streamUrl: streamUrl || null }).where(eq(matches.id, matchId))
    await db.delete(matchGoals).where(eq(matchGoals.matchId, matchId))
    if (goalEntries.length > 0) {
      await db.insert(matchGoals).values(goalEntries)
    }
  } catch {
    return { error: 'Erro ao salvar placar.' }
  }

  revalidate()
  return { success: 'Placar salvo com sucesso.' }
}

// ─── Rodada de mata-mata manual ───────────────────────────────────────────────

export async function createKnockoutRoundAction(
  _prev: RoundFormState,
  formData: FormData,
): Promise<RoundFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const leagueId = formData.get('leagueId') as string | null
  const roundName = (formData.get('roundName') as string | null)?.trim()
  const date = formData.get('date') as string | null
  const countRaw = Number(formData.get('matchCount') ?? 0)

  if (!leagueId) return { error: 'Liga inválida.' }
  if (!roundName) return { error: 'Nome da fase obrigatório.' }
  if (!date) return { error: 'Data e hora obrigatórias.' }
  if (!countRaw || countRaw < 1) return { error: 'Adicione ao menos um confronto.' }

  const matchPairs: { homeTeamId: string; awayTeamId: string }[] = []
  for (let i = 0; i < countRaw; i++) {
    const home = formData.get(`match_home_${i}`) as string | null
    const away = formData.get(`match_away_${i}`) as string | null
    if (!home || !away) return { error: `Confronto ${i + 1} incompleto.` }
    if (home === away) return { error: `Confronto ${i + 1}: os times devem ser diferentes.` }
    matchPairs.push({ homeTeamId: home, awayTeamId: away })
  }

  const [maxResult] = await db
    .select({ maxNumero: max(rounds.numero) })
    .from(rounds)
    .where(and(eq(rounds.leagueId, leagueId), isNull(rounds.grupo)))

  const numero = (maxResult?.maxNumero ?? 0) + 1

  const [newRound] = await db
    .insert(rounds)
    .values({ leagueId, numero, nome: roundName, grupo: null })
    .returning()

  const matchDate = new Date(date)
  await db.insert(matches).values(
    matchPairs.map(({ homeTeamId, awayTeamId }) => ({
      leagueId,
      roundId: newRound.id,
      homeTeamId,
      awayTeamId,
      date: matchDate,
      status: 'SCHEDULED' as const,
    })),
  )

  revalidate()
  return { success: `"${roundName}" criada com ${matchPairs.length} confronto${matchPairs.length !== 1 ? 's' : ''}.` }
}
