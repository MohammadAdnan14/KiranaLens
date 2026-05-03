import { Search, Bell } from "lucide-react"
import { Input } from "../shared/ui"

export function TopBar({ title, breadcrumbs = [] }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-muted-foreground">/</span>
                )}
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stores..."
            className="w-64 pl-9"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
            3
          </span>
        </button>

        {/* Timestamp */}
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 lg:flex">
          <span className="h-2 w-2 rounded-full bg-accent pulse-dot" />
          <span className="font-mono text-xs text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </header>
  )
}
