'use server'

import { revalidatePath } from 'next/cache'
import { eq, and, max } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/database/client'
import { rounds, matches } from '@/database/schema'
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
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { roundId, leagueId, homeTeamId, awayTeamId, date } = parsed.data

  try {
    await db.insert(matches).values({
      roundId,
      leagueId,
      homeTeamId,
      awayTeamId,
      date: new Date(date),
      status: 'SCHEDULED',
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
