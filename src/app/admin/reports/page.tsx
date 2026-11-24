'use client';

import { useEffect, useMemo, useState } from 'react';
import { getClassOverview } from '@/actions/classes';

type ReportType = 'enrollment' | 'admission' | 'fee' | 'outstanding' | 'attendance' | 'capacity';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'enrollment', label: 'Enrollment reports' },
  { value: 'admission', label: 'Admission reports' },
  { value: 'fee', label: 'Fee collection reports' },
  { value: 'outstanding', label: 'Outstanding reports' },
  { value: 'attendance', label: 'Attendance reports' },
  { value: 'capacity', label: 'Class capacity reports' },
];

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF document' },
  { value: 'csv', label: 'CSV spreadsheet' },
];

const MONTHS = [
  'October 2024',
  'November 2024',
  'December 2024',
  'January 2025',
  'February 2025',
  'March 2025',
];

interface ReportClass {
  id: number;
  name: string;
  capacity: number;
  enrolled: number;
}

const SAMPLE_RECENT_REPORTS = [
  { name: 'Fee collection reports', period: 'March 2025', className: 'All classes', generated: '31 Mar 2025' },
  { name: 'Attendance reports', period: 'February 2025', className: 'All classes', generated: '28 Feb 2025' },
  { name: 'Enrollment reports', period: 'January 2025', className: 'All classes', generated: '31 Jan 2025' },
];

// Mock data aligned with MONTHS. Replace with Supabase queries.
const FEE_COLLECTED = [428000, 531000, 472000, 634000, 575000, 658000];
const FEE_BILLED = [760000, 800000, 790000, 830000, 820000, 844000];
const ADMISSIONS = [18, 22, 9, 41, 27, 24];
const ATTENDANCE = [94, 93, 89, 95, 94, 96];

const TREND_META: Record<ReportType, { eyebrow: string; title: string }> = {
  enrollment: { eyebrow: 'Current enrollment', title: 'Enrollment by class' },
  admission: { eyebrow: 'Monthly intake', title: 'New admissions trend' },
  fee: { eyebrow: 'Monthly collection', title: 'Fee collection trend' },
  outstanding: { eyebrow: 'Fees to be collected', title: 'Outstanding fees trend' },
  attendance: { eyebrow: 'Monthly average', title: 'Attendance rate trend' },
  capacity: { eyebrow: 'Current enrollment', title: 'Capacity by class' },
};

const lkr = (n: number) => `LKR ${Math.round(n).toLocaleString('en-US')}`;

function getTrend(
  type: ReportType,
  factor: number,
  classes: ReportClass[],
  selectedClassId: string
) {
  if (type === 'capacity' || type === 'enrollment') {
    const filteredClasses = selectedClassId === 'all'
      ? classes
      : classes.filter((c) => String(c.id) === selectedClassId);
    return filteredClasses.map((c) => ({
      label: c.name,
      value: type === 'capacity' ? c.capacity : c.enrolled,
    }));
  }

  const src =
    type === 'fee'
      ? FEE_COLLECTED
      : type === 'outstanding'
        ? FEE_BILLED.map((billed, i) => billed - FEE_COLLECTED[i])
        : type === 'admission'
          ? ADMISSIONS
          : ATTENDANCE;
  return MONTHS.map((m, i) => ({
    label: m.slice(0, 3),
    value: type === 'attendance' ? src[i] : Math.round(src[i] * factor),
  }));
}

function getSummary(
  type: ReportType,
  i: number,
  factor: number,
  classStats: { name: string; capacity: number; enrolled: number; count: number }
) {
  if (type === 'fee') {
    const billed = FEE_BILLED[i] * factor;
    const collected = FEE_COLLECTED[i] * factor;
    return [
      { label: 'Total billed', value: lkr(billed) },
      { label: 'Collected', value: lkr(collected) },
      { label: 'Outstanding', value: lkr(billed - collected) },
      { label: 'Collection rate', value: `${Math.round((collected / billed) * 100)}%` },
    ];
  }
  if (type === 'outstanding') {
    const billed = FEE_BILLED[i] * factor;
    const collected = FEE_COLLECTED[i] * factor;
    return [
      { label: 'Outstanding fees', value: lkr(billed - collected) },
      { label: 'Total billed', value: lkr(billed) },
      { label: 'Collected', value: lkr(collected) },
      { label: 'Collection rate', value: `${Math.round((collected / billed) * 100)}%` },
    ];
  }
  if (type === 'admission') {
    const total = Math.round(ADMISSIONS[i] * factor);
    const approved = Math.round(total * 0.75);
    const pending = Math.round(total * 0.2);
    return [
      { label: 'Applications', value: String(total) },
      { label: 'Approved', value: String(approved) },
      { label: 'Pending', value: String(pending) },
      { label: 'Rejected', value: String(Math.max(total - approved - pending, 0)) },
    ];
  }
  if (type === 'enrollment') {
    const available = Math.max(classStats.capacity - classStats.enrolled, 0);
    const enrollmentRate = classStats.capacity
      ? Math.round((classStats.enrolled / classStats.capacity) * 100)
      : 0;
    return [
      { label: 'Students enrolled', value: String(classStats.enrolled) },
      { label: 'Class capacity', value: String(classStats.capacity) },
      { label: 'Seats available', value: String(available) },
      { label: 'Enrollment rate', value: `${enrollmentRate}%` },
    ];
  }
  if (type === 'capacity') {
    const available = Math.max(classStats.capacity - classStats.enrolled, 0);
    const utilization = classStats.capacity
      ? Math.round((classStats.enrolled / classStats.capacity) * 100)
      : 0;
    return [
      { label: 'Classes', value: String(classStats.count) },
      { label: 'Total capacity', value: String(classStats.capacity) },
      { label: 'Students enrolled', value: String(classStats.enrolled) },
      { label: 'Seats available', value: `${available} (${utilization}% utilized)` },
    ];
  }
  const rate = ATTENDANCE[i];
  return [
    { label: 'Average attendance', value: `${rate}%` },
    { label: 'Absent (avg/day)', value: `${100 - rate}%` },
    { label: 'Working days', value: '22' },
    { label: 'Late arrivals', value: `${Math.round((100 - rate) * 1.5)}%` },
  ];
}

function formatValue(type: ReportType, v: number) {
  return type === 'fee' || type === 'outstanding'
    ? lkr(v)
    : type === 'attendance'
      ? `${v}%`
      : String(v);
}

function Select({
  value,
  onChange,
  options,
  label,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 8l5 5 5-5" />
      </svg>
    </div>
  );
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('fee');
  const [month, setMonth] = useState('March 2025');
  const [classValue, setClassValue] = useState('all');
  const [classes, setClasses] = useState<ReportClass[]>([]);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<ReportType>('fee');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    let active = true;
    getClassOverview()
      .then((rows) => {
        if (active) {
          setClasses(
            rows.map((row) => ({
              id: row.id,
              name: row.name,
              capacity: row.capacity,
              enrolled: row.students?.[0]?.count ?? 0,
            }))
          );
        }
      })
      .catch((error) => console.error('Failed to load report classes:', error));

    return () => {
      active = false;
    };
  }, []);

  const selectedClass = classes.find((c) => String(c.id) === classValue);
  const totalEnrollment = classes.reduce((total, c) => total + c.enrolled, 0);
  const totalCapacity = classes.reduce((total, c) => total + c.capacity, 0);
  const classStats = useMemo(
    () =>
      selectedClass
        ? { ...selectedClass, count: 1 }
        : {
            name: 'All classes',
            capacity: totalCapacity,
            enrolled: totalEnrollment,
            count: classes.length,
          },
    [selectedClass, totalCapacity, totalEnrollment, classes.length]
  );
  const factor = selectedClass
    ? totalEnrollment > 0
      ? selectedClass.enrolled / totalEnrollment
      : totalCapacity > 0
        ? selectedClass.capacity / totalCapacity
        : 1 / Math.max(classes.length, 1)
    : 1;
  const monthIndex = MONTHS.indexOf(month);

  const trend = useMemo(
    () => getTrend(reportType, factor, classes, classValue),
    [reportType, factor, classes, classValue]
  );
  const summary = useMemo(
    () => getSummary(reportType, monthIndex, factor, classStats),
    [reportType, monthIndex, factor, classStats]
  );
  const max = Math.max(...trend.map((t) => t.value), 1);
  const meta = TREND_META[reportType];
  const usesMonthlyData = reportType !== 'enrollment' && reportType !== 'capacity';

  const handleExport = () => window.print(); // TODO: server-generated PDF

  const handleExportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsExportDialogOpen(false);
    handleExport();
  };

  return (
    <div className="space-y-6 pb-10 text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Generate enrollment, admission, fee collection, outstanding, attendance and class capacity reports.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] sm:p-5">
        <div
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            usesMonthlyData
              ? 'lg:grid-cols-[1.2fr_1fr_1fr_auto]'
              : 'lg:grid-cols-[1.2fr_1fr_auto]'
          }`}
        >
          <Select
            label="Report type"
            value={reportType}
            onChange={(v) => setReportType(v as ReportType)}
            options={REPORT_TYPES}
          />
          {usesMonthlyData && (
            <Select
              label="Month"
              value={month}
              onChange={setMonth}
              options={MONTHS.map((m) => ({ value: m, label: m }))}
            />
          )}
          <Select
            label="Class"
            value={classValue}
            onChange={setClassValue}
            options={[
              { value: 'all', label: 'All classes' },
              ...classes.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
          />
          <button
            type="button"
            onClick={() => setIsExportDialogOpen(true)}
            className="h-11 rounded-xl bg-[#0C4A35] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#072B20] focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20"
          >
            Generate report
          </button>
        </div>
      </div>

      {/* Chart + summary */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{meta.eyebrow}</p>
          <h2 className="mt-0.5 text-base font-bold text-slate-900">{meta.title}</h2>

          <div className="mt-6 flex h-[250px] items-end">
            {trend.map((p, index) => (
              <div key={`${p.label}-${index}`} className="flex h-full flex-1 items-end justify-center">
                <div
                  title={formatValue(reportType, p.value)}
                  className="w-11 rounded-t-md bg-[#0C4A35] transition-[height] duration-500"
                  style={{ height: `${(p.value / max) * 89}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex">
            {trend.map((p, index) => (
              <span
                key={`${p.label}-${index}`}
                title={p.label}
                className="min-w-0 flex-1 truncate px-1 text-center text-xs font-medium text-slate-400"
              >
                {p.label}
              </span>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Report summary</p>
          <h2 className="mt-0.5 text-base font-bold text-slate-900">
            {usesMonthlyData ? month : 'Current snapshot'}
          </h2>

          <dl className="mt-4 border-t border-slate-100">
            {summary.map((row, i) => (
              <div
                key={row.label}
                className={`flex h-[59px] items-center justify-between ${
                  i < summary.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <dt className="text-xs text-slate-500">{row.label}</dt>
                <dd className="text-xs font-bold text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {/* Sample report history */}
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent reports</h2>
            <p className="mt-0.5 text-xs text-slate-500">Previously generated reports</p>
          </div>
          <span className="w-fit rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            Sample data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="bg-slate-50/40 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 sm:px-6">Report</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3 sm:px-6">Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {SAMPLE_RECENT_REPORTS.map((report) => (
                <tr key={report.name} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-semibold text-slate-800 sm:px-6">{report.name}</td>
                  <td className="px-5 py-4 text-slate-600">{report.period}</td>
                  <td className="px-5 py-4 text-slate-600">{report.className}</td>
                  <td className="px-5 py-4 text-slate-500 sm:px-6">{report.generated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isExportDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 print:hidden"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsExportDialogOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
            className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-xl sm:p-7"
          >
            <h2 id="export-dialog-title" className="text-xl font-bold text-slate-900">
              Export PDF
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete the details below to continue.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleExportSubmit}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="export-type">
                  Report type
                </label>
                <Select
                  label="Report type"
                  id="export-type"
                  value={exportType}
                  onChange={(value) => setExportType(value as ReportType)}
                  options={REPORT_TYPES}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="export-from">
                    From
                  </label>
                  <input
                    id="export-from"
                    type="date"
                    required
                    max={toDate || undefined}
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="export-to">
                    To
                  </label>
                  <input
                    id="export-to"
                    type="date"
                    required
                    min={fromDate || undefined}
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="export-format">
                  Format
                </label>
                <Select
                  label="Format"
                  id="export-format"
                  value={exportFormat}
                  onChange={setExportFormat}
                  options={EXPORT_FORMATS}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExportDialogOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0C4A35] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#072B20]"
                >
                  Generate
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
