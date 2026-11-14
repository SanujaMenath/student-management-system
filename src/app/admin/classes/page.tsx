'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { DoorOpen, GraduationCap, Plus, Search, UserRound, Users, X, Clock } from 'lucide-react';
import { createClass, getClassOverview, getTeacherOptions, updateClass } from '@/actions/classes';

interface ClassItem {
  id: number;
  name: string;
  ageGroup: string;
  room: string;
  teacher: string;
  teacherId: string | null;
  enrolled: number;
  capacity: number;
  schedule: string;
  color: string;
}

const palette = ['bg-[#0C4A35]', 'bg-[#D28A20]', 'bg-[#4E7D9A]', 'bg-[#7D4E9A]', 'bg-[#A03C3C]'];

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const rows = await getClassOverview();
    setClasses(
      rows.map((c, i) => ({
        id: c.id,
        name: c.name,
        ageGroup: c.age_group ?? '—',
        room: c.room_number ?? '—',
        teacher: c.teacher?.full_name ?? 'Unassigned',
        teacherId: c.teacher_id,
        enrolled: c.students?.[0]?.count ?? 0,
        capacity: c.capacity,
        schedule: c.schedule ?? '—',
        color: palette[i % palette.length],
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    getTeacherOptions().then(setTeachers);
  }, []);

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

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (c: ClassItem) => {
    setEditing(c);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing ? await updateClass(editing.id, fd) : await createClass(fd);
      if (res?.error) {
        setFormError(res.error);
        return;
      }
      setShowModal(false);
      await load();
    });
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
          onClick={openCreate}
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
          { label: 'Seats available', value: Math.max(totalCapacity - totalEnrolled, 0), icon: Users },
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
      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-xs text-slate-500">
          Loading classes...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
          {classes.length === 0 ? 'No classes yet. Click "Add class" to create one.' : 'No classes match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const pct = c.capacity > 0 ? Math.min(100, Math.round((c.enrolled / c.capacity) * 100)) : 0;
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
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="flex-1 rounded-xl bg-[#E5EEE9] py-2 text-xs font-semibold text-[#14533E] transition hover:bg-[#d6e5dd]"
                  >
                    Edit
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing ? 'Edit class' : 'Add new class'}</h3>
              <button type="button" aria-label="Close" onClick={() => setShowModal(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form key={editing?.id ?? 'new'} onSubmit={handleSubmit} className="space-y-3.5">
              {[
                { name: 'name', label: 'Class name', placeholder: 'e.g. Bright Beginners', required: true, value: editing?.name },
                { name: 'ageGroup', label: 'Age group', placeholder: 'e.g. 3 – 4 years', required: true, value: editing?.ageGroup },
                { name: 'room', label: 'Room', placeholder: 'e.g. Room 05', required: true, value: editing?.room },
                { name: 'schedule', label: 'Schedule', placeholder: '8:00 AM – 12:00 PM', required: false, value: editing?.schedule },
              ].map((f) => (
                <div key={f.name}>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">{f.label}</label>
                  <input
                    name={f.name}
                    required={f.required}
                    placeholder={f.placeholder}
                    defaultValue={f.value && f.value !== '—' ? f.value : ''}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14533E]"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Class teacher</label>
                <select
                  name="teacherId"
                  defaultValue={editing?.teacherId ?? ''}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14533E]"
                >
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min={1}
                  defaultValue={editing?.capacity ?? 20}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14533E]"
                />
              </div>

              {formError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">{formError}</p>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-[#14533E] py-2.5 text-xs font-semibold text-white hover:bg-[#0e3b2e] disabled:opacity-60"
                >
                  {isPending ? 'Saving...' : editing ? 'Save changes' : 'Save class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}