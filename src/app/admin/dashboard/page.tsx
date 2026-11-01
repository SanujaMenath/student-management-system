import { Users, GraduationCap, Clock, DollarSign } from 'lucide-react';

const stats = [
  { title: 'Total Enrolled', value: '142', icon: GraduationCap, change: '+12% this month' },
  { title: 'Active Teachers', value: '18', icon: Users, change: 'Full capacity' },
  { title: 'Pending Admissions', value: '7', icon: Clock, change: 'Action required' },
  { title: 'Fees Collected', value: 'LKR 450,000', icon: DollarSign, change: '84% of target' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-xs text-slate-500 mt-1">
          Welcome back. Here is what is happening at Handahamy today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14533e] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-3">{stat.value}</div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">{stat.change}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}