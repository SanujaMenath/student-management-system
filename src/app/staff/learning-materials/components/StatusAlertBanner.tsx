import { AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';

interface StatusAlertBannerProps {
  type: 'unlinked_staff' | 'no_classes' | 'error';
  message?: string | null;
  onRetry?: () => void;
}

export function StatusAlertBanner({
  type,
  message,
  onRetry,
}: StatusAlertBannerProps) {
  if (type === 'unlinked_staff') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Staff Account Not Yet Linked
            </h3>
            <p className="mt-1 text-xs text-amber-800">
              {message ||
                'Your authenticated account is not yet linked to an institutional staff record. Please contact the Handahamy administration to complete your profile setup.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'no_classes') {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6 text-blue-900 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-900">
              No Assigned Classes Found
            </h3>
            <p className="mt-1 text-xs text-blue-800">
              You are currently not assigned to any classroom as a class teacher. Once the administration assigns a class to your profile, you will be able to manage and upload learning materials here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <h4 className="text-xs font-bold text-red-900">Unable to load data</h4>
            <p className="mt-0.5 text-xs text-red-700">{message || 'An unexpected error occurred.'}</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-xs hover:bg-red-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

