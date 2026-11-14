'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  Pin, 
  ChevronRight,
  X 
} from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Event reminder' | 'Academic' | 'Finance' | 'General';
  content: string;
  targetClass: string;
  date: string;
  isImportant: boolean;
}

const mockAnnouncements: AnnouncementItem[] = [
  {
    id: 'ANN-001',
    title: "Little Artists' Day — Materials Checklist",
    category: 'Event reminder',
    content:
      "Dear Parents, please ensure your child brings an apron and a labeled water bottle for Little Artists' Day this Saturday at 9:00 AM in the Activity Hall. All art supplies will be provided by the institute.",
    targetClass: 'Bright Beginners',
    date: 'Yesterday',
    isImportant: true,
  },
  {
    id: 'ANN-002',
    title: 'Term 1 Fee Payment Reminder',
    category: 'Finance',
    content:
      'Kindly note that Term 1 fee balances are due on or before 28 March. You can view your remaining balance and upload bank transfer slips directly under the Fees & payments tab.',
    targetClass: 'All Classes',
    date: '15 Mar 2025',
    isImportant: false,
  },
  {
    id: 'ANN-003',
    title: 'New Tracing Worksheets (Letters A–D)',
    category: 'Academic',
    content:
      'New printable and interactive tracing worksheets for English Letters A–D have been added to the Learning Management section for Bright Beginners.',
    targetClass: 'Bright Beginners',
    date: '12 Mar 2025',
    isImportant: false,
  },
];

function getCategoryBadge(category: AnnouncementItem['category']) {
  switch (category) {
    case 'Event reminder':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
    case 'Finance':
      return 'bg-amber-50 text-amber-900 border-amber-200/80';
    case 'Academic':
      return 'bg-sky-50 text-sky-800 border-sky-200/70';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default function ParentAnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  const filteredAnnouncements = useMemo(() => {
    return mockAnnouncements.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 text-slate-900 pb-10">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          PARENT PORTAL
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Announcements
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Stay updated with notices, class updates, and reminders from Handahamy.
        </p>
      </div>

      {/* Search & Category Pills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-transparent focus:border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#072B20]/10 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Event reminder', 'Academic', 'Finance'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#072B20] text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Card List */}
      <div className="space-y-3.5">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-xs text-slate-400">
            No announcements match your search or filter.
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedAnnouncement(item)}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-[#072B20]/30 hover:shadow-sm transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.isImportant && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#072B20] text-white">
                      <Pin className="w-2.5 h-2.5" />
                      Pinned
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadge(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#072B20] transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {item.targetClass}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#072B20]">
                  Read
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Announcement Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#072B20]/40 backdrop-blur-xs"
            onClick={() => setSelectedAnnouncement(null)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getCategoryBadge(
                    selectedAnnouncement.category
                  )}`}
                >
                  {selectedAnnouncement.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedAnnouncement.title}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Posted {selectedAnnouncement.date} • Audience: {selectedAnnouncement.targetClass}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 bg-[#072B20] hover:bg-[#0B3528] text-white text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}