import { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Video,
  Image as ImageIcon,
  File as FileIcon,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  uploadLearningMaterial,
  type AssignedClass,
} from '@/actions/learning-materials';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedClasses: AssignedClass[];
  activeClassId: number | null;
  onUploadSuccess: (targetClassId: number) => Promise<void> | void;
}

const CURRICULUM_SUBJECTS = [
  'English',
  'Mathematics',
  'Environmental Studies',
  'General Knowledge',
  'Art and Craft',
];

const SUPPORTED_EXTENSIONS = [
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'mp4',
  'webm',
  'mov',
  'avi',
  'mkv',
  'doc',
  'docx',
  'txt',
  'rtf',
  'odt',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') {
    return <FileText className="h-6 w-6 text-red-600" />;
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return <ImageIcon className="h-6 w-6 text-emerald-600" />;
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
    return <Video className="h-6 w-6 text-purple-600" />;
  }
  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx', 'xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileText className="h-6 w-6 text-blue-600" />;
  }
  return <FileIcon className="h-6 w-6 text-slate-500" />;
}

export function UploadMaterialModal({
  isOpen,
  onClose,
  assignedClasses,
  activeClassId,
  onUploadSuccess,
}: UploadMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(CURRICULUM_SUBJECTS[0]);
  const [targetClassId, setTargetClassId] = useState<number | ''>(
    activeClassId ?? (assignedClasses[0]?.id ?? '')
  );
  const [file, setFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject(CURRICULUM_SUBJECTS[0]);
    setFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (candidate: File): string | null => {
    if (candidate.size <= 0) {
      return 'The selected file is empty. Please select a valid file.';
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      return 'The file size exceeds the 25 MB limit.';
    }
    const ext = candidate.name.split('.').pop()?.toLowerCase() || '';
    if (!ext || !SUPPORTED_EXTENSIONS.includes(ext)) {
      return 'Unsupported file format. Please upload a PDF, Document, Image, or Video file.';
    }
    return null;
  };

  const handleFileSelected = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setFile(selectedFile);
    setErrorMessage(null);

    if (!title.trim()) {
      const rawName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const cleanName = rawName.replace(/[_-]+/g, ' ').trim();
      if (cleanName) {
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim()) {
      setErrorMessage('Please provide a title for the learning material.');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Please select a curriculum subject.');
      return;
    }
    if (!targetClassId) {
      setErrorMessage('Please select an assigned class.');
      return;
    }
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    const fileError = validateFile(file);
    if (fileError) {
      setErrorMessage(fileError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title.trim());
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    formData.append('subject', subject.trim());
    formData.append('classId', targetClassId.toString());
    formData.append('file', file);

    try {
      const res = await uploadLearningMaterial(formData);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to upload learning material.');
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        resetForm();
        await onUploadSuccess(Number(targetClassId));
        onClose();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred during upload.'
      );
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 id="upload-modal-title" className="text-lg font-bold text-slate-900">
              Upload Learning Material
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add handouts, worksheets, or media for your assigned class.
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close upload modal"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resource File <span className="text-red-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              className="hidden"
              id="file-upload-input"
            />

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  isDragging
                    ? 'border-[#187055] bg-[#E7F3EE]/50'
                    : 'border-slate-300 bg-slate-50/50 hover:border-[#187055] hover:bg-slate-50'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-[#187055]">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-700">
                  <span className="text-[#187055] underline">Click to browse</span> or drag and drop your file here
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  PDF, Word, Excel, PowerPoint, Images, or Video (up to 25 MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="truncate">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-40"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    aria-label="Remove selected file"
                    className="rounded-lg p-1 text-slate-400 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="material-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Material Title <span className="text-red-500">*</span>
            </label>
            <input
              id="material-title"
              type="text"
              value={title}
              disabled={isSubmitting}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Letter Tracing Practice Worksheet"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#187055] focus:ring-2 focus:ring-[#187055]/15 disabled:bg-slate-100"
            />
          </div>

          {/* Subject and Target Class */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="material-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="material-subject"
                value={subject}
                disabled={isSubmitting}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-hidden focus:border-[#187055] focus:ring-2 focus:ring-[#187055]/15 disabled:bg-slate-100"
              >
                {CURRICULUM_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="material-class" className="block text-xs font-semibold text-slate-700 mb-1">
                Target Class <span className="text-red-500">*</span>
              </label>
              <select
                id="material-class"
                value={targetClassId}
                disabled={isSubmitting || assignedClasses.length <= 1}
                onChange={(e) => setTargetClassId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-hidden focus:border-[#187055] focus:ring-2 focus:ring-[#187055]/15 disabled:bg-slate-100"
              >
                {assignedClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="material-description" className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
            </label>
            <textarea
              id="material-description"
              rows={2}
              value={description}
              disabled={isSubmitting}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add brief instructions, homework notes, or activities for parents and students..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#187055] focus:ring-2 focus:ring-[#187055]/15 disabled:bg-slate-100 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#187055] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#145C46] disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Material</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
