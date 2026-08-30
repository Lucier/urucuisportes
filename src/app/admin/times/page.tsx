import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/database/client'
import { teams } from '@/database/schema'
import { TeamManager } from '@/components/admin/TeamManager'

export const metadata = { title: 'Times — Admin | Urucuí Esportes' }

export default async function AdminTimesPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')
  if (!userId || userRole !== 'ADMIN') redirect('/login')

  const rows = await db
    .select({ id: teams.id, name: teams.name, logoUrl: teams.logoUrl })
    .from(teams)
    .orderBy(teams.name)

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Times</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie os times cadastrados no portal</p>
      </div>
      <TeamManager teams={rows} />
    </div>
  )
}
