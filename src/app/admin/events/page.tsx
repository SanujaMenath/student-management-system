import Link from 'next/link';
import { 
  Search, 
  ChevronDown, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  SlidersHorizontal 
} from 'lucide-react';

interface EventItem {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: 'Parents notified' | 'Scheduled' | 'Draft' | 'Planning';
}

const mockEvents: EventItem[] = [
  {
    id: 'EVT-032',
    name: "Little Artists' Day",
    date: '22 Mar 2025',
    time: '9:00 AM',
    location: 'Activity hall',
    status: 'Parents notified',
  },
  {
    id: 'EVT-033',
    name: 'Family Sports Morning',
    date: '05 Apr 2025',
    time: '8:30 AM',
    location: 'Community grounds',
    status: 'Scheduled',
  },
  {
    id: 'EVT-034',
    name: 'New Parent Orientation',
    date: '19 Apr 2025',
    time: '10:00 AM',
    location: 'Main classroom',
    status: 'Draft',
  },
  {
    id: 'EVT-035',
    name: 'Vesak Creative Day',
    date: '09 May 2025',
    time: '9:00 AM',
    location: 'Institute grounds',
    status: 'Planning',
  },
];

function getStatusBadge(status: EventItem['status']) {
  switch (status) {
    case 'Parents notified':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
    case 'Scheduled':
      return 'bg-amber-50 text-amber-900 border-amber-200/80';
    case 'Draft':
      return 'bg-stone-100 text-stone-700 border-stone-200';
    case 'Planning':
      return 'bg-amber-50/80 text-amber-900 border-amber-200/70';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default function AdminEventsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Page Title & Create Event CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            Plan events, manage participants and notify parents.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#072B20] hover:bg-[#0B3528] text-white rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <span>Create event</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-transparent focus:border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#072B20]/10 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#072B20]/10 cursor-pointer">
              <option>All statuses</option>
              <option>Parents notified</option>
              <option>Scheduled</option>
              <option>Draft</option>
              <option>Planning</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                <th className="py-3.5 px-6">EVENT ID</th>
                <th className="py-3.5 px-6">EVENT</th>
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">TIME</th>
                <th className="py-3.5 px-6">LOCATION</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {mockEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">{evt.id}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{evt.name}</td>
                  <td className="py-4 px-6 text-slate-600">{evt.date}</td>
                  <td className="py-4 px-6 text-slate-600">{evt.time}</td>
                  <td className="py-4 px-6 text-slate-600">{evt.location}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadge(
                        evt.status
                      )}`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/events/${evt.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#072B20] hover:text-[#124A3A] transition"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count */}
        <div className="py-3.5 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 4 records</span>
          <div className="flex items-center gap-1.5">
            <button
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition"
              disabled
            >
              Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-[#072B20] text-white rounded-lg font-semibold text-xs">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs transition">
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs transition">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Admin Audit Callout */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-600 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-[#072B20] shrink-0" />
        <span>
          <strong className="text-slate-900 font-semibold">Administrative access active</strong>{' '}
          — Changes to events are recorded in the system audit log.
        </span>
      </div>
    </div>
  );
}