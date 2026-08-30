import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { usersRepository } from '@/modules/users/repository'
import { UserRole } from '@/shared/types/auth'
import { LogoutButton } from './LogoutButton'

export const metadata = { title: 'Dashboard | Urucuí Esportes' }

export default async function DashboardPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')

  if (!userId) redirect('/login')

  const user = await usersRepository.findById(userId)
  if (!user) redirect('/login')

  const isAdmin = userRole === UserRole.ADMIN

  const memberSince = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(user.createdAt))

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Olá, {user.name.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Bem-vindo ao seu painel</p>
      </div>

      {/* Perfil */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Seu perfil
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Nome</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">E-mail</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Função</dt>
            <dd className="mt-0.5">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isAdmin
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isAdmin ? 'Administrador' : 'Usuário'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Membro desde</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">{memberSince}</dd>
          </div>
        </dl>
      </div>

      {/* Acesso rápido admin */}
      {isAdmin && (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Área administrativa
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Notícias e partidas
            </Link>
            <Link
              href="/admin/fotos"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fotos
            </Link>
            <Link
              href="/admin/transmissoes"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Transmissões
            </Link>
            <Link
              href="/admin/times"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Times
            </Link>
            <Link
              href="/admin/jogadores"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Jogadores
            </Link>
            <Link
              href="/admin/ligas"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Ligas
            </Link>
          </div>
        </div>
      )}

      {/* Navegação do site */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Explorar o portal
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { href: '/noticias', label: 'Notícias', desc: 'Últimas notícias esportivas' },
            { href: '/fotos', label: 'Fotos', desc: 'Álbuns e galerias' },
            { href: '/transmissoes', label: 'Transmissões', desc: 'Ao vivo e programados' },
            { href: '/estatisticas', label: 'Estatísticas', desc: 'Classificações e artilheiros' },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col rounded-xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span className="text-sm font-medium text-slate-800">{label}</span>
              <span className="mt-0.5 text-xs text-slate-400">{desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 text-right">
        <LogoutButton />
      </div>
    </div>
  )
}
