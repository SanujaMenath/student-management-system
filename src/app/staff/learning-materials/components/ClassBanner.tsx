import { ShieldCheck, ChevronDown } from 'lucide-react';
import type { AssignedClass } from '@/actions/learning-materials';

interface ClassBannerProps {
  assignedClasses: AssignedClass[];
  activeClassId: number | null;
  onClassChange: (classId: number) => void;
  staffName?: string | null;
}

export function ClassBanner({
  assignedClasses,
  activeClassId,
  onClassChange,
  staffName,
}: ClassBannerProps) {
  const currentClass =
    assignedClasses.find((c) => c.id === activeClassId) || assignedClasses[0];

  if (!currentClass) return null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#D0E2ED] bg-[#EAF4FA] p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D6E9F5] text-[#195477]">
          <ShieldCheck className="h-6 w-6 text-[#24628A]" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-[#195477]">
              {currentClass.name}
            </h2>
            <span className="rounded-full bg-[#D6E9F5] px-2.5 py-0.5 text-[11px] font-semibold text-[#195477]">
              Assigned Class
            </span>
          </div>

          <p className="mt-1 text-xs text-[#24628A]">
            {staffName ? `Educator: ${staffName} • ` : ''}Room{' '}
            {currentClass.room_number || '—'} • Age{' '}
            {currentClass.age_group || 'Preschool'} • Schedule:{' '}
            {currentClass.schedule || 'Regular'}
          </p>
        </div>
      </div>

      {assignedClasses.length > 1 && (
        <div className="relative w-full sm:w-auto shrink-0">
          <label htmlFor="class-selector" className="sr-only">
            Switch Assigned Class
          </label>
          <div className="relative">
            <select
              id="class-selector"
              value={activeClassId ?? ''}
              onChange={(e) => onClassChange(Number(e.target.value))}
              aria-label="Switch assigned class"
              className="h-11 w-full sm:w-auto appearance-none rounded-xl border border-[#B5D5E8] bg-white py-2 pl-3.5 pr-10 text-xs font-semibold text-[#195477] shadow-xs outline-hidden transition hover:border-[#24628A] focus:border-[#24628A] focus-visible:ring-2 focus-visible:ring-[#24628A]/30"
            >
              {assignedClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#24628A]" />
          </div>
        </div>
      )}
    </div>
  );
}
