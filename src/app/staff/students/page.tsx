

"use client";

import {
  useEffect,
  useState,
  Suspense,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  X,
  BookOpen,
  UserRound,
  Phone,
  ClipboardList,
} from "lucide-react";

type Student = {
  id: string;
  name: string;
  initials: string;
  attendance: number;
  progress: string;
  parent: string;
  phone: string;
};

const students: Student[] = [
  {
    id: "HDM-0241",
    name: "Aarav Perera",
    initials: "AP",
    attendance: 94,
    progress: "Developing well",
    parent: "Anjali Perera",
    phone: "077 234 1198",
  },
  {
    id: "HDM-0238",
    name: "Nethmi Silva",
    initials: "NS",
    attendance: 91,
    progress: "Excellent progress",
    parent: "Kasun Silva",
    phone: "071 455 8920",
  },
  {
    id: "HDM-0231",
    name: "Dineth Jayawardena",
    initials: "DJ",
    attendance: 89,
    progress: "Needs reading support",
    parent: "Amali Jayawardena",
    phone: "076 381 4421",
  },
  {
    id: "HDM-0225",
    name: "Mihara Fernando",
    initials: "MF",
    attendance: 96,
    progress: "Developing well",
    parent: "D. Fernando",
    phone: "075 229 1840",
  },
];

const progressOptions = [
  "All progress levels",
  "Developing well",
  "Excellent progress",
  "Needs reading support",
];

function StudentsContent() {
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";

  // FIX: The input is controlled by its own state.
  const [localSearch, setLocalSearch] = useState(urlSearch);

  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  const search = localSearch;

  const [progressFilter, setProgressFilter] = useState(
    "All progress levels"
  );
  const [attendanceFilter, setAttendanceFilter] = useState("All");

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    null
  );

  const [recordStudentId, setRecordStudentId] = useState("");
  const [learningArea, setLearningArea] = useState("");
  const [progressLevel, setProgressLevel] = useState("");
  const [teacherNote, setTeacherNote] = useState("");

  const [draftProgress, setDraftProgress] = useState(
    "All progress levels"
  );
  const [draftAttendance, setDraftAttendance] = useState("All");

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query);

    const matchesProgress =
      progressFilter === "All progress levels" ||
      student.progress === progressFilter;

    const matchesAttendance =
      attendanceFilter === "All" ||
      (attendanceFilter === "90% and above" &&
        student.attendance >= 90) ||
      (attendanceFilter === "Below 90%" &&
        student.attendance < 90);

    return (
      matchesSearch &&
      matchesProgress &&
      matchesAttendance
    );
  });

  const openProgressModal = (student?: Student) => {
    setRecordStudentId(student?.id ?? "");
    setLearningArea("");
    setProgressLevel("");
    setTeacherNote("");
    setShowProgressModal(true);
  };

  const openProfileModal = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const openFiltersModal = () => {
    setDraftProgress(progressFilter);
    setDraftAttendance(attendanceFilter);
    setShowFiltersModal(true);
  };

  const handleSaveProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    alert(
      "Progress form completed. Database saving will be connected later."
    );

    setShowProgressModal(false);
  };

  const handleApplyFilters = () => {
    setProgressFilter(draftProgress);
    setAttendanceFilter(draftAttendance);
    setShowFiltersModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F8F7] px-6 py-10 lg:px-10">

      {/* Greeting */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[#72839A]">
          SUNDAY, 8 NOVEMBER 2026
        </p>

        <h1 className="mt-4 text-[32px] font-semibold tracking-tight text-[#082F27]">
          Good morning, Ms. Dilani
        </h1>

        <p className="mt-3 text-[16px] text-[#72839A]">
          Your Bright Beginners class is ready for a great day.
        </p>
      </div>

      {/* Page heading */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-semibold text-[#111827]">
            My Students
          </h2>

          <p className="mt-2 text-sm text-[#72839A]">
            Students assigned to your Bright Beginners class only.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openProgressModal()}
          className="flex items-center gap-3 rounded-xl bg-[#187055] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#145C46]"
        >
          Record progress
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Class access banner */}
      <div className="mt-7 flex items-center gap-5 rounded-2xl bg-[#EAF4FA] px-6 py-6">
        <ShieldCheck
          size={26}
          className="shrink-0 text-[#24628A]"
        />

        <div>
          <h3 className="text-sm font-semibold text-[#195477]">
            Class-level access
          </h3>

          <p className="mt-1 text-sm text-[#24628A]">
            You can only view and update students assigned to your class.
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#D8E4DF] bg-white p-4">

        <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-[#D8E4DF] px-4 py-3">
          <Search
            size={20}
            className="shrink-0 text-[#72839A]"
          />

          <input
            type="text"
            value={localSearch}
            onChange={(event) =>
              setLocalSearch(event.target.value)
            }
            placeholder="Search your students..."
            aria-label="Search your students"
            className="w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />

          {localSearch.length > 0 && (
            <button
              type="button"
              onClick={() => setLocalSearch("")}
              aria-label="Clear student search"
              className="text-gray-400 hover:text-[#082F27]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <select
          value={progressFilter}
          onChange={(event) =>
            setProgressFilter(event.target.value)
          }
          aria-label="Filter by progress"
          className="h-12 min-w-[195px] rounded-xl border border-[#D8E4DF] bg-white px-4 text-sm text-[#111827] outline-none"
        >
          {progressOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={openFiltersModal}
          className="flex h-12 items-center gap-2 rounded-xl border border-[#B8D3C8] bg-white px-5 text-sm font-medium text-[#082F27] transition-colors hover:bg-[#F5F8F7]"
        >
          <SlidersHorizontal size={17} />
          Filters
        </button>
      </div>

      {/* Student cards */}
      {filteredStudents.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="rounded-2xl border border-[#D8E4DF] bg-white p-6"
            >

              {/* Student heading */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#DDF2E9] text-xl font-semibold text-[#187055]">
                    {student.initials}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#111827]">
                      {student.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#72839A]">
                      {student.id} · Bright Beginners
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[#DDF2E9] px-3 py-1 text-xs font-medium text-[#187055]">
                  Active
                </span>
              </div>

              {/* Attendance */}
              <div className="mt-6 flex items-center justify-between border-t border-[#D8E4DF] py-4">
                <span className="text-sm text-[#72839A]">
                  Attendance
                </span>

                <span className="text-sm font-semibold text-[#111827]">
                  {student.attendance}%
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between gap-3 border-t border-[#D8E4DF] py-4">
                <span className="text-sm text-[#72839A]">
                  Learning progress
                </span>

                <span className="text-right text-sm font-semibold text-[#111827]">
                  {student.progress}
                </span>
              </div>

              {/* Parent */}
              <div className="border-t border-[#D8E4DF] py-4">
                <p className="text-xs text-[#72839A]">
                  Parent / Guardian
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#111827]">
                  <UserRound size={16} />
                  {student.parent}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-[#72839A]">
                  <Phone size={15} />
                  {student.phone}
                </p>
              </div>

              {/* Card buttons */}
              <div className="mt-2 flex flex-wrap gap-3 border-t border-[#D8E4DF] pt-5">
                <button
                  type="button"
                  onClick={() => openProfileModal(student)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#B8D3C8] px-4 py-3 text-sm font-semibold text-[#187055] hover:bg-[#F5F8F7]"
                >
                  <UserRound size={17} />
                  View profile
                </button>

                <button
                  type="button"
                  onClick={() => openProgressModal(student)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#187055] px-4 py-3 text-sm font-semibold text-white hover:bg-[#145C46]"
                >
                  <ClipboardList size={17} />
                  Record progress
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-[#D8E4DF] bg-white px-6 py-14 text-center">
          <Search
            size={32}
            className="mx-auto text-[#9CA3AF]"
          />

          <h3 className="mt-4 text-lg font-semibold text-[#082F27]">
            No students found
          </h3>

          <p className="mt-2 text-sm text-[#72839A]">
            Try a different name or clear your search and filters.
          </p>

          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              setProgressFilter("All progress levels");
              setAttendanceFilter("All");
            }}
            className="mt-5 rounded-xl bg-[#187055] px-5 py-3 text-sm font-semibold text-white hover:bg-[#145C46]"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Record Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#082F27]/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-progress-title"
            className="w-full max-w-[775px] rounded-[22px] bg-white p-7 shadow-2xl sm:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#187055]">
                  STAFF PORTAL
                </p>

                <h2
                  id="record-progress-title"
                  className="mt-2 text-2xl font-semibold text-[#082F27]"
                >
                  Record student progress
                </h2>

                <p className="mt-2 text-sm text-[#72839A]">
                  Bright Beginners · Room 02
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                aria-label="Close progress form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSaveProgress}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="record-student"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Student
                </label>

                <select
                  id="record-student"
                  required
                  value={recordStudentId}
                  onChange={(event) =>
                    setRecordStudentId(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D8E4DF] bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select a student</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="learning-area"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Learning area
                </label>

                <select
                  id="learning-area"
                  required
                  value={learningArea}
                  onChange={(event) =>
                    setLearningArea(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D8E4DF] bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select learning area</option>
                  <option value="Language and literacy">
                    Language and literacy
                  </option>
                  <option value="Numeracy">Numeracy</option>
                  <option value="Creative activities">
                    Creative activities
                  </option>
                  <option value="Social development">
                    Social development
                  </option>
                  <option value="Physical development">
                    Physical development
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="progress-level"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Progress level
                </label>

                <select
                  id="progress-level"
                  required
                  value={progressLevel}
                  onChange={(event) =>
                    setProgressLevel(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D8E4DF] bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select progress level</option>
                  <option value="Excellent progress">
                    Excellent progress
                  </option>
                  <option value="Developing well">
                    Developing well
                  </option>
                  <option value="Needs reading support">
                    Needs reading support
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="teacher-note"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Teacher note
                </label>

                <textarea
                  id="teacher-note"
                  rows={4}
                  value={teacherNote}
                  onChange={(event) =>
                    setTeacherNote(event.target.value)
                  }
                  placeholder="Write a short note about the student's progress..."
                  className="w-full resize-none rounded-xl border border-[#D8E4DF] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#D8E4DF] pt-6">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="rounded-xl border border-[#B8D3C8] px-6 py-3 text-sm font-semibold text-[#187055] hover:bg-[#F5F8F7]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#187055] px-6 py-3 text-sm font-semibold text-white hover:bg-[#145C46]"
                >
                  Save and continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082F27]/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-profile-title"
            className="w-full max-w-[775px] rounded-[22px] bg-white p-7 shadow-2xl sm:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#187055]">
                  STAFF PORTAL
                </p>

                <h2
                  id="student-profile-title"
                  className="mt-2 text-2xl font-semibold text-[#082F27]"
                >
                  Student profile
                </h2>

                <p className="mt-2 text-sm text-[#72839A]">
                  Bright Beginners · Room 02
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close student profile"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-7 flex items-center gap-4 rounded-xl bg-[#F5F8F7] p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DDF2E9] text-xl font-semibold text-[#187055]">
                {selectedStudent.initials}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#082F27]">
                  {selectedStudent.name}
                </h3>

                <p className="text-sm text-[#72839A]">
                  {selectedStudent.id}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#D8E4DF] p-4">
                <p className="text-xs text-[#72839A]">
                  Attendance
                </p>
                <p className="mt-2 font-semibold">
                  {selectedStudent.attendance}%
                </p>
              </div>

              <div className="rounded-xl border border-[#D8E4DF] p-4">
                <p className="text-xs text-[#72839A]">
                  Learning progress
                </p>
                <p className="mt-2 font-semibold">
                  {selectedStudent.progress}
                </p>
              </div>

              <div className="rounded-xl border border-[#D8E4DF] p-4 sm:col-span-2">
                <p className="text-xs text-[#72839A]">
                  Parent / Guardian
                </p>

                <p className="mt-2 font-semibold">
                  {selectedStudent.parent}
                </p>

                <p className="mt-1 text-sm text-[#72839A]">
                  {selectedStudent.phone}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-[#72839A]">
              This profile currently displays sample student data.
              Full student records will be connected later.
            </p>

            <div className="mt-7 flex justify-end gap-3 border-t border-[#D8E4DF] pt-6">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="rounded-xl border border-[#B8D3C8] px-6 py-3 text-sm font-semibold text-[#187055]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  openProgressModal(selectedStudent);
                }}
                className="rounded-xl bg-[#187055] px-6 py-3 text-sm font-semibold text-white hover:bg-[#145C46]"
              >
                Record progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082F27]/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
            className="w-full max-w-[775px] rounded-[22px] bg-white p-7 shadow-2xl sm:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#187055]">
                  STAFF PORTAL
                </p>

                <h2
                  id="filters-title"
                  className="mt-2 text-2xl font-semibold text-[#082F27]"
                >
                  Filter students
                </h2>

                <p className="mt-2 text-sm text-[#72839A]">
                  Bright Beginners · Room 02
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                aria-label="Close filters"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="filter-progress"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Progress level
                </label>

                <select
                  id="filter-progress"
                  value={draftProgress}
                  onChange={(event) =>
                    setDraftProgress(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D8E4DF] bg-white px-4 py-3 text-sm outline-none"
                >
                  {progressOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-attendance"
                  className="mb-2 block text-sm font-medium text-[#374151]"
                >
                  Attendance
                </label>

                <select
                  id="filter-attendance"
                  value={draftAttendance}
                  onChange={(event) =>
                    setDraftAttendance(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D8E4DF] bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="All">All attendance levels</option>
                  <option value="90% and above">90% and above</option>
                  <option value="Below 90%">Below 90%</option>
                </select>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-[#D8E4DF] pt-6">
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="rounded-xl border border-[#B8D3C8] px-6 py-3 text-sm font-semibold text-[#187055]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="rounded-xl bg-[#187055] px-6 py-3 text-sm font-semibold text-white hover:bg-[#145C46]"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F8F7] p-10">
          Loading students...
        </div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}
