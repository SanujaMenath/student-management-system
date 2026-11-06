
'use client';

import { useState } from 'react';
import { BriefcaseBusiness, Upload } from 'lucide-react';
import PublicNavbar from '@/components/shared/PublicNavbar';
import Footer from '@/components/shared/Footer';

const vacancies = [
  {
    id: 1,
    title: 'Early Childhood Educator',
    department: 'Education',
    type: 'Full-time',
    description:
      'Bring care, curiosity and professionalism to our growing learning community.',
    closingDate: '30 April 2025',
  },
  {
    id: 2,
    title: 'Teaching Assistant',
    department: 'Education',
    type: 'Full-time',
    description:
      'Bring care, curiosity and professionalism to our growing learning community.',
    closingDate: '30 April 2025',
  },
  {
    id: 3,
    title: 'Administrative Assistant',
    department: 'Administration',
    type: 'Full-time',
    description:
      'Bring care, curiosity and professionalism to our growing learning community.',
    closingDate: '30 April 2025',
  },
];

export default function CareerPage() {
  const [selectedPosition, setSelectedPosition] = useState(
    vacancies[0].title
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#F0F8F4] to-[#FCF8EC] px-6 py-16 lg:py-20 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-[#18765A] mb-5">
          CAREERS
        </p>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#072B20] max-w-2xl mx-auto leading-tight">
          Join our caring, purpose-driven team
        </h1>

        <p className="text-sm md:text-base text-slate-500 mt-6 max-w-2xl mx-auto">
          Help us create meaningful early learning experiences and a safe
          place where children can thrive.
        </p>
      </section>

      {/* Career Content */}
      <section className="max-w-6xl mx-auto px-6 py-12 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Available Vacancies */}
          <div className="space-y-3">
            {vacancies.map((job) => (
              <div
                key={job.id}
                className="border border-slate-200 rounded-xl p-5 flex justify-between gap-4 hover:shadow-md transition"
              >
                <div className="flex gap-3">
                  <BriefcaseBusiness className="w-5 h-5 text-[#18765A] shrink-0 mt-1" />

                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      {job.department} · {job.type}
                    </p>

                    <h2 className="font-semibold text-sm text-slate-900">
                      {job.title}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {job.description}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-2">
                      Applications close {job.closingDate}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPosition(job.title)}
                  className="shrink-0 h-fit border border-[#C9DED5] text-[#0C6249] rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#F0F8F4] transition"
                >
                  View role
                </button>
              </div>
            ))}
          </div>

          {/* Application Form */}
          <div className="border border-slate-200 rounded-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-semibold text-slate-900">
              Apply now
            </h2>

            <p className="text-sm text-slate-600 mb-5">
              Submit your details and CV for review.
            </p>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Application submitted successfully!');
              }}
            >
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A]"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+94"
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A]"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Position
                </label>

                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A] bg-white"
                >
                  {vacancies.map((job) => (
                    <option key={job.id} value={job.title}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Message */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Cover message
                </label>

                <textarea
                  rows={4}
                  placeholder="Tell us why you would like to join Handahamy"
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-3 text-xs outline-none resize-y focus:border-[#18765A]"
                />
              </div>

              {/* CV Upload */}
              <label className="border border-dashed border-[#B8D9CB] bg-[#F2F9F5] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[#EAF5EF] transition">
                <Upload className="w-5 h-5 text-[#18765A] mb-2" />

                <span className="text-xs font-semibold text-[#072B20]">
                  Upload your CV
                </span>

                <span className="text-[11px] text-slate-500 mt-2">
                  PDF or DOC, up to 5MB
                </span>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required
                  className="hidden"
                />
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#18765A] hover:bg-[#072B20] text-white rounded-lg py-3 text-xs font-semibold transition"
              >
                Submit application
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
