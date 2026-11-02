'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Receipt,
  MessageSquare,
  FileBarChart,
  Calendar,
  Image as ImageIcon,
  LogOut,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
} from 'lucide-react';
import { logout } from '@/actions/auth';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Staff', href: '/admin/staff', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: BookOpen },
  { label: 'Admissions', href: '/admin/admissions', icon: ClipboardList },
  { label: 'Fees', href: '/admin/fees', icon: Receipt },
  { label: 'Communication', href: '/admin/communication', icon: MessageSquare },
  { label: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { label: 'Events', href: '/admin/events', icon: Calendar },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex">
      {/* Deep Forest Green Sidebar */}
      <aside className="w-64 bg-[#072B20] text-white flex flex-col justify-between shrink-0 p-5 select-none hidden lg:flex">
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="pt-2 px-1">
            <h1 className="text-lg font-extrabold tracking-wider text-white uppercase">
              HANDAHAMY
            </h1>
            <p className="text-[10px] tracking-widest text-emerald-300/80 uppercase font-medium">
              EDUCATIONAL INSTITUTE
            </p>
          </div>

          {/* Section Tag */}
          <div className="px-1 text-[11px] font-semibold text-emerald-400/60 uppercase tracking-wider">
            ADMIN PORTAL
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#124A3A] text-white shadow-sm'
                      : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-emerald-300" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout & User Profile */}
        <div className="space-y-3 pt-6">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-emerald-900/60 hover:bg-emerald-900/30 text-emerald-100/80 text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </form>

          {/* User Profile Capsule */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0B3528] border border-emerald-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E5A93C] text-slate-900 flex items-center justify-center font-bold text-xs">
                NS
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">Nadeesha Silva</div>
                <div className="text-[10px] text-emerald-300/70">Administrator</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-emerald-300/60" />
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-18 px-6 lg:px-10 py-4 flex items-center justify-between bg-transparent">
          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students, events, payments..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#072B20]/20"
            />
          </div>

          {/* Actions & Avatar */}
          <div className="flex items-center gap-4 ml-4">
            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-slate-200/60 transition text-slate-600"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#B91C1C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#072B20] text-white flex items-center justify-center font-bold text-sm">
              N
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="p-6 lg:p-10 pt-2 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}