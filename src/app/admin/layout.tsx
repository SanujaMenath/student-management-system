import Link from 'next/link';
import { adminNavItems } from '@/config/admin-nav';
import { logout } from '@/actions/auth';
import { LogOut, Bell } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F9F8] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e3b2e] text-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-emerald-900/50">
            <h2 className="text-lg font-bold tracking-wider uppercase">Handahamy</h2>
            <p className="text-[10px] tracking-widest text-emerald-300 uppercase font-medium">
              Admin Portal
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-emerald-100/80 hover:bg-white/10 hover:text-white transition"
                >
                  <Icon className="w-4 h-4 text-emerald-300" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Logout */}
        <div className="p-4 border-t border-emerald-900/50">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-200 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-800">Administrator Console</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#14533e] text-white flex items-center justify-center text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}