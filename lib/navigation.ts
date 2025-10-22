import type { LucideIcon } from "lucide-react"
import { Home, Plus } from "lucide-react"

export interface NavLinkConfig {
  name: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface QuickActionConfig {
  name: string
  href: string
  icon: LucideIcon
  description?: string
}

export const PRIMARY_NAV_LINKS: NavLinkConfig[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Activity summary and recent projects"
  }
]

export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    name: "New Project",
    href: "/dashboard",
    icon: Plus,
    description: "Open panel and launch creation modal"
  }
]
