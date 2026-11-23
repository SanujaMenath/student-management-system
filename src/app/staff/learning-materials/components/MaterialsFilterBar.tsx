import { Search, X, Filter } from 'lucide-react';
import type { LearningMaterialFileType } from '@/types/learning-materials';

interface MaterialsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  selectedFileType: LearningMaterialFileType | 'All';
  onFileTypeChange: (fileType: LearningMaterialFileType | 'All') => void;
  availableSubjects: string[];
  fileTypeCounts: Record<LearningMaterialFileType | 'All', number>;
}

const FILE_TYPE_OPTIONS: (LearningMaterialFileType | 'All')[] = [
  'All',
  'PDF',
  'Document',
  'Video',
  'Image',
  'Other',
];

export function MaterialsFilterBar({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedFileType,
  onFileTypeChange,
  availableSubjects,
  fileTypeCounts,
}: MaterialsFilterBarProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      {/* Search and Subject Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="material-search" className="sr-only">
            Search learning materials
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="material-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search materials by title or description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-xs text-slate-800 placeholder-slate-400 outline-hidden transition focus:border-[#187055] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#187055]/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus-visible:outline-hidden focus-visible:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="relative shrink-0 sm:w-56">
          <label htmlFor="subject-filter" className="sr-only">
            Filter by curriculum subject
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            aria-label="Filter by curriculum subject"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-8 text-xs font-medium text-slate-700 outline-hidden transition focus:border-[#187055] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#187055]/20"
          >
            <option value="All">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* File Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3 pb-0.5 text-xs scrollbar-thin">
        {FILE_TYPE_OPTIONS.map((type) => {
          const isSelected = selectedFileType === type;
          const count = fileTypeCounts[type] || 0;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onFileTypeChange(type)}
              aria-pressed={isSelected}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#187055]/30 ${
                isSelected
                  ? 'bg-[#187055] text-white shadow-xs'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{type}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
