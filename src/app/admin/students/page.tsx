'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  X,
  UserPlus,
} from 'lucide-react';
import { createStudent } from '@/actions/students';

interface StudentItem {
  id: string;
  studentId: string;
  name: string;
  class: string;
  parent: string;
  attendance: string;
  status: 'Active' | 'Needs attention' | 'Inactive';
}

const initialMockStudents: StudentItem[] = [
  {
    id: '1',
    studentId: 'HDM-0241',
    name: 'Aarav Perera',
    class: 'Bright Beginners',
    parent: 'Anjali Perera',
    attendance: '94%',
    status: 'Active',
  },
  {
    id: '2',
    studentId: 'HDM-0238',
    name: 'Nethmi Silva',
    class: 'Little Explorers',
    parent: 'Kasun Silva',
    attendance: '91%',
    status: 'Active',
  },
  {
    id: '3',
    studentId: 'HDM-0219',
    name: 'Isuri Fernando',
    class: 'School Ready',
    parent: 'M. Fernando',
    attendance: '87%',
    status: 'Needs attention',
  },
  {
    id: '4',
    studentId: 'HDM-0207',
    name: 'Danuja Sen',
    class: 'Bright Beginners',
    parent: 'K. Sen',
    attendance: '96%',
    status: 'Active',
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>(initialMockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' || student.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, selectedStatus]);

  // Handle student creation
  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createStudent(formData);
      if (res?.error) {
        setFormError(res.error);
        return;
      }

      const firstName = formData.get('first_name') as string;
      const lastName = formData.get('last_name') as string;
      const newEntry: StudentItem = {
        id: String(Date.now()),
        studentId: res.student?.admission_number || `HDM-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${firstName} ${lastName}`,
        class: 'Bright Beginners',
        parent: (formData.get('emergency_contact') as string) || 'Parent Contact',
        attendance: '100%',
        status: 'Active',
      };

      setStudents((prev) => [newEntry, ...prev]);
      setIsModalOpen(false);
      form.reset();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            TUESDAY, 18 MARCH 2025
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Good morning, Nadeesha
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Here&apos;s what is happening across Handahamy today.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold shadow-sm transition"
        >
          Quick action
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add Student Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Students
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student profiles, guardians, attendance and learning progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold shadow-sm transition"
        >
          Add student
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/*  Main Student Data Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200/90 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Select */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Needs attention">Needs attention</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter Button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Filters
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-5">STUDENT ID</th>
                <th className="py-3 px-5">STUDENT NAME</th>
                <th className="py-3 px-5">CLASS</th>
                <th className="py-3 px-5">PARENT / GUARDIAN</th>
                <th className="py-3 px-5">ATTENDANCE</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students match your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 text-slate-500 font-medium text-[11px]">
                      {s.studentId}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {s.class}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {s.parent}
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">
                      {s.attendance}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : s.status === 'Needs attention'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/admin/students/${s.id}`}
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

        {/* Table Pagination Footer */}
        <div className="py-3.5 px-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredStudents.length} records</span>
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

      {/* Administrative Access Active Alert */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#EBF3F5]/80 border border-slate-200/60">
        <div className="text-[#0C4A35] shrink-0">
          <ShieldCheck className="w-5 h-5 text-sky-800" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            Administrative access active
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Changes to students are recorded in the system audit log.
          </p>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0C4A35] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Register New Student
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    placeholder="e.g. Aarav"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    placeholder="e.g. Perera"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Parent / Emergency Contact *
                </label>
                <input
                  type="text"
                  name="emergency_contact"
                  required
                  placeholder="Parent Name / +94 77 123 4567"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Allergies / Medical
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    placeholder="None or list items"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                  >
                    <option value="Active">Active</option>
                    <option value="Needs attention">Needs attention</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white transition disabled:opacity-60"
                >
                  {isPending ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}