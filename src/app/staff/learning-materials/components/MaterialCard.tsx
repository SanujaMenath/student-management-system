import {
  FileText,
  Video,
  Image as ImageIcon,
  File as FileIcon,
  HardDrive,
  User,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import type {
  LearningMaterialItem,
  LearningMaterialFileType,
} from '@/types/learning-materials';

interface MaterialCardProps {
  material: LearningMaterialItem;
  currentUserId?: string | null;
  isDownloading?: boolean;
  onDownload: (material: LearningMaterialItem) => void;
  onDelete?: (material: LearningMaterialItem) => void;
}

const SUBJECT_THEMES: Record<string, { badge: string; border: string }> = {
  English: {
    badge: 'bg-[#E7F3EE] text-[#0C4A35] border-[#B7D7CA]',
    border: 'border-t-[#0C4A35]',
  },
  Mathematics: {
    badge: 'bg-[#FCF5E9] text-[#B07216] border-[#F2D7A5]',
    border: 'border-t-[#D28A20]',
  },
  'Environmental Studies': {
    badge: 'bg-[#EEF4F8] text-[#36637F] border-[#BED6E5]',
    border: 'border-t-[#4E7D9A]',
  },
  'General Knowledge': {
    badge: 'bg-[#FBEEEE] text-[#8C2C2C] border-[#F2BEBE]',
    border: 'border-t-[#A03C3C]',
  },
  'Art and Craft': {
    badge: 'bg-[#F6EFFB] text-[#643980] border-[#DDBFEA]',
    border: 'border-t-[#7D4E9A]',
  },
};

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function getFileTypeDetails(type: LearningMaterialFileType) {
  switch (type) {
    case 'PDF':
      return {
        Icon: FileText,
        iconClass: 'text-red-600',
        badgeClass: 'bg-red-50 text-red-700 border-red-200/70',
      };
    case 'Video':
      return {
        Icon: Video,
        iconClass: 'text-purple-600',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/70',
      };
    case 'Image':
      return {
        Icon: ImageIcon,
        iconClass: 'text-emerald-600',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      };
    case 'Document':
      return {
        Icon: FileText,
        iconClass: 'text-blue-600',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/70',
      };
    default:
      return {
        Icon: FileIcon,
        iconClass: 'text-slate-500',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/70',
      };
  }
}

export function MaterialCard({
  material,
  currentUserId,
  isDownloading = false,
  onDownload,
  onDelete,
}: MaterialCardProps) {
  const theme =
    SUBJECT_THEMES[material.subject] || {
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      border: 'border-t-slate-400',
    };

  const fileType = getFileTypeDetails(material.file_type);
  const TypeIcon = fileType.Icon;
  const canDelete = Boolean(currentUserId && material.uploaded_by === currentUserId);

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl border border-slate-200/80 border-t-4 ${theme.border} bg-white p-5 shadow-xs transition hover:shadow-md`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${theme.badge}`}
          >
            {material.subject}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${fileType.badgeClass}`}
          >
            <TypeIcon className={`h-3 w-3 ${fileType.iconClass}`} />
            {material.file_type}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3.5 text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#187055] transition-colors">
          {material.title}
        </h3>

        {/* Description */}
        {material.description ? (
          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
            {material.description}
          </p>
        ) : (
          <p className="mt-2 text-xs italic text-slate-400">
            No additional description provided.
          </p>
        )}

        {material.uploader_name && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <User className="h-3 w-3" />
            <span className="truncate">Added by {material.uploader_name}</span>
          </div>
        )}
      </div>

      {/* Metadata & Actions Footer */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <HardDrive className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatFileSize(material.file_size)}</span>
          <span>•</span>
          <span>{formatUploadDate(material.created_at)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(material);
              }}
              title="Delete material"
              aria-label={`Delete ${material.title}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={isDownloading}
            onClick={(e) => {
              e.stopPropagation();
              onDownload(material);
            }}
            title="Download file"
            aria-label={`Download ${material.title}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#EAF4FA] px-2.5 text-xs font-semibold text-[#195477] hover:bg-[#D6E9F5] transition disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#195477]" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
