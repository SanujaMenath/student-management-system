import { useEffect } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import type { LearningMaterialItem } from '@/types/learning-materials';

interface DeleteMaterialModalProps {
  isOpen: boolean;
  material: LearningMaterialItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void> | void;
}

export function DeleteMaterialModal({
  isOpen,
  material,
  isDeleting,
  onClose,
  onConfirmDelete,
}: DeleteMaterialModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !material) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>

        <h3 id="delete-dialog-title" className="mt-4 text-base font-bold text-slate-900">
          Delete Learning Material?
        </h3>

        <p id="delete-dialog-desc" className="mt-2 text-xs leading-relaxed text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">
            &ldquo;{material.title}&rdquo;
          </span>
          ? This will permanently remove the file from secure storage and revoke access for parents and enrolled students.
        </p>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>This action is permanent and cannot be undone.</span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirmDelete}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Material</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

