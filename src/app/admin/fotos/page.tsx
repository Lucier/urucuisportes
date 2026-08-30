import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { db } from '@/database/client'
import { photoAlbums } from '@/database/schema'
import { PhotoAlbumManager } from '@/components/admin/PhotoAlbumManager'

export const metadata = { title: 'Fotos — Admin | Urucuí Esportes' }

export default async function AdminFotosPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')

  if (!userId || userRole !== 'ADMIN') redirect('/login')

  const albums = await db
    .select()
    .from(photoAlbums)
    .orderBy(desc(photoAlbums.createdAt))

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Álbuns de Fotos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cadastre links de repositórios de fotos (Google Drive, Flickr, etc.)
        </p>
      </div>
      <PhotoAlbumManager albums={albums} />
    </div>
  )
}
