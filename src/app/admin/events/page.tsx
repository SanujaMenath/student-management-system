'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronDown, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  Filter,
  X
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

export default function AdminEventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filter logic
  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const q = searchQuery.toLowerCase().trim();
      
      const matchesSearch = 
        q === '' ||
        event.name.toLowerCase().includes(q) ||
        event.id.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.status.toLowerCase().includes(q);

      const matchesStatus = 
        selectedStatus === 'All' || event.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus]);

  return (
    <div className="space-y-6 text-slate-900 pb-10">
      {/* Header Greeting & Context */}
      <div>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          ADMINISTRATOR CONSOLE
        </p>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Good morning, Nadeesha
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Here&apos;s what is happening across Handahamy today.
        </p>
      </div>

      {/* Page Title & Create Event Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Events
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan events, manage participants and notify parents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold shadow-sm transition"
        >
          Create event
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Event Data Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200/90 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20"
              >
                <option value="All">All statuses</option>
                <option value="Parents notified">Parents notified</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Planning">Planning</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Filters
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-5">EVENT ID</th>
                <th className="py-3 px-5">EVENT</th>
                <th className="py-3 px-5">DATE</th>
                <th className="py-3 px-5">TIME</th>
                <th className="py-3 px-5">LOCATION</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No events currently found. Click &quot;Create event&quot; to register your first record.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 text-slate-500 font-medium text-[11px]">
                      {evt.id}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {evt.name}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {evt.date}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {evt.time}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {evt.location}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          evt.status === 'Parents notified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : evt.status === 'Scheduled' || evt.status === 'Planning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/admin/events/${evt.id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#0C4A35] hover:opacity-80 transition"
                      >
                        View
                        <span className="text-[10px]">&gt;</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3.5 px-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredEvents.length} records</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-[11px]"
              disabled
            >
              Previous
            </button>
            <button
              type="button"
              className="w-6 h-6 rounded-lg bg-[#0C4A35] text-white font-semibold text-[11px] flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-[11px] flex items-center justify-center"
            >
              2
            </button>
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Audit Alert */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#EBF3F5]/80 border border-slate-200/60">
        <div className="text-[#0C4A35] shrink-0">
          <ShieldCheck className="w-5 h-5 text-sky-800" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            Administrative access active
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Changes to events are recorded in the system audit log.
          </p>
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-[#072B20]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#0C4A35] mb-1">
                ADMIN PORTAL
              </p>
              <h3 className="text-2xl font-bold text-slate-900">Create event</h3>
              <p className="text-xs text-slate-500 mt-1">Complete the details below to continue.</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Event name</label>
                <input 
                  type="text" 
                  placeholder="Event name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Start time</label>
                  <div className="relative">
                    <input 
                      type="time" 
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 transition-all [&::-webkit-calendar-picker-indicator]:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Location</label>
                <input 
                  type="text" 
                  placeholder="Event location"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-[#0C4A35] focus:ring-[#0C4A35] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    Notify parents after saving
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0C4A35] rounded-xl hover:bg-[#072B20] shadow-sm transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}