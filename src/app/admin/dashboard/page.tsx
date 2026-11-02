import Link from 'next/link';
import {
  Users,
  UserCheck,
  BookOpen,
  ClipboardCheck,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const stats = [
  {
    icon: Users,
    label: 'Total students',
    value: '248',
    subtext: '+12 this term',
  },
  {
    icon: UserCheck,
    label: 'Total staff',
    value: '18',
    subtext: '16 present today',
    subtextColor: 'text-emerald-700',
  },
  {
    icon: BookOpen,
    label: 'Active classes',
    value: '12',
    subtext: '92% capacity',
  },
  {
    icon: ClipboardCheck,
    label: 'Pending admissions',
    value: '14',
    subtext: '5 need review',
  },
  {
    icon: DollarSign,
    label: 'Outstanding fees',
    value: 'LKR 186K',
    subtext: '28 accounts',
  },
  {
    icon: Calendar,
    label: 'Upcoming events',
    value: '6',
    subtext: 'Next: Mar 22',
  },
];

const attendanceBars = [
  { day: 'M', height: '65%' },
  { day: 'T', height: '80%' },
  { day: 'W', height: '72%' },
  { day: 'T', height: '88%' },
  { day: 'F', height: '85%' },
  { day: 'S', height: '52%' },
  { day: 'S', height: '45%' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            TUESDAY, 18 MARCH 2025
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Good morning, Nadeesha
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Here&apos;s what is happening across Handahamy today.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold shadow-sm transition"
        >
          Quick action
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0C4A35] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{s.value}</h3>
              <p className={`text-[10px] mt-1 ${s.subtextColor || 'text-slate-400'}`}>
                {s.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Middle Section: Attendance Bar Chart & Fee Collection Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                ATTENDANCE OVERVIEW
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Student attendance
              </h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              This week
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-48 flex items-end justify-between px-6 pt-6">
            {attendanceBars.map((bar, index) => (
              <div key={index} className="flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className="w-5 bg-[#0C4A35] rounded-t-md transition-all duration-300"
                  style={{ height: bar.height }}
                />
                <span className="text-xs text-slate-400 font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Collection Progress (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              FEE COLLECTION
            </p>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">March progress</h3>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Pending Circle (Amber) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#E5A93C"
                strokeWidth="11"
                fill="none"
              />
              {/* Paid Arc (Green - 78%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#0C4A35"
                strokeWidth="11"
                fill="none"
                strokeDasharray="238.76"
                strokeDashoffset="52.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-900">78%</span>
              <span className="text-[10px] text-slate-400 font-medium">Collected</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0C4A35]" />
              <span>LKR 658K paid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              <span>LKR 186K pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                RECENT
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Recent activity</h3>
            </div>
            <Link
              href="/admin/activity"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              View all
            </Link>
          </div>

          <div className="flex items-center justify-between py-3 px-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0C4A35] flex items-center justify-center text-xs font-bold">
                NP
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">New student added</p>
                <p className="text-[11px] text-slate-400">Nethmi Perera · 12 min ago</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Upcoming Events (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                UP NEXT
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Upcoming events</h3>
            </div>
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Calendar
            </Link>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFFBF3] border border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-[#FDECC8] flex flex-col items-center justify-center text-[#B45309] font-bold shrink-0">
              <span className="text-xs leading-none">22</span>
              <span className="text-[9px] uppercase tracking-wider leading-none mt-0.5">
                MAR
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Little Artists&apos; Day</p>
              <p className="text-[11px] text-slate-500">9:00 AM · Activity hall</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}