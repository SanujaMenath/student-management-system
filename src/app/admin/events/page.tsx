'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronDown, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  SlidersHorizontal,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. Added search state
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Added filter logic
  const filteredEvents = mockEvents.filter((event) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      event.name.toLowerCase().includes(searchLower) ||
      event.id.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.status.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Page Title & Create Event CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
            EVENT MANAGEMENT
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Events
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan events, manage participants and notify parents.
          </p>
        </div>
        
        {/* Changed Link to Button to trigger modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0C4A35] hover:bg-[#072B20] text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <span>Create event</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            // 3. Bound input to state
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-transparent focus:border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/10 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/10 cursor-pointer font-medium">
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
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                <th className="py-4 px-6">EVENT ID</th>
                <th className="py-4 px-6">EVENT</th>
                <th className="py-4 px-6">DATE</th>
                <th className="py-4 px-6">TIME</th>
                <th className="py-4 px-6">LOCATION</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {/* 4. Added empty state handling */}
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No events found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                // 5. Map over filteredEvents instead of mockEvents
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">{evt.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{evt.name}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{evt.date}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{evt.time}</td>
                    <td className="py-4 px-6 text-slate-600">{evt.location}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border ${getStatusBadge(
                          evt.status
                        )}`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/events/${evt.id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#0C4A35] hover:text-[#072B20] transition"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count */}
        <div className="py-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {/* 6. Dynamic record count */}
          <span>Showing {filteredEvents.length} records</span>
          <div className="flex items-center gap-1.5">
            <button
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition font-medium"
              disabled
            >
              Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-[#0C4A35] text-white rounded-lg font-semibold text-xs shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs transition font-medium">
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs transition font-medium">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Audit Alert */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#EBF3F5]/80 border border-slate-200/60">
        <div className="shrink-0 mt-0.5">
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


      {/* =========================================
          CREATE EVENT MODAL
          ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Dark Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-[#072B20]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
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

            {/* Modal Body (Form) */}
            <div className="px-6 py-5 space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Event name</label>
                <input 
                  type="text" 
                  placeholder="Event name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Date & Time Grid */}
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

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Location</label>
                <input 
                  type="text" 
                  placeholder="Event location"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Checkbox */}
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

            {/* Modal Footer */}
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