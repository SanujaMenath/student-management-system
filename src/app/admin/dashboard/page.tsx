import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Clock,
  DollarSign,
  UserPlus,
  Receipt,
  Megaphone,
  CalendarPlus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

// 1. Metric Cards Data
const stats = [
  {
    title: 'Total Enrolled',
    value: '142',
    icon: GraduationCap,
    change: '+12% from last term',
    trend: 'up',
  },
  {
    title: 'Active Teachers & Staff',
    value: '18',
    icon: Users,
    change: '100% staff present today',
    trend: 'neutral',
  },
  {
    title: 'Pending Admissions',
    value: '7',
    icon: Clock,
    change: '3 require review today',
    trend: 'alert',
  },
  {
    title: 'Fees Collected (Nov)',
    value: 'LKR 450,000',
    icon: DollarSign,
    change: '84% of monthly target',
    trend: 'up',
  },
];

// 2. Recent Admission Applications Data
const recentAdmissions = [
  {
    id: 'ADM-2026-081',
    childName: 'Aria Senanayake',
    age: '2.5 yrs',
    program: 'Toddler Care',
    parentName: 'Kasun Senanayake',
    phone: '+94 77 123 4567',
    date: 'Today, 10:30 AM',
    status: 'Pending Review',
  },
  {
    id: 'ADM-2026-080',
    childName: 'Liam Fernando',
    age: '3.8 yrs',
    program: 'Pre-Kindergarten',
    parentName: 'Niluka Fernando',
    phone: '+94 71 987 6543',
    date: 'Yesterday',
    status: 'Interview Scheduled',
  },
  {
    id: 'ADM-2026-079',
    childName: 'Sithum De Silva',
    age: '1.8 yrs',
    program: 'Playgroup Sun',
    parentName: 'Charith De Silva',
    phone: '+94 76 555 1212',
    date: 'Oct 30',
    status: 'Pending Review',
  },
  {
    id: 'ADM-2026-078',
    childName: 'Maya Jayawardena',
    age: '4.2 yrs',
    program: 'Kindergarten',
    parentName: 'Dr. R. Jayawardena',
    phone: '+94 70 333 4455',
    date: 'Oct 28',
    status: 'Documents Verified',
  },
];

// 3. Class Capacity & Attendance Overview
const classCapacities = [
  { name: 'Playgroup Tiny Tots', enrolled: 14, capacity: 15, attendanceRate: 93 },
  { name: 'Toddler Joy (2–3 Yrs)', enrolled: 22, capacity: 25, attendanceRate: 95 },
  { name: 'Nursery Blooms (3–4 Yrs)', enrolled: 34, capacity: 35, attendanceRate: 88 },
  { name: 'Kindergarten Explorers', enrolled: 28, capacity: 30, attendanceRate: 96 },
];

// 4. Upcoming Institute Events
const upcomingEvents = [
  {
    title: 'Parent-Teacher Coffee Morning',
    date: 'Tomorrow · 9:00 AM',
    location: 'Main Auditorium',
    badge: 'Community',
  },
  {
    title: 'Term 3 Annual Concert Rehearsal',
    date: 'Nov 12 · 10:30 AM',
    location: 'Performance Hall',
    badge: 'Academic',
  },
  {
    title: 'Staff First-Aid & Safety Refresher',
    date: 'Nov 18 · 2:00 PM',
    location: 'Conference Room',
    badge: 'Staff Only',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#14533e] text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Academic Term 3 · Live Session
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institute Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time status for Handahamy Educational Institute operations today.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/admissions"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#14533e] hover:bg-[#0e3b2e] text-white text-xs font-semibold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            New Admission
          </Link>
          <Link
            href="/admin/fees"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F2F5F3] hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition"
          >
            <Receipt className="w-4 h-4 text-emerald-800" />
            Record Fee
          </Link>
          <Link
            href="/admin/communications"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F2F5F3] hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition"
          >
            <Megaphone className="w-4 h-4 text-emerald-800" />
            Announcement
          </Link>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:border-slate-200 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14533e] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#14533e]" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {stat.trend === 'up' && (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {stat.trend === 'alert' && (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span
                  className={`text-[11px] font-medium ${
                    stat.trend === 'alert'
                      ? 'text-amber-600'
                      : stat.trend === 'up'
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Grid: Main Operations & Side Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pending Admissions Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Admission Applications
                </h3>
                <p className="text-xs text-slate-500">
                  Candidates waiting for evaluation and class placement.
                </p>
              </div>
              <Link
                href="/admin/admissions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#14533e] hover:underline"
              >
                View all applications
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Child Details</th>
                    <th className="pb-3">Program</th>
                    <th className="pb-3">Parent / Contact</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-1">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {recentAdmissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 pl-1">
                        <div className="font-semibold text-slate-900">{adm.childName}</div>
                        <div className="text-[11px] text-slate-400">
                          {adm.age} · {adm.id}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {adm.program}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="text-slate-800 font-medium">{adm.parentName}</div>
                        <div className="text-[11px] text-slate-400">{adm.phone}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            adm.status === 'Interview Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : adm.status === 'Documents Verified'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {adm.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-1">
                        <Link
                          href={`/admin/admissions`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#14533e] bg-emerald-50 hover:bg-emerald-100/70 transition"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Program Distribution & Capacity Overview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Class Capacities & Attendance
                </h3>
                <p className="text-xs text-slate-500">
                  Enrolled vs maximum seats across nursery stages.
                </p>
              </div>
              <Link
                href="/admin/classes"
                className="text-xs font-semibold text-[#14533e] hover:underline"
              >
                Manage Classes
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classCapacities.map((item) => {
                const percentage = Math.round((item.enrolled / item.capacity) * 100);
                return (
                  <div
                    key={item.name}
                    className="p-4 rounded-2xl border border-slate-100 bg-[#FAFBFB]"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>{item.name}</span>
                      <span className="text-slate-500">
                        {item.enrolled} / {item.capacity} seats
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="h-full bg-[#14533e] rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
                      <span>{percentage}% full capacity</span>
                      <span className="text-emerald-700 font-medium">
                        {item.attendanceRate}% present today
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Calendar Notices & Quick Info */}
        <div className="space-y-6">
          {/* Upcoming Events Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Upcoming Events</h3>
              <Link
                href="/admin/events"
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <CalendarPlus className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-emerald-900/5 hover:border-emerald-900/10 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/70 text-[#0e3b2e] uppercase tracking-wider">
                      {event.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{event.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mt-2 leading-snug">
                    {event.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{event.location}</p>
                </div>
              ))}
            </div>

            <Link
              href="/admin/events"
              className="mt-4 inline-flex items-center justify-center w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Open Academic Calendar
            </Link>
          </div>

          {/* Quick Notice / System Health Box */}
          <div className="rounded-3xl p-6 bg-[#0e3b2e] text-white">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Institute Health
            </div>
            <p className="text-sm font-semibold mt-2 text-white">
              AI Admissions Assistant is active
            </p>
            <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
              Google Gemini RAG is answering visitor queries using verified knowledge base
              embeddings.
            </p>
            <div className="mt-4 pt-4 border-t border-emerald-900/50 flex items-center justify-between">
              <span className="text-xs text-emerald-200">Supabase pgvector</span>
              <span className="text-xs font-semibold text-emerald-300">Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}