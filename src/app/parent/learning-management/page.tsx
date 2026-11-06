
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const courses = [
  {
    id: 'english',
    courseName: "English",
    color: 'bg-[#0C4A35]',
    class: "Bright Beginers"
  },
  {
    id: 'mathematics',
    courseName: "Mathematics",
    color: 'bg-[#D28A20]',
    class: "Bright Beginers"
  },
  {
    id: 'environment',
    courseName: "Environmental Studies",
    color: 'bg-[#4E7D9A]',
    class: "Bright Beginers"
  },
  {
    id: 'general-knowledge',
    courseName: "General Knowledge",
    color: 'bg-[#A03C3C]',
    class: "Bright Beginers"
  },
  {
    id: 'art-and-craft',
    courseName: "Art and Craft",
    color: 'bg-[#7D4E9A]',
    class: "Bright Beginers"
  }
];

export default function LearningManagementPage() {
  return (
    <div className="space-y-7 text-slate-900">

      {/* Page Heading */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          Learning management
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Follow your child's learning journey.
        </p>
      </div>

      {/* Course List */}
      <section className="space-y-4">

        <div className="flex items-center justify-between">

          <span className="rounded-full bg-[#E5EEE9] px-3 py-1.5 text-xs font-semibold text-[#14533E]">
            {courses.length} Courses
          </span>
        </div>

        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/parent/learning-management/${course.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition hover:border-[#B7D2C5] hover:shadow-md"
            >

              {/* Color Indicator */}
              <div className={`h-14 w-1.5 shrink-0 rounded-full ${course.color}`} />

              {/* Course Information */}
              <div className="min-w-0 flex-1">

                

                <h4 className="mt-1 text-base font-bold text-slate-900">
                  {course.courseName}
                </h4>


                <p className="mt-1.5 text-[11px] text-slate-400">
                  {course.class}
                </p>

              </div>

              {/* View Course */}
              <div className="flex shrink-0 items-center gap-2 text-[#14533E]">
                <span className="hidden text-xs font-semibold sm:block">
                  View course
                </span>
                <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </div>

            </Link>
          ))}
        </div>

      </section>
    </div>
  );
}
