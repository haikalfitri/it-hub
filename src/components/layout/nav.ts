import { BookOpen, Boxes, CircleUserRound, House, Info, LayoutDashboard, LifeBuoy, ListChecks, type LucideIcon, Users } from 'lucide-react'
import type { Role } from '@/domain/types'

export const ROLE_LABEL: Record<Role, string> = { staff: 'Staff', manager: 'Manager', hr: 'HR', it: 'IT Admin' }

export const NAV_ITEMS: { to: string; label: string; icon: LucideIcon; roles: Role[] | 'all' }[] = [
  { to: '/', label: 'Home', icon: House, roles: 'all' },
  { to: '/help', label: 'Help Center', icon: BookOpen, roles: 'all' },
  { to: '/tickets', label: 'Service Desk', icon: LifeBuoy, roles: 'all' },
  { to: '/assets', label: 'Assets', icon: Boxes, roles: 'all' },
  { to: '/workflows', label: 'Workflows', icon: ListChecks, roles: 'all' },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: 'all' },
  { to: '/people', label: 'People', icon: Users, roles: ['hr', 'it'] },
  { to: '/me', label: 'My profile', icon: CircleUserRound, roles: 'all' },
  { to: '/about', label: 'About this project', icon: Info, roles: 'all' },
]

export const navFor = (role: Role) => NAV_ITEMS.filter((n) => n.roles === 'all' || n.roles.includes(role))
