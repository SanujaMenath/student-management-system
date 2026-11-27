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
import { getDashboardData } from '@/actions/dashboard';

const attendanceBars = [
  { day: 'M', height: '65%' },
  { day: 'T', height: '80%' },
  { day: 'W', height: '72%' },
  { day: 'T', height: '88%' },
  { day: 'F', height: '85%' },
  { day: 'S', height: '52%' },
  { day: 'S', height: '45%' },
];

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const stats = [
    {
      icon: Users,
      label: 'Total students',
      value: String(data.totalStudents),
      subtext: '+12 this term',
    },
    {
      icon: UserCheck,
      label: 'Total staff',
      value: String(data.totalStaff),
      subtext: `${data.totalStaff} registered`,
      subtextColor: 'text-emerald-700',
    },
    {
      icon: BookOpen,
      label: 'Active classes',
      value: String(data.activeClasses),
      subtext: 'Nursery & Pre-K',
    },
    {
      icon: ClipboardCheck,
      label: 'Pending admissions',
      value: String(data.pendingAdmissions),
      subtext: `${data.pendingAdmissions} need review`,
    },
    {
      icon: DollarSign,
      label: 'Outstanding fees',
      value: `LKR ${(data.outstandingFeesLKR / 1000).toFixed(0)}K`,
      subtext: 'Current term balance',
    },
    {
      icon: Calendar,
      label: 'Upcoming events',
      value: String(data.upcomingEventsCount),
      subtext: data.nextEvent ? `Next: ${data.nextEvent.month} ${data.nextEvent.day}` : 'None scheduled',
    },
  ];

  const circumference = 2 * Math.PI * 38;
  const paidOffset = circumference - (circumference * data.feePercentage) / 100;

  return (
    <div className="space-y-6 font-sans text-[#374151]">
      {/* Header Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium tracking-widest uppercase text-[#6B7280]">
            ADMINISTRATOR OVERVIEW
          </p>
          <h2 className="text-3xl font-semibold text-[#082F27] tracking-tight mt-1">
            Good morning, Nadeesha
          </h2>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Here&apos;s what is happening across Handahamy today.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#187055] hover:bg-[#145C46] text-white text-[14px] font-semibold rounded-[12px] transition-colors"
        >
          Quick action
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white p-5 rounded-[16px] border border-[#D8E4DF]"
            >
              <div className="w-9 h-9 rounded-[12px] bg-[#F5F8F7] text-[#187055] flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-[12px] font-medium text-[#6B7280]">{s.label}</p>
              <h3 className="text-2xl font-semibold text-[#111827] mt-1">{s.value}</h3>
              <p className={`text-[12px] font-medium mt-1 ${s.subtextColor || 'text-[#6B7280]'}`}>
                {s.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Attendance Bar Chart & Fee Collection Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[16px] p-5 border border-[#D8E4DF] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">
                ATTENDANCE OVERVIEW
              </p>
              <h3 className="text-[16px] font-semibold text-[#111827] mt-0.5">
                Student attendance
              </h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#B8D3C8] text-[#082F27] text-[14px] font-semibold rounded-[12px] hover:bg-[#F5F8F7] transition-colors"
            >
              This week
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="h-48 flex items-end justify-between px-6 pt-6">
            {attendanceBars.map((bar, index) => (
              <div key={index} className="flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className="w-5 bg-[#187055] rounded-t-md transition-all duration-300"
                  style={{ height: bar.height }}
                />
                <span className="text-[12px] font-medium text-[#6B7280]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Collection Progress */}
        <div className="bg-white rounded-[16px] p-5 border border-[#D8E4DF] flex flex-col justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">
              FEE COLLECTION
            </p>
            <h3 className="text-[16px] font-semibold text-[#111827] mt-0.5">March progress</h3>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#E5A93C"
                strokeWidth="11"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#187055"
                strokeWidth="11"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={paidOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-semibold text-[#111827]">
                {data.feePercentage}%
              </span>
              <span className="text-[12px] font-medium text-[#6B7280]">Collected</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-[12px] font-medium text-[#374151]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#187055]" />
              <span>LKR {(data.paidFeesLKR / 1000).toFixed(0)}K paid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C]" />
              <span>LKR {(data.outstandingFeesLKR / 1000).toFixed(0)}K pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[16px] p-5 border border-[#D8E4DF]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">
                RECENT
              </p>
              <h3 className="text-[16px] font-semibold text-[#111827] mt-0.5">Recent activity</h3>
            </div>
            <Link
              href="/admin/students"
              className="text-[14px] font-semibold text-[#187055] hover:text-[#145C46] transition-colors"
            >
              View all
            </Link>
          </div>

          {data.recentActivity.length === 0 ? (
            <p className="text-[14px] text-[#6B7280] py-3">No recent activities recorded.</p>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {data.recentActivity.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 px-2 rounded-[12px] hover:bg-[#F5F8F7] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[12px] bg-[#F5F8F7] text-[#187055] flex items-center justify-center text-[12px] font-semibold">
                      {act.initials}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#111827]">{act.title}</p>
                      <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280]">
                        {act.description} · {act.timeAgo}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-[16px] p-5 border border-[#D8E4DF]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">
                UP NEXT
              </p>
              <h3 className="text-[16px] font-semibold text-[#111827] mt-0.5">Upcoming events</h3>
            </div>
            <Link
              href="/admin/events"
              className="text-[14px] font-semibold text-[#187055] hover:text-[#145C46] transition-colors"
            >
              Calendar
            </Link>
          </div>

          {data.nextEvent ? (
            <div className="flex items-center gap-3 p-4 rounded-[12px] bg-[#FFFBF3] border border-amber-200/70">
              <div className="w-11 h-11 rounded-[12px] bg-[#FDECC8] flex flex-col items-center justify-center text-[#B45309] font-semibold shrink-0">
                <span className="text-[14px] leading-none">{data.nextEvent.day}</span>
                <span className="text-[10px] uppercase tracking-wider leading-none mt-0.5">
                  {data.nextEvent.month}
                </span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{data.nextEvent.title}</p>
                <p className="text-[12px] sm:text-[14px] font-normal text-[#6B7280]">
                  {data.nextEvent.time} · {data.nextEvent.location}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 text-[14px] text-[#6B7280] bg-[#F5F8F7] rounded-[12px] text-center">
              No upcoming events scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}