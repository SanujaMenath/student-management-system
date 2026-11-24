'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';

type CareerStatus =
  | 'Pending Review'
  | 'In Review'
  | 'Interview Scheduled'
  | 'Approved'
  | 'Rejected';

interface CareerApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  cover_message: string;
  cv_original_name: string | null;
  cv_url: string | null;
  status: CareerStatus;
  created_at: string;
}

const statuses: CareerStatus[] = [
  'Pending Review',
  'In Review',
  'Interview Scheduled',
  'Approved',
  'Rejected',
];

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | CareerStatus>('All');
  const [selected, setSelected] = useState<CareerApplication | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (filter !== 'All') params.set('status', filter);

        const response = await fetch(`/api/careers?${params.toString()}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load applications');
        setApplications(result.applications);
        setTotal(result.pagination?.total ?? 0);
        setTotalPages(result.pagination?.total_pages ?? 1);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load applications');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [debouncedSearch, filter, limit, page, refreshKey]);

  async function updateStatus(id: string, status: CareerStatus) {
    const response = await fetch(`/api/careers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'Unable to update application');
      return;
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status } : application
      )
    );
    setSelected((current) => (current?.id === id ? { ...current, status } : current));
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">Career Applications</h1>
        <p className="mt-1 text-xs text-slate-600">Review submissions and update application status.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['All', ...statuses] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setFilter(item);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === item ? 'bg-[#14533E] text-white' : 'border border-slate-300 bg-white text-slate-800'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search applicant or position"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Applicant</th>
              <th className="px-5 py-3 font-semibold">Position</th>
              <th className="px-5 py-3 font-semibold">Applied</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-600">Loading applications...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-600">No applications found.</td></tr>
            ) : applications.map((application) => (
              <tr key={application.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-950">{application.full_name}</div>
                  <div className="text-slate-600">{application.email}</div>
                </td>
                <td className="px-5 py-4 text-slate-800">{application.position}</td>
                <td className="px-5 py-4 text-slate-700">{new Date(application.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <select
                    value={application.status}
                    onChange={(event) => void updateStatus(application.id, event.target.value as CareerStatus)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
                  >
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(application)}
                    className="rounded-lg bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span>
            {total === 0 ? '0 applications' : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`}
          </span>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page} of {Math.max(1, totalPages)}</span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{selected.full_name}</h2>
                <p className="text-xs text-slate-600">{selected.position}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-slate-700 hover:text-slate-950">Close</button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div><dt className="text-xs font-semibold text-slate-600">Email</dt><dd className="text-slate-900">{selected.email}</dd></div>
              <div><dt className="text-xs font-semibold text-slate-600">Phone</dt><dd className="text-slate-900">{selected.phone}</dd></div>
              <div><dt className="text-xs font-semibold text-slate-600">Cover message</dt><dd className="whitespace-pre-wrap text-slate-900">{selected.cover_message}</dd></div>
            </dl>
            {selected.cv_url && (
              <a
                href={selected.cv_url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#14533E] px-4 py-2.5 text-xs font-bold text-white"
              >
                Open CV <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
