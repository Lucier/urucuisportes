import type { User } from '../types'

interface UserListProps {
  users: User[]
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Nenhum usuário encontrado.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
      {users.map((user) => (
        <li key={user.id} className="flex items-center gap-4 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-medium text-blue-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
