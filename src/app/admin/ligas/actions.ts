'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/database/client'
import { leagues, teams } from '@/database/schema'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@/shared/types/auth'
import { toSlug } from '@/shared/utils'

export type LeagueFormState = { error?: string; success?: string }

const leagueSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  logoUrl: z.string().url('URL do logo inválida.').optional().or(z.literal('')),
  tipo: z.enum(['pontos_corridos', 'grupos']),
  numeroGrupos: z.coerce.number().int().min(2).max(16).nullable(),
}).refine(
  (d) => d.tipo !== 'grupos' || d.numeroGrupos !== null,
  { message: 'Informe o número de grupos.', path: ['numeroGrupos'] },
)

function revalidate() {
  revalidatePath('/admin/ligas')
  revalidatePath('/estatisticas')
}

export async function upsertLeagueAction(
  _prev: LeagueFormState,
  formData: FormData,
): Promise<LeagueFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const rawNumeroGrupos = formData.get('numeroGrupos')
  const parsed = leagueSchema.safeParse({
    name: formData.get('name'),
    logoUrl: formData.get('logoUrl') || '',
    tipo: formData.get('tipo'),
    numeroGrupos: rawNumeroGrupos ? Number(rawNumeroGrupos) : null,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { name, logoUrl, tipo, numeroGrupos } = parsed.data
  const id = formData.get('id') as string | null
  const baseSlug = toSlug(name)

  // Garante slug único (append -2, -3... se necessário)
  async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base
    let attempt = 1
    while (true) {
      const conflict = await db
        .select({ id: leagues.id })
        .from(leagues)
        .where(
          excludeId
            ? and(eq(leagues.slug, slug), ne(leagues.id, excludeId))
            : eq(leagues.slug, slug),
        )
        .limit(1)
      if (conflict.length === 0) return slug
      attempt++
      slug = `${base}-${attempt}`
    }
  }

  try {
    const gruposValue = tipo === 'grupos' ? (numeroGrupos ?? null) : null
    if (id) {
      const slug = await uniqueSlug(baseSlug, id)
      await db
        .update(leagues)
        .set({ name, slug, logoUrl: logoUrl || null, tipo, numeroGrupos: gruposValue })
        .where(eq(leagues.id, id))
    } else {
      const slug = await uniqueSlug(baseSlug)
      await db.insert(leagues).values({ name, slug, logoUrl: logoUrl || null, tipo, numeroGrupos: gruposValue })
    }
  } catch {
    return { error: 'Erro ao salvar a liga.' }
  }

  revalidate()
  return { success: id ? 'Liga atualizada.' : 'Liga cadastrada.' }
}

export async function deleteLeagueAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const id = formData.get('id') as string | null
  if (!id) return
  await db.delete(leagues).where(eq(leagues.id, id))
  revalidate()
}

export async function addTeamToLeagueAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const teamId = formData.get('teamId') as string | null
  const leagueId = formData.get('leagueId') as string | null
  if (!teamId || !leagueId) return
  const rawGrupo = formData.get('grupo')
  const grupo = rawGrupo ? Number(rawGrupo) : null
  await db.update(teams).set({ leagueId, grupo }).where(eq(teams.id, teamId))
  revalidatePath('/admin/ligas', 'page')
  revalidatePath('/estatisticas', 'page')
}

export async function removeTeamFromLeagueAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const teamId = formData.get('teamId') as string | null
  const leagueId = formData.get('leagueId') as string | null
  if (!teamId || !leagueId) return
  await db.update(teams).set({ leagueId: null, grupo: null }).where(eq(teams.id, teamId))
  revalidatePath('/admin/ligas', 'page')
  revalidatePath('/estatisticas', 'page')
}
