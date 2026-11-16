'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const isActive = (href: string) => pathname === href;
  const linkClass = (href: string) =>
    isActive(href)
      ? 'text-emerald-800 font-semibold bg-emerald-50/70 px-3.5 py-1.5 rounded-full'
      : 'hover:text-slate-900 transition';

  return (
    <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
      <Link href="/" className="flex flex-col">
        <span className="text-base font-extrabold uppercase tracking-wider text-slate-900">
          HANDAHAMY
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
          EDUCATIONAL INSTITUTE
        </span>
      </Link>

      <nav className="hidden items-center gap-8 text-xs font-medium text-slate-600 md:flex">
        <Link href="/" className={linkClass('/')}>
          Home
        </Link>
        <Link href="/about" className={linkClass('/about')}>
          About
        </Link>

        <div
          className="relative"
          onMouseEnter={() => setIsExploreOpen(true)}
          onMouseLeave={() => setIsExploreOpen(false)}
        >
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 py-1 transition hover:text-slate-900"
            aria-expanded={isExploreOpen}
            onClick={() => setIsExploreOpen((isOpen) => !isOpen)}
          >
            <span>Explore</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                isExploreOpen ? 'rotate-180 text-slate-900' : ''
              }`}
            />
          </button>

          {isExploreOpen && (
            <div className="absolute left-1/2 top-full w-36 -translate-x-1/2 pt-2">
              <div className="flex animate-in zoom-in-95 flex-col rounded-2xl border border-slate-100 bg-white py-2 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.12)] fade-in duration-150">
                <Link
                  href="/programs"
                  className={`${linkClass('/programs')} rounded-none px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0C4A35]`}
                >
                  Programs
                </Link>
                <Link
                  href="/events"
                  className={`${linkClass('/events')} rounded-none px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0C4A35]`}
                >
                  Events
                </Link>
                <Link
                  href="/gallery"
                  className={`${linkClass('/gallery')} rounded-none px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0C4A35]`}
                >
                  Gallery
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link href="/admissions" className={linkClass('/admissions')}>
          Admissions
        </Link>
        <Link href="/payments" className={linkClass('/payments')}>
          Payments
        </Link>
      </nav>

      <Link
        href="/auth/login"
        className="inline-flex items-center justify-center rounded-xl bg-[#0C4A35] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#072B20]"
      >
        Login
      </Link>
    </header>
  );
}
