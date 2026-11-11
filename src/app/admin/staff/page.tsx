'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ArrowRight, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export type StaffStatus = 'Active' | 'On leave' | 'Inactive';

export interface StaffItem {
  id: string;
  name: string;
  role: string;
  assignedClass: string;
  contact: string;
  status: StaffStatus;
}

const initialStaff: StaffItem[] = [
  {
    id: 'STF-018',
    name: 'Dilani Fernando',
    role: 'Class Teacher',
    assignedClass: 'Bright Beginners',
    contact: '077 234 5678',
    status: 'Active',
  },
  {
    id: 'STF-014',
    name: 'Madhavi Silva',
    role: 'Class Teacher',
    assignedClass: 'Little Explorers',
    contact: '071 455 8920',
    status: 'Active',
  },
  {
    id: 'STF-011',
    name: 'Sachini Perera',
    role: 'Teaching Assistant',
    assignedClass: 'School Ready',
    contact: '076 381 4421',
    status: 'Active',
  },
  {
    id: 'STF-006',
    name: 'Ruwan Jayasena',
    role: 'Administrator',
    assignedClass: '—',
    contact: '075 229 1840',
    status: 'On leave',
  },
];

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for "Add Staff Member"
  const [formData, setFormData] = useState({
    name: '',
    role: 'Class Teacher',
    assignedClass: '',
    contact: '',
    status: 'Active' as StaffStatus,
  });

  // Filter logic
  const filteredStaff = useMemo(() => {
    return staffList.filter((member) => {
      const q = searchQuery.toLowerCase().trim();
      
      const matchesSearch = 
        q === '' ||
        member.name.toLowerCase().includes(q) ||
        member.id.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.assignedClass.toLowerCase().includes(q) ||
        member.contact.includes(q);

      const matchesStatus = 
        selectedStatus === 'All' || member.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [staffList, searchQuery, selectedStatus]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;

    const newId = `STF-0${19 + staffList.length}`;
    const newMember: StaffItem = {
      id: newId,
      name: formData.name,
      role: formData.role,
      assignedClass: formData.assignedClass.trim() || '—',
      contact: formData.contact,
      status: formData.status,
    };

    setStaffList([newMember, ...staffList]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      role: 'Class Teacher',
      assignedClass: '',
      contact: '',
      status: 'Active',
    });
  };

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

      {/* Page Title & Add Staff Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Staff
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage staff profiles, roles, class assignments and schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold shadow-sm transition"
        >
          Add staff member
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Staff Data Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff..."
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
                <option value="On leave">On leave</option>
                <option value="Inactive">Inactive</option>
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

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-5">STAFF ID</th>
                <th className="py-3 px-5">STAFF MEMBER</th>
                <th className="py-3 px-5">ROLE</th>
                <th className="py-3 px-5">ASSIGNED CLASS</th>
                <th className="py-3 px-5">CONTACT</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No staff members currently found. Click &quot;Add staff member&quot; to register a new record.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 text-slate-500 font-medium text-[11px]">
                      {member.id}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {member.name}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {member.role}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {member.assignedClass}
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">
                      {member.contact}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          member.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : member.status === 'On leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/admin/staff/${member.id}`}
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
          <span>Showing {filteredStaff.length} records</span>
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
            Changes to staff are recorded in the system audit log.
          </p>
        </div>
      </div>

      {/* Add Staff Modal */}
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
              <h3 className="text-2xl font-bold text-slate-900">Add Staff Member</h3>
              <p className="text-xs text-slate-500 mt-1">Complete the details below to continue.</p>
            </div>

            <form onSubmit={handleAddStaff} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dilani Fernando"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 transition-all"
                  >
                    <option value="Class Teacher">Class Teacher</option>
                    <option value="Teaching Assistant">Teaching Assistant</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Assigned Class</label>
                  <input
                    type="text"
                    placeholder="e.g. Bright Beginners"
                    value={formData.assignedClass}
                    onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Contact Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 077 234 5678"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35] text-slate-800 transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="On leave">On leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0C4A35] rounded-xl hover:bg-[#072B20] shadow-sm transition-colors"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}