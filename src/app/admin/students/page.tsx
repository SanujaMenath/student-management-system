'use client';

import { useState, useEffect, useMemo } from 'react';
import AddStudentModal from '@/components/admin/AddStudentModal';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getStudents,
  getClasses,
  StudentRecord,
} from '@/actions/students';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real Supabase data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [studentData, classData] = await Promise.all([
          getStudents(),
          getClasses(),
        ]);
        setStudents(studentData || []);
        setClasses(classData || []);
      } catch (err) {
        console.error('Failed to load students data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    return students.filter((s) => {
      const firstName = s.first_name || '';
      const lastName = s.last_name || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const admissionNum = (s.admission_number || '').toLowerCase();
      const className = (s.classes?.name || '').toLowerCase();
      const contact = (s.emergency_contact || '').toLowerCase();
      const parentName = (s.parent?.full_name || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === '' ||
        fullName.includes(q) ||
        admissionNum.includes(q) ||
        className.includes(q) ||
        contact.includes(q) ||
        parentName.includes(q);

      const matchesStatus =
        selectedStatus === 'All' || s.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, selectedStatus]);

  return (
    <div className="space-y-6 text-slate-900">
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

      {/* Page Title & Add Student Action */}
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

      {/* Main Student Data Table Card */}
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
                <option value="Graduated">Graduated</option>
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

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-5">STUDENT ID</th>
                <th className="py-3 px-5">STUDENT NAME</th>
                <th className="py-3 px-5">CLASS</th>
                <th className="py-3 px-5">PARENT / GUARDIAN</th>
                <th className="py-3 px-5">EMERGENCY CONTACT</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No students currently found. Click &quot;Add student&quot; to register your first record.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 text-slate-500 font-medium text-[11px]">
                      {s.admission_number}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {s.classes?.name || 'Unassigned'}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {s.parent?.full_name || 'Guardian'}
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">
                      {s.emergency_contact}
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

        {/* Pagination Footer */}
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
            Changes to students are recorded in the system audit log.
          </p>
        </div>
      </div>

      {/* Modal Component */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classes={classes}
        onStudentAdded={(newStudent) =>
          setStudents((prev) => [newStudent, ...prev])
        }
      />
    </div>
  );
}