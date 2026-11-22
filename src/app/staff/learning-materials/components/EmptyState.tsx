import { FolderOpen, SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onResetFilters?: () => void;
}

export function EmptyState({ isFiltered, onResetFilters }: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-800">
          No matching learning materials
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          No materials match your current search or filter criteria. Try adjusting your query or resetting the filters.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF4FA] text-[#195477]">
        <FolderOpen className="h-8 w-8 text-[#24628A]" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-800">
        No learning materials uploaded yet
      </h3>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
        There are currently no worksheets, handouts, or multimedia resources uploaded for this classroom. Once uploaded, materials will appear here.
      </p>
    </div>
  );
}

