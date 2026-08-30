'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/database/client'
import { streams } from '@/database/schema'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@/shared/types/auth'
import { extractYouTubeId } from '@/lib/youtube'

export type StreamFormState = { error?: string; success?: string }

const streamSchema = z.object({
  title: z.string().min(2).max(255),
  url: z
    .string()
    .url('URL inválida.')
    .refine((u) => extractYouTubeId(u) !== null, 'Informe uma URL válida do YouTube.'),
  description: z.string().max(500).optional(),
  status: z.enum(['LIVE', 'SCHEDULED', 'FINISHED']),
  scheduledAt: z.string().optional(),
})

function revalidate() {
  revalidatePath('/transmissoes')
  revalidatePath('/admin/transmissoes')
}

export async function upsertStreamAction(
  _prev: StreamFormState,
  formData: FormData,
): Promise<StreamFormState> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return { error: 'Acesso negado.' }
  }

  const parsed = streamSchema.safeParse({
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description') || undefined,
    status: formData.get('status'),
    scheduledAt: formData.get('scheduledAt') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const { title, url, description, status, scheduledAt } = parsed.data
  const id = formData.get('id') as string | null

  const scheduledAtDate =
    scheduledAt && scheduledAt.trim() !== '' ? new Date(scheduledAt) : null

  try {
    if (id) {
      await db
        .update(streams)
        .set({
          title,
          url,
          description: description ?? null,
          status,
          scheduledAt: scheduledAtDate,
        })
        .where(eq(streams.id, id))
    } else {
      await db.insert(streams).values({
        title,
        url,
        description: description ?? null,
        status,
        scheduledAt: scheduledAtDate,
      })
    }
  } catch {
    return { error: 'Erro ao salvar a transmissão.' }
  }

  revalidate()
  return { success: id ? 'Transmissão atualizada.' : 'Transmissão cadastrada.' }
}

export async function deleteStreamAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const id = formData.get('id') as string | null
  if (!id) return
  await db.delete(streams).where(eq(streams.id, id))
  revalidate()
}

export async function updateStreamStatusAction(formData: FormData): Promise<void> {
  try {
    await requireRole(UserRole.ADMIN)
  } catch {
    return
  }
  const id = formData.get('id') as string | null
  const status = formData.get('status') as 'LIVE' | 'SCHEDULED' | 'FINISHED' | null
  if (!id || !status) return
  await db.update(streams).set({ status }).where(eq(streams.id, id))
  revalidate()
}
