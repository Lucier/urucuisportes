import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { db } from '@/database/client'
import { streams } from '@/database/schema'
import { StreamManager } from '@/components/admin/StreamManager'

export const metadata = { title: 'Transmissões — Admin | Urucuí Esportes' }

export default async function AdminTransmissoesPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')
  if (!userId || userRole !== 'ADMIN') redirect('/login')

  const rows = await db.select().from(streams).orderBy(desc(streams.createdAt))

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Transmissões</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie links de transmissões ao vivo pelo YouTube
        </p>
      </div>
      <StreamManager streams={rows} />
    </div>
  )
}
