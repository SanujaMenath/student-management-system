'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, Phone, Mail, Search, XCircle, X } from 'lucide-react';

type Status = 'Pending Review' | 'Interview Scheduled' | 'Approved' | 'Rejected';

interface Application {
  id: number;
  child_name: string;
  date_of_birth: string;
  program: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  status: Status;
  created_at: string;
}

const initialApplications: Application[] = [
  { id: 1, child_name: 'Amaya Wijesinghe', date_of_birth: '2022-03-14', program: 'Bright Beginners', parent_name: 'Sanjaya Wijesinghe', parent_phone: '+94 71 987 6543', parent_email: 'sanjaya@example.com', status: 'Pending Review', created_at: '2026-11-05' },
  { id: 2, child_name: 'Rehan Perera', date_of_birth: '2021-08-02', program: 'Little Explorers', parent_name: 'Nadeesha Perera', parent_phone: '+94 77 456 1122', parent_email: null, status: 'Pending Review', created_at: '2026-11-04' },
  { id: 3, child_name: 'Thisuri Fernando', date_of_birth: '2020-12-21', program: 'Curious Minds', parent_name: 'Kamal Fernando', parent_phone: '+94 76 332 9087', parent_email: 'kamal.f@example.com', status: 'Interview Scheduled', created_at: '2026-11-02' },
  { id: 4, child_name: 'Dineth Silva', date_of_birth: '2022-05-30', program: 'Bright Beginners', parent_name: 'Iresha Silva', parent_phone: '+94 70 221 8844', parent_email: 'iresha@example.com', status: 'Approved', created_at: '2026-10-28' },
  { id: 5, child_name: 'Oshadi Jayasinghe', date_of_birth: '2019-11-11', program: 'Rising Stars', parent_name: 'Mahesh Jayasinghe', parent_phone: '+94 75 889 0012', parent_email: null, status: 'Rejected', created_at: '2026-10-25' },
];

const statusStyles: Record<Status, string> = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Interview Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-600 border-red-200',
};

const filters: ('All' | Status)[] = ['All', 'Pending Review', 'Interview Scheduled', 'Approved', 'Rejected'];

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [filter, setFilter] = useState<'All' | Status>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { 'Pending Review': 0, 'Interview Scheduled': 0, Approved: 0, Rejected: 0 };
    applications.forEach((a) => (c[a.status] += 1));
    return c;
  }, [applications]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      const matchesStatus = filter === 'All' || a.status === filter;
      const matchesSearch =
        !q || a.child_name.toLowerCase().includes(q) || a.parent_name.toLowerCase().includes(q) || a.program.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [applications, filter, search]);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const updateStatus = (id: number, status: Status) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  return (
    <div className="space-y-7 text-slate-900">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Admissions</h2>
        <p className="mt-1 text-xs text-slate-500">Review applications and move them through the admission process.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Pending review', value: counts['Pending Review'], icon: ClipboardList, tone: 'bg-amber-50 text-amber-600' },
          { label: 'Interviews', value: counts['Interview Scheduled'], icon: CalendarClock, tone: 'bg-blue-50 text-blue-600' },
          { label: 'Approved', value: counts.Approved, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
          { label: 'Rejected', value: counts.Rejected, icon: XCircle, tone: 'bg-red-50 text-red-600' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{s.value}</div>
              <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === f ? 'bg-[#14533E] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search child, parent or program..."
            className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14533E]/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3.5 font-semibold">Child</th>
              <th className="px-5 py-3.5 font-semibold">Program</th>
              <th className="px-5 py-3.5 font-semibold">Parent</th>
              <th className="px-5 py-3.5 font-semibold">Applied</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No applications found.
                </td>
              </tr>
            ) : (
              visible.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{a.child_name}</div>
                    <div className="text-[11px] text-slate-400">DOB {fmt(a.date_of_birth)}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{a.program}</td>
                  <td className="px-5 py-4">
                    <div className="text-slate-800">{a.parent_name}</div>
                    <div className="text-[11px] text-slate-400">{a.parent_phone}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{fmt(a.created_at)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusStyles[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => setSelectedId(a.id)} className="rounded-lg bg-[#E5EEE9] px-3 py-1.5 text-[11px] font-semibold text-[#14533E] hover:bg-[#d6e5dd]">
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <aside className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{selected.child_name}</h3>
                <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusStyles[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
              <button type="button" aria-label="Close" onClick={() => setSelectedId(null)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto text-xs">
              <section>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Child</h4>
                <div className="space-y-2 rounded-2xl bg-[#F4F6F5] p-4">
                  <div className="flex justify-between"><span className="text-slate-500">Date of birth</span><span className="font-semibold">{fmt(selected.date_of_birth)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Program</span><span className="font-semibold">{selected.program}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Applied on</span><span className="font-semibold">{fmt(selected.created_at)}</span></div>
                </div>
              </section>
              <section>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Parent / guardian</h4>
                <div className="space-y-2.5 rounded-2xl bg-[#F4F6F5] p-4">
                  <div className="font-semibold">{selected.parent_name}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Phone className="h-3.5 w-3.5" />{selected.parent_phone}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Mail className="h-3.5 w-3.5" />{selected.parent_email ?? 'Not provided'}</div>
                </div>
              </section>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <button type="button" onClick={() => updateStatus(selected.id, 'Interview Scheduled')} className="rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                Schedule interview
              </button>
              <button type="button" onClick={() => updateStatus(selected.id, 'Approved')} className="rounded-xl bg-[#14533E] py-2.5 text-xs font-semibold text-white hover:bg-[#0e3b2e]">
                Approve
              </button>
              <button type="button" onClick={() => updateStatus(selected.id, 'Rejected')} className="rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                Reject
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}