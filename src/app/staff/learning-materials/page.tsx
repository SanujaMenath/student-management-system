'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';
import {
  getStaffAssignedClasses,
  getStaffLearningMaterials,
  deleteLearningMaterial,
  getMaterialDownloadUrl,
  type AssignedClass,
} from '@/actions/learning-materials';
import type {
  LearningMaterialItem,
  LearningMaterialFileType,
} from '@/types/learning-materials';
import { ClassBanner } from './components/ClassBanner';
import { MaterialsFilterBar } from './components/MaterialsFilterBar';
import { MaterialCard } from './components/MaterialCard';
import { EmptyState } from './components/EmptyState';
import { MaterialsLoadingSkeleton } from './components/MaterialsLoadingSkeleton';
import { StatusAlertBanner } from './components/StatusAlertBanner';
import { UploadMaterialModal } from './components/UploadMaterialModal';
import { DeleteMaterialModal } from './components/DeleteMaterialModal';

const STANDARD_CURRICULUM_SUBJECTS = [
  'English',
  'Mathematics',
  'Environmental Studies',
  'General Knowledge',
  'Art and Craft',
];

export default function StaffLearningMaterialsPage() {
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [activeClassId, setActiveClassId] = useState<number | null>(null);
  const [staffInfo, setStaffInfo] = useState<{
    id: string;
    full_name: string;
    profile_id: string;
  } | null>(null);

  const [materials, setMaterials] = useState<LearningMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'unlinked_staff' | 'no_classes' | 'error' | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Modals and action states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<LearningMaterialItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedFileType, setSelectedFileType] = useState<LearningMaterialFileType | 'All'>('All');

  const loadMaterialsForClass = useCallback(async (classId: number) => {
    setIsClassLoading(true);
    const res = await getStaffLearningMaterials({ classId });
    if (res.success) {
      setMaterials(res.materials);
    } else {
      setErrorMessage(res.error || 'Failed to load learning materials.');
    }
    setIsClassLoading(false);
  }, []);

  const handleUploadSuccess = async (targetClassId: number) => {
    if (targetClassId !== activeClassId) {
      setActiveClassId(targetClassId);
    }
    await loadMaterialsForClass(targetClassId);
    setActionFeedback({
      type: 'success',
      message: 'Learning material uploaded successfully.',
    });
  };

  const handleDownload = async (material: LearningMaterialItem) => {
    if (downloadingId) return;
    setDownloadingId(material.id);
    setActionFeedback(null);

    try {
      const res = await getMaterialDownloadUrl(material.id);
      if (!res.signedUrl || res.error) {
        setActionFeedback({
          type: 'error',
          message: res.error || 'Failed to generate secure download URL. Please try again.',
        });
      } else {
        const link = document.createElement('a');
        link.href = res.signedUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = material.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred during file download.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return;
    setIsDeleting(true);
    setActionFeedback(null);

    try {
      const res = await deleteLearningMaterial(materialToDelete.id);
      if (!res.success) {
        setActionFeedback({
          type: 'error',
          message: res.error || 'Failed to delete learning material.',
        });
      } else {
        if (res.warning) {
          setActionFeedback({
            type: 'warning',
            message: res.warning,
          });
        } else {
          setActionFeedback({
            type: 'success',
            message: `"${materialToDelete.title}" was permanently deleted.`,
          });
        }
        setMaterialToDelete(null);
        if (activeClassId) {
          await loadMaterialsForClass(activeClassId);
        }
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred during deletion.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      const res = await getStaffAssignedClasses();
      if (ignore) return;

      if (!res.success) {
        const err = res.error || 'Failed to load assigned classes.';
        setErrorMessage(err);
        if (
          err.toLowerCase().includes('not yet linked') ||
          err.toLowerCase().includes('staff profile')
        ) {
          setErrorType('unlinked_staff');
        } else {
          setErrorType('error');
        }
        setIsLoading(false);
        return;
      }

      setAssignedClasses(res.classes);
      if (res.staff) {
        setStaffInfo(res.staff);
      }

      if (res.classes.length === 0) {
        setErrorType('no_classes');
        setIsLoading(false);
        return;
      }

      const initialClassId = res.classes[0].id;
      setActiveClassId(initialClassId);

      const matRes = await getStaffLearningMaterials({ classId: initialClassId });
      if (ignore) return;

      if (matRes.success) {
        setMaterials(matRes.materials);
      } else {
        setErrorMessage(matRes.error || 'Failed to load learning materials.');
      }
      setIsLoading(false);
    }

    void init();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorType(null);
    setActionFeedback(null);
    setReloadKey((k) => k + 1);
  };

  const handleClassChange = (newClassId: number) => {
    setActiveClassId(newClassId);
    setSearchQuery('');
    setSelectedSubject('All');
    setSelectedFileType('All');
    setActionFeedback(null);
    void loadMaterialsForClass(newClassId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All');
    setSelectedFileType('All');
  };

  const availableSubjects = useMemo(() => {
    const subjectsFromMaterials = Array.from(
      new Set(materials.map((m) => m.subject))
    ).filter(Boolean);
    const combined = Array.from(
      new Set([...STANDARD_CURRICULUM_SUBJECTS, ...subjectsFromMaterials])
    );
    return combined.sort();
  }, [materials]);

  // Simultaneous multi-field filtering
  const filteredMaterials = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return materials.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchesSubject =
        selectedSubject === 'All' || item.subject === selectedSubject;

      const matchesFileType =
        selectedFileType === 'All' || item.file_type === selectedFileType;

      return matchesSearch && matchesSubject && matchesFileType;
    });
  }, [materials, searchQuery, selectedSubject, selectedFileType]);

  // Dynamic counts for each file category based on active search and subject
  const fileTypeCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const baseList = materials.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchesSubject =
        selectedSubject === 'All' || item.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });

    const counts: Record<LearningMaterialFileType | 'All', number> = {
      All: baseList.length,
      PDF: 0,
      Document: 0,
      Video: 0,
      Image: 0,
      Other: 0,
    };

    for (const item of baseList) {
      if (item.file_type in counts) {
        counts[item.file_type] += 1;
      } else {
        counts.Other += 1;
      }
    }

    return counts;
  }, [materials, searchQuery, selectedSubject]);

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedSubject !== 'All' ||
    selectedFileType !== 'All';

  return (
    <div className="space-y-6 text-slate-900 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-[#187055] uppercase">
              Staff Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold text-slate-500">
              Learning Management
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#082F27] sm:text-3xl">
            Learning Materials
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Upload and manage educational handouts, practice worksheets, and media for your assigned class.
          </p>
        </div>

        {assignedClasses.length > 0 && !errorType && (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#187055] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#145C46] transition"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs shadow-xs transition ${
            actionFeedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : actionFeedback.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' && (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            {actionFeedback.type === 'warning' && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            )}
            {actionFeedback.type === 'error' && (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <MaterialsLoadingSkeleton />
      ) : errorType ? (
        <StatusAlertBanner
          type={errorType}
          message={errorMessage}
          onRetry={errorType === 'error' ? handleRetry : undefined}
        />
      ) : (
        <div className="space-y-6">
          {/* Assigned Class Banner */}
          <ClassBanner
            assignedClasses={assignedClasses}
            activeClassId={activeClassId}
            onClassChange={handleClassChange}
            staffName={staffInfo?.full_name}
          />

          {/* Filter Bar */}
          <MaterialsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            selectedFileType={selectedFileType}
            onFileTypeChange={setSelectedFileType}
            availableSubjects={availableSubjects}
            fileTypeCounts={fileTypeCounts}
          />

          {/* Result Count and Grid */}
          {isClassLoading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#187055] border-t-transparent" />
            </div>
          ) : materials.length === 0 ? (
            <EmptyState isFiltered={false} />
          ) : filteredMaterials.length === 0 ? (
            <EmptyState isFiltered={true} onResetFilters={handleResetFilters} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-500">
                  {isFiltered
                    ? `Showing ${filteredMaterials.length} of ${materials.length} materials`
                    : `${materials.length} ${
                        materials.length === 1 ? 'material' : 'materials'
                      }`}
                </span>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-[#187055] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    currentUserId={staffInfo?.profile_id}
                    isDownloading={downloadingId === material.id}
                    onDownload={handleDownload}
                    onDelete={(m) => setMaterialToDelete(m)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Material Modal */}
      {isUploadModalOpen && (
        <UploadMaterialModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          assignedClasses={assignedClasses}
          activeClassId={activeClassId}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteMaterialModal
        isOpen={Boolean(materialToDelete)}
        material={materialToDelete}
        isDeleting={isDeleting}
        onClose={() => setMaterialToDelete(null)}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
}
