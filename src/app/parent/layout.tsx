'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  UserRound,
} from 'lucide-react';
import { logout } from '@/actions/auth';

const navItems = [
  { label: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
  { label: 'Learning management', href: '/parent/learning-management', icon: BookOpen },
  { label: 'Attendance', href: '/parent/attendance', icon: BarChart3 },
  { label: 'Fees & payments', href: '/parent/fees', icon: CircleDollarSign },
  { label: 'Messages', href: '/parent/messages', icon: MessageSquare },
  { label: 'Events', href: '/parent/events', icon: CalendarDays },
  { label: 'Child profile', href: '/parent/child-profile', icon: UserRound },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex">
      <aside className="hidden w-64 shrink-0 select-none flex-col justify-between bg-[#072B20] p-5 text-white lg:flex">
        <div className="space-y-6">
          <div className="px-1 pt-2">
            <h1 className="text-lg font-extrabold tracking-wider text-white">HANDAHAMY</h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-300/80">
              Educational institute
            </p>
          </div>

          <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/60">
            Parent portal
          </div>

          <nav className="space-y-1" aria-label="Parent navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#124A3A] text-white shadow-sm'
                      : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 opacity-80" />
                    <span>{item.label}</span>
                  </span>
                  {isActive && <ChevronRight className="h-4 w-4 text-emerald-300" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-6">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl border border-emerald-900/60 px-3.5 py-2.5 text-xs font-semibold text-emerald-100/80 transition hover:bg-emerald-900/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </form>

          <div className="flex items-center justify-between rounded-2xl border border-emerald-900/50 bg-[#0B3528] p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5A93C] text-xs font-bold text-slate-900">
                PS
              </div>
              <div>
                <div className="text-xs font-bold leading-tight text-white">Parent account</div>
                <div className="text-[10px] text-emerald-300/70">Parent</div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-emerald-300/60" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-18 items-center justify-between bg-transparent px-6 py-4 lg:px-10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search learning resources..."
              aria-label="Search learning resources"
              className="w-full rounded-xl border border-slate-200/80 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#072B20]/20"
            />
          </div>

          <div className="ml-4 flex items-center gap-4">
            <button
              type="button"
              aria-label="View notifications"
              className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-200/60"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B91C1C] text-[10px] font-bold text-white">
                2
              </span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#072B20] text-white">
              <UserRound className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pt-2 lg:p-10 lg:pt-2">{children}</main>
      </div>
    </div>
  );
}