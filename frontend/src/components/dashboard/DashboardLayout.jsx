import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export function DashboardLayout({ children, title, breadcrumbs }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <TopBar title={title} breadcrumbs={breadcrumbs} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
