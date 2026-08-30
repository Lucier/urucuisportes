'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/database/client'
import { teams } from '@/database/schema'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@/shared/types/auth'

export type TeamFormState = { error?: string; success?: string }

const teamSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  logoUrl: z.string().url('URL do brasão inválida.').optional().or(z.literal('')),
})

function revalidate() {
  revalidatePath('/admin/times')
  revalidatePath('/estatisticas')
}

export async function upsertTeamAction(
  _prev: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const parsed = teamSchema.safeParse({
    name: formData.get('name'),
    logoUrl: formData.get('logoUrl') || '',
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { name, logoUrl } = parsed.data
  const id = formData.get('id') as string | null

  try {
    if (id) {
      await db
        .update(teams)
        .set({ name, logoUrl: logoUrl || null })
        .where(eq(teams.id, id))
    } else {
      await db.insert(teams).values({ name, logoUrl: logoUrl || null })
    }
  } catch {
    return { error: 'Erro ao salvar o time.' }
  }

  revalidate()
  return { success: id ? 'Time atualizado.' : 'Time cadastrado.' }
}

export async function deleteTeamAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const id = formData.get('id') as string | null
  if (!id) return
  await db.delete(teams).where(eq(teams.id, id))
  revalidate()
}
