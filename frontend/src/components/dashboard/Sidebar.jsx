import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
  Scan,
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Analysis", href: "/dashboard/upload", icon: Upload },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
]

const secondary = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
]

export function Sidebar() {
  const location = useLocation()

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-accent/10 text-accent"
            : "text-muted-foreground hover:bg-card hover:text-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.name}
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-background">
      {/* Logo */}
      <Link
        to="/"
        className="flex h-16 items-center gap-2.5 border-b border-border px-6 transition-opacity hover:opacity-80"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <Scan className="h-4 w-4 text-accent-foreground" />
        </div>
        <span className="font-semibold text-foreground">KiranaLens</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Platform
        </p>
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-border px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Support
        </p>
        {secondary.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </div>

      {/* User */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-sm font-medium text-foreground">
            AD
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-foreground">
              Admin User
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Poonawalla Fincorp
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
