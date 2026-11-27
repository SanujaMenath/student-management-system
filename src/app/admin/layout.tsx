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
  Briefcase,
} from 'lucide-react';
import { logout } from '@/actions/auth';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Staff', href: '/admin/staff', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: BookOpen },
  { label: 'Admissions', href: '/admin/admissions', icon: ClipboardList },
  { label: 'Careers', href: '/admin/careers', icon: Briefcase },
  { label: 'Fees', href: '/admin/fees', icon: Receipt },
  { label: 'Communication', href: '/admin/communication', icon: MessageSquare },
  { label: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { label: 'Events', href: '/admin/events', icon: Calendar },
  { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F5F8F7] font-sans text-[#374151]">
      {/* Deep Forest Green Sticky Sidebar */}
      <aside className="sticky top-0 h-screen w-72 shrink-0 bg-[#082F27] p-5 text-white select-none hidden lg:block">
        <div className="flex flex-col justify-between h-full">
          {/* Logo / Header */}
          <div className="shrink-0 pb-7 border-b border-white/15 pt-1 px-1">
            <h1 className="font-sans text-[20px] font-bold text-white tracking-wide uppercase">
              HANDAHAMY
            </h1>
            <p className="mt-1 font-sans text-[11px] font-semibold text-white tracking-widest uppercase">
              EDUCATIONAL INSTITUTE
            </p>
          </div>

          {/* Section Tag */}
          <div className="shrink-0 mt-7 mb-3 px-4 text-[12px] font-normal tracking-widest text-[rgba(167,243,208,0.6)] uppercase">
            ADMIN PORTAL
          </div>

          {/* Scrollable Middle Navigation Links */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <nav className="space-y-2 pb-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-[12px] text-[14px] transition-colors ${
                      isActive
                        ? 'bg-[#187055] text-white font-semibold rounded-[12px]'
                        : 'font-normal text-emerald-50/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-white" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Logout & User Profile */}
          <div className="shrink-0 pt-4 border-t border-white/15 space-y-2.5">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] border border-white/15 hover:bg-white/10 text-emerald-50/85 hover:text-white text-[14px] font-semibold transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </form>

            {/* User Profile Capsule */}
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#187055] text-white flex items-center justify-center font-semibold text-[12px]">
                  NS
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-semibold text-white leading-tight">Nadeesha Silva</div>
                  <div className="text-[12px] font-medium text-emerald-200/70">Administrator</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-emerald-200/60" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="min-h-[96px] bg-white px-6 lg:px-10 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
          {/* Search Box */}
          <div className="flex items-center gap-3 max-w-[512px] w-full bg-[#F5F8F7] rounded-[12px] px-4 py-3">
            <Search className="w-5 h-5 shrink-0 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search students, events, payments..."
              className="w-full text-[14px] text-[#374151] placeholder:text-[#9CA3AF] bg-transparent outline-none"
            />
          </div>

          {/* Actions & Avatar */}
          <div className="flex items-center gap-5 shrink-0">
            <button
              type="button"
              aria-label="Notifications"
              className="relative bg-[#F5F8F7] p-3 rounded-[12px] hover:bg-[#E8F0EC] transition-colors"
            >
              <Bell className="w-5 h-5 text-[#082F27]" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-[12px] font-medium rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="w-[44px] h-[44px] rounded-full bg-[#187055] text-white font-semibold flex items-center justify-center text-[14px]">
              N
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 bg-[#F5F8F7] py-10 px-6 lg:px-10">
          <div className="max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}