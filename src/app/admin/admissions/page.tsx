'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, Phone, Mail, Search, XCircle, X } from 'lucide-react';
import { getAdmissions, updateAdmissionStatus, type AdmissionRecord, type AdmissionStatus } from '@/actions/admissions';

type Status = AdmissionStatus;

const statusStyles: Record<Status, string> = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Interview Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-600 border-red-200',
};

const filters: ('All' | Status)[] = ['All', 'Pending Review', 'Interview Scheduled', 'Approved', 'Rejected'];

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | Status>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAdmissions().then((rows) => {
      setApplications(rows);
      setLoading(false);
    });
  }, []);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { 'Pending Review': 0, 'Interview Scheduled': 0, Approved: 0, Rejected: 0 };
    applications.forEach((a) => {
      if (a.status in c) c[a.status] += 1;
    });
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

  const updateStatus = (id: number, status: Status) => {
    const previous = applications;
    setError(null);
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    startTransition(async () => {
      const res = await updateAdmissionStatus(id, status);
      if (res?.error) {
        setApplications(previous);
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6 font-sans text-[#374151]">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-semibold text-[#082F27] tracking-tight">Admissions</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">Review applications and move them through the admission process.</p>
      </div>

      {error && <div className="rounded-[12px] border border-red-200 bg-red-50 p-3 text-[12px] font-medium text-red-600">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Pending review', value: counts['Pending Review'], icon: ClipboardList, tone: 'bg-amber-50 text-amber-600' },
          { label: 'Interviews', value: counts['Interview Scheduled'], icon: CalendarClock, tone: 'bg-blue-50 text-blue-600' },
          { label: 'Approved', value: counts.Approved, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
          { label: 'Rejected', value: counts.Rejected, icon: XCircle, tone: 'bg-red-50 text-red-600' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-[16px] border border-[#D8E4DF] bg-white p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#111827]">{s.value}</div>
              <p className="text-[12px] font-medium text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-[12px] px-4 py-2 text-[14px] font-semibold transition-colors ${
                filter === f
                  ? 'bg-[#187055] text-white'
                  : 'bg-white border border-[#B8D3C8] text-[#082F27] hover:bg-[#F5F8F7]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search child, parent or program..."
            className="w-full rounded-[12px] border border-[#D8E4DF] bg-white py-2.5 pl-11 pr-4 text-[14px] text-[#374151] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#187055]/20 focus:border-[#187055]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[16px] border border-[#D8E4DF] bg-white">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F5F8F7]/60 text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">
              <th className="px-5 py-3.5">Child</th>
              <th className="px-5 py-3.5">Program</th>
              <th className="px-5 py-3.5">Parent</th>
              <th className="px-5 py-3.5">Applied</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#6B7280]">
                  Loading applications...
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[#6B7280]">
                  No applications found.
                </td>
              </tr>
            ) : (
              visible.map((a) => (
                <tr key={a.id} className="hover:bg-[#F5F8F7]/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[#111827]">{a.child_name}</div>
                    <div className="text-[12px] font-medium text-[#6B7280]">DOB {fmt(a.date_of_birth)}</div>
                  </td>
                  <td className="px-5 py-4 text-[#374151]">{a.program}</td>
                  <td className="px-5 py-4">
                    <div className="text-[#111827] font-medium">{a.parent_name}</div>
                    <div className="text-[12px] text-[#6B7280]">{a.parent_phone}</div>
                  </td>
                  <td className="px-5 py-4 text-[#374151]">{fmt(a.created_at)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${statusStyles[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className="rounded-[12px] bg-white border border-[#B8D3C8] px-3.5 py-1.5 text-[14px] font-semibold text-[#082F27] hover:bg-[#F5F8F7] transition-colors"
                    >
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
        <div className="fixed inset-0 z-50 flex justify-end bg-[#082F27]/60 backdrop-blur-sm">
          <aside className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-[#111827]">{selected.child_name}</h3>
                <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${statusStyles[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
              <button type="button" aria-label="Close" onClick={() => setSelectedId(null)} className="rounded-[12px] p-2 bg-[#F5F8F7] text-[#082F27] hover:bg-[#E8F0EC] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto text-[14px]">
              <section>
                <h4 className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">Child</h4>
                <div className="space-y-2 rounded-[16px] border border-[#D8E4DF] bg-[#F5F8F7] p-5">
                  <div className="flex justify-between"><span className="text-[#6B7280]">Date of birth</span><span className="font-semibold text-[#111827]">{fmt(selected.date_of_birth)}</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7280]">Program</span><span className="font-semibold text-[#111827]">{selected.program}</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7280]">Applied on</span><span className="font-semibold text-[#111827]">{fmt(selected.created_at)}</span></div>
                </div>
              </section>
              <section>
                <h4 className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">Parent / guardian</h4>
                <div className="space-y-2.5 rounded-[16px] border border-[#D8E4DF] bg-[#F5F8F7] p-5">
                  <div className="font-semibold text-[#111827]">{selected.parent_name}</div>
                  <div className="flex items-center gap-2 text-[#374151]"><Phone className="h-4 w-4 text-[#6B7280]" />{selected.parent_phone}</div>
                  <div className="flex items-center gap-2 text-[#374151]"><Mail className="h-4 w-4 text-[#6B7280]" />{selected.parent_email ?? 'Not provided'}</div>
                </div>
              </section>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 border-t border-[#E5E7EB] pt-5 sm:grid-cols-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => updateStatus(selected.id, 'Interview Scheduled')}
                className="rounded-[12px] bg-white border border-[#B8D3C8] text-[#082F27] hover:bg-[#F5F8F7] py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-60"
              >
                Schedule interview
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => updateStatus(selected.id, 'Approved')}
                className="rounded-[12px] bg-[#187055] hover:bg-[#145C46] text-white py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => updateStatus(selected.id, 'Rejected')}
                className="rounded-[12px] border border-red-200 bg-red-50 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}