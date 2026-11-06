'use client';

import { useState, useTransition } from 'react';
import { UserPlus, X } from 'lucide-react';
import { createStudent, StudentRecord } from '@/actions/students';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: { id: number; name: string }[];
  onStudentAdded: (newStudent: StudentRecord) => void;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  classes,
  onStudentAdded,
}: AddStudentModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

      if (res?.student) {
        const selectedClassId = formData.get('class_id');
        const assignedClass = classes.find(
          (c) => String(c.id) === String(selectedClassId)
        );
        const parentName = (formData.get('parent_name') as string) || null;
        const emergencyContact = (formData.get('emergency_contact') as string) || null;

        onStudentAdded({
          ...res.student,
          classes: assignedClass ? { name: assignedClass.name } : null,
          parent: parentName ? { full_name: parentName, phone: emergencyContact } : null,
        });

        onClose();
        form.reset();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center text-slate-900 justify-center bg-black/40 backdrop-blur-xs p-4">
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
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {/* First Name & Last Name */}
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

          {/* Parent Name & Emergency Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                name="parent_name"
                required
                placeholder="e.g. Kasun Silva"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Emergency Contact No *
              </label>
              <input
                type="text"
                name="emergency_contact"
                required
                placeholder="+94 77 123 4567"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
              />
            </div>
          </div>

          {/* Class & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Assign Class
              </label>
              <select
                name="class_id"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue="Active"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
              >
                <option value="Active">Active</option>
                <option value="Needs attention">Needs attention</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Date of Birth & Gender */}
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
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
  );
}