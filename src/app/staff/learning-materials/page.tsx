'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getStaffAssignedClasses,
  getStaffLearningMaterials,
  type AssignedClass,
} from '@/actions/learning-materials';
import { ClassBanner } from './components/ClassBanner';
import { MaterialsLoadingSkeleton } from './components/MaterialsLoadingSkeleton';
import { StatusAlertBanner } from './components/StatusAlertBanner';

export default function StaffLearningMaterialsPage() {
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [activeClassId, setActiveClassId] = useState<number | null>(null);
  const [staffInfo, setStaffInfo] = useState<{ id: string; full_name: string } | null>(null);
  const [materialsCount, setMaterialsCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'unlinked_staff' | 'no_classes' | 'error' | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadMaterialsForClass = useCallback(async (classId: number) => {
    setIsClassLoading(true);
    const res = await getStaffLearningMaterials({ classId });
    if (res.success) {
      setMaterialsCount(res.materials.length);
    }
    setIsClassLoading(false);
  }, []);

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
        setMaterialsCount(matRes.materials.length);
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
    setReloadKey((k) => k + 1);
  };

  const handleClassChange = (newClassId: number) => {
    setActiveClassId(newClassId);
    void loadMaterialsForClass(newClassId);
  };

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
      </div>

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

          {/* Section placeholder showing class materials state */}
          {isClassLoading ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#187055] border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-slate-800">
                    Class Learning Materials
                  </h2>
                  <span className="rounded-full bg-[#E7F3EE] px-2.5 py-0.5 text-xs font-semibold text-[#187055]">
                    {materialsCount} {materialsCount === 1 ? 'Resource' : 'Resources'}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Classroom resources successfully loaded for the selected assigned class.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
