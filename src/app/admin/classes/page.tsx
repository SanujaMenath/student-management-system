'use client';

import { useMemo, useState } from 'react';
import { DoorOpen, GraduationCap, Plus, Search, UserRound, Users, X, Clock } from 'lucide-react';

interface ClassItem {
  id: number;
  name: string;
  ageGroup: string;
  room: string;
  teacher: string;
  enrolled: number;
  capacity: number;
  schedule: string;
  color: string;
}

const initialClasses: ClassItem[] = [
  { id: 1, name: 'Bright Beginners', ageGroup: '3 – 4 years', room: 'Room 01', teacher: 'Ms. Nimali Perera', enrolled: 18, capacity: 20, schedule: '8:00 AM – 12:00 PM', color: 'bg-[#0C4A35]' },
  { id: 2, name: 'Little Explorers', ageGroup: '4 – 5 years', room: 'Room 02', teacher: 'Ms. Kavindi Silva', enrolled: 15, capacity: 20, schedule: '8:00 AM – 12:30 PM', color: 'bg-[#D28A20]' },
  { id: 3, name: 'Curious Minds', ageGroup: '5 – 6 years', room: 'Room 03', teacher: 'Mr. Dilshan Fernando', enrolled: 20, capacity: 20, schedule: '8:00 AM – 1:00 PM', color: 'bg-[#4E7D9A]' },
  { id: 4, name: 'Rising Stars', ageGroup: '6 – 7 years', room: 'Room 04', teacher: 'Ms. Sanduni Jayawardena', enrolled: 9, capacity: 18, schedule: '8:00 AM – 1:30 PM', color: 'bg-[#7D4E9A]' },
];

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
    );
  }, [classes, search]);

  const totalEnrolled = classes.reduce((s, c) => s + c.enrolled, 0);
  const totalCapacity = classes.reduce((s, c) => s + c.capacity, 0);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const palette = ['bg-[#0C4A35]', 'bg-[#D28A20]', 'bg-[#4E7D9A]', 'bg-[#7D4E9A]', 'bg-[#A03C3C]'];
    setClasses((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: String(fd.get('name')),
        ageGroup: String(fd.get('ageGroup')),
        room: String(fd.get('room')),
        teacher: String(fd.get('teacher')),
        enrolled: 0,
        capacity: Number(fd.get('capacity')) || 20,
        schedule: String(fd.get('schedule')) || '8:00 AM – 12:00 PM',
        color: palette[prev.length % palette.length],
      },
    ]);
    setShowModal(false);
  };

  return (
    <div className="space-y-7 text-slate-900">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Classes</h2>
          <p className="mt-1 text-xs text-slate-500">Manage classrooms, teachers and enrolment capacity.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14533E] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0e3b2e]"
        >
          <Plus className="h-4 w-4" />
          Add class
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Active classes', value: classes.length, icon: DoorOpen },
          { label: 'Students enrolled', value: totalEnrolled, icon: GraduationCap },
          { label: 'Seats available', value: totalCapacity - totalEnrolled, icon: Users },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EEE9] text-[#14533E]">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by class, teacher or room..."
          className="w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14533E]/20"
        />
      </div>

      {/* Class cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
          No classes match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const pct = Math.min(100, Math.round((c.enrolled / c.capacity) * 100));
            const full = c.enrolled >= c.capacity;
            return (
              <article
                key={c.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition hover:border-[#B7D2C5] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-1.5 shrink-0 rounded-full ${c.color}`} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold">{c.name}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400">{c.ageGroup}</p>
                  </div>
                  <span className="rounded-full bg-[#E5EEE9] px-2.5 py-1 text-[10px] font-semibold text-[#14533E]">{c.room}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.schedule}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">
                      {c.enrolled} / {c.capacity} students
                    </span>
                    <span className={full ? 'font-semibold text-red-600' : 'text-slate-400'}>{full ? 'Full' : `${pct}%`}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${full ? 'bg-red-500' : 'bg-[#14533E]'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-auto flex gap-2 pt-1">
                  <button type="button" className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                    View students
                  </button>
                  <button type="button" className="flex-1 rounded-xl bg-[#E5EEE9] py-2 text-xs font-semibold text-[#14533E] transition hover:bg-[#d6e5dd]">
                    Edit
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add class modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Add new class</h3>
              <button type="button" aria-label="Close" onClick={() => setShowModal(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3.5">
              {[
                { name: 'name', label: 'Class name', placeholder: 'e.g. Bright Beginners', required: true },
                { name: 'ageGroup', label: 'Age group', placeholder: 'e.g. 3 – 4 years', required: true },
                { name: 'teacher', label: 'Class teacher', placeholder: 'e.g. Ms. Nimali Perera', required: true },
                { name: 'room', label: 'Room', placeholder: 'e.g. Room 05', required: true },
                { name: 'schedule', label: 'Schedule', placeholder: '8:00 AM – 12:00 PM', required: false },
              ].map((f) => (
                <div key={f.name}>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">{f.label}</label>
                  <input
                    name={f.name}
                    required={f.required}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14533E]"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min={1}
                  defaultValue={20}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14533E]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-[#14533E] py-2.5 text-xs font-semibold text-white hover:bg-[#0e3b2e]">
                  Save class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}