
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  FolderOpen,
  Download,
} from 'lucide-react';

const courses = [
  {
    id: 'english',
    courseName: "English",
    color: 'bg-[#0C4A35]',
    class: "Bright Beginers",
    materials: [
      {
        id: 1,
        title: 'Vocabulary and Pronunciation Handout I',
        description: 'Names of animals and their sounds',
        type: 'PDF',
        date: '11 September 2026',
      },
      {
        id: 2,
        title: 'Vocabulary and Pronunciation Handout II',
        description: 'Names of fruits and vegetables',
        type: 'PDF',
        date: '15 September 2026',
      },
      {
        id: 3,
        title: 'Home Practice Activities I',
        description: 'Color the pictures and match them with their names',
        type: 'PDF',
        date: '20 September 2026',
      },
      {
        id: 4,
        title: 'Home Practice Activities II',
        description: 'Fill in the blanks with the correct words',
        type: 'Video',
        date: '25 September 2026',
      }
    ],
  },
  {
    id: 'mathematics',
    courseName: "Mathematics",
    class: "Bright Beginers",
    color: 'bg-[#D28A20]',
    materials: [
      {
        id: 1,
        title: 'Number Recognition',
        description: 'Introduction to numbers',
        type: 'PDF',
        date: '18 September 2026',
      },
      {
        id: 2,
        title: 'Counting Activities',
        description: 'Practice counting exercises',
        type: 'PDF',
        date: '22 September 2026',
      },
    ],
  },
  {
    id: 'environment',
    courseName: "Environmental Studies",
    class: "Bright Beginers",
    color: 'bg-[#4E7D9A]',
    materials: [
      {
        id: 1,
        title: 'My Environment',
        description: 'Introduction to the environment',
        type: 'PDF',
        date: '25 September 2026',
      },
      {
        id: 2,
        title: 'Plants and Animals',
        description: 'Learning about living things',
        type: 'Video',
        date: '28 September 2026',
      },
    ],
  },
  {
    id: 'general-knowledge',
    courseName: "General Knowledge",
    class: "Bright Beginers",
    color: 'bg-[#A03C3C]',
    materials: [
      {
        id: 1,
        title: 'World Facts',
        description: 'Interesting facts about the world',
        type: 'PDF',
        date: '30 September 2026',
      },
        {
        id: 2,
        title: 'Famous Personalities',
        description: 'Learn about famous people in history',
        type: 'Video',
        date: '5 October 2026',
      },
    ],
  },
    {
    id: 'art-and-craft',
    courseName: "Art and Craft",
    class: "Bright Beginers",
    color: 'bg-[#7D4E9A]',
    materials: [
      {
        id: 1,
        title: 'Drawing and Coloring',
        description: 'Learn basic drawing and coloring techniques',
        type: 'PDF',
        date: '10 October 2026',
      },
        {
        id: 2,
        title: 'Craft Activities',
        description: 'Fun craft projects for kids',
        type: 'Video',
        date: '15 October 2026',
      },
    ],
  }
];

const materialIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  Document: FileText,
  Video: Video,
  Image: ImageIcon,
  Link: LinkIcon,
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-7 text-slate-900">

      {/* Back Navigation */}
      <Link
        href="/parent/learning-management"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#14533E] transition hover:text-[#0e3b2e]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>


      {/* Course Materials */}
      <section className="space-y-4">

        <div>
          <h3 className="text-lg font-bold">{course.courseName}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Browse the learning resources and activities uploaded for this course.
          </p>
        </div>


        {/* Learning Materials */}
        <div className="space-y-3">

          {course.materials.map((material) => {
            const Icon = materialIcons[material.type] || FileText;

            return (
              <details
                key={material.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white"
              >

                <summary className="flex cursor-pointer list-none items-center gap-3 p-5 transition hover:bg-slate-50">

                  {/* Material Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E5EEE9] text-[#14533E]">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Material Information */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      {material.title}
                    </h4>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {material.description}
                    </p>
                  </div>

                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />

                </summary>

                {/* Expanded Material Details */}
                <div className="border-t border-slate-100 bg-[#FAFBFA] px-5 py-4">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {material.title}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span>{material.type}</span>
                        <span>•</span>
                        <span>Added {material.date}</span>
                      </div>
                    </div>


                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    {material.description}
                  </p>

                  <p className="mt-3 text-[11px] text-slate-400">
                    No file attached yet.
                  </p>

                </div>

              </details>
            );
          })}

        </div>
      </section>
    </div>
  );
}
