'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/database/client'
import { players } from '@/database/schema'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@/shared/types/auth'

export type PlayerFormState = { error?: string; success?: string }

const playerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.').max(255),
  position: z.string().min(1, 'Selecione uma posição.').max(100),
  photoUrl: z.string().url('URL da foto inválida.').optional().or(z.literal('')),
  teamId: z.string().uuid('Time inválido.'),
})

function revalidate(_teamId: string) {
  revalidatePath('/admin/jogadores', 'page')
}

export async function upsertPlayerAction(
  _prev: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const parsed = playerSchema.safeParse({
    name: formData.get('name'),
    position: formData.get('position'),
    photoUrl: formData.get('photoUrl') || '',
    teamId: formData.get('teamId'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { name, position, photoUrl, teamId } = parsed.data
  const id = formData.get('id') as string | null

  try {
    if (id) {
      await db
        .update(players)
        .set({ name, position, photoUrl: photoUrl || null })
        .where(eq(players.id, id))
    } else {
      await db.insert(players).values({ name, position, photoUrl: photoUrl || null, teamId })
    }
  } catch {
    return { error: 'Erro ao salvar o jogador.' }
  }

  revalidate(teamId)
  return { success: id ? 'Jogador atualizado.' : 'Jogador cadastrado.' }
}

export async function deletePlayerAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const id = formData.get('id') as string | null
  const teamId = formData.get('teamId') as string | null
  if (!id || !teamId) return
  await db.delete(players).where(eq(players.id, id))
  revalidate(teamId)
}
