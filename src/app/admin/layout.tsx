import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex gap-6 lg:items-start">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
