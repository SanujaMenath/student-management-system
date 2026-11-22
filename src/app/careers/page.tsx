
'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Upload, X } from 'lucide-react';
import PublicNavbar from '@/components/shared/PublicNavbar';
import Footer from '@/components/shared/Footer';
import { careerApplicationTextSchema, validateCareerCv } from '@/lib/validations/careers';


export default function CareerPage() { 
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCvName, setSelectedCvName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cvError, setCvError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setFieldErrors({});
    setCvError('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const textResult = careerApplicationTextSchema.safeParse({
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      position: formData.get('position'),
      cover_message: formData.get('cover_message'),
    });

    if (!textResult.success) {
      setSubmitting(false);
      setFieldErrors(
        Object.fromEntries(
          textResult.error.issues
            .filter((issue) => issue.path.length > 0)
            .map((issue) => [String(issue.path[0]), issue.message])
        )
      );
      return;
    }

    const cv = formData.get('cv');
    if (cv instanceof File) {
      const cvError = validateCareerCv(cv);
      if (cvError) {
        setSubmitting(false);
        setCvError(cvError);
        return;
      }
    }

    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to submit the application.');
      }

      form.reset();
      setSelectedCvName('');
      setMessage({
        type: 'success',
        text: result.message || 'Your application was submitted successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to submit the application.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PublicNavbar />

      {message?.type === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_12px_40px_rgba(7,43,32,0.18)]"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-slate-950">Application submitted</p>
            <p className="mt-1 text-xs text-slate-600">{message.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            aria-label="Close confirmation"
            className="ml-1 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
              onSubmit={handleSubmit}
            >
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Full name
                </label>
                <input
                  name="full_name"
                  type="text"
                  placeholder="Your full name"
                  required
                  aria-invalid={Boolean(fieldErrors.full_name)}
                  className={`w-full border rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A] ${
                    fieldErrors.full_name ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.full_name && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`w-full border rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A] ${
                      fieldErrors.email ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+94"
                    required
                    aria-invalid={Boolean(fieldErrors.phone)}
                    className={`w-full border rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A] ${
                      fieldErrors.phone ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Position
                </label>

                <select
                  name="position"
                  required
                  aria-invalid={Boolean(fieldErrors.position)}
                  className={`w-full border rounded-lg px-3 py-3 text-xs outline-none focus:border-[#18765A] bg-white ${
                    fieldErrors.position ? 'border-red-400' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select a position</option>
                  <option value="Teaching Assistant">Teaching Assistant</option>
                  <option value="Early Childhood Educator">Early Childhood Educator</option>
                  <option value="Assistant Administrative Officer">Assistant Administrative Officer</option>
                  <option value="other">Other</option>
                </select>
                {fieldErrors.position && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.position}</p>
                )}
              </div>

              {/* Cover Message */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Cover message
                </label>

                <textarea
                  name="cover_message"
                  rows={4}
                  placeholder="Tell us why you would like to join Handahamy"
                  required
                  aria-invalid={Boolean(fieldErrors.cover_message)}
                  className={`w-full border rounded-lg px-3 py-3 text-xs outline-none resize-y focus:border-[#18765A] ${
                    fieldErrors.cover_message ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.cover_message && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.cover_message}</p>
                )}
              </div>

              {/* CV Upload */}
              <label className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
                cvError
                  ? 'border-red-400 bg-red-50 hover:bg-red-100'
                  : 'border-[#B8D9CB] bg-[#F2F9F5] hover:bg-[#EAF5EF]'
              }`}>
                <Upload className="w-5 h-5 text-[#18765A] mb-2" />

                <span className="text-xs font-semibold text-[#072B20]">
                  {selectedCvName ? 'CV selected' : 'Upload your CV'}
                </span>

                <span className={`mt-2 text-[11px] ${selectedCvName ? 'max-w-full break-all font-semibold text-[#18765A]' : 'text-slate-500'}`}>
                  {selectedCvName || 'PDF or DOC, up to 5MB'}
                </span>

                <input
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required
                  onChange={(event) => {
                    setSelectedCvName(event.target.files?.[0]?.name ?? '');
                    setCvError('');
                  }}
                  className="hidden"
                />
              </label>
              {cvError && (
                <p className="text-xs font-medium text-red-600">{cvError}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#18765A] hover:bg-[#072B20] text-white rounded-lg py-3 text-xs font-semibold transition"
              >
                {submitting ? 'Submitting...' : 'Submit application'}
              </button>
            </form>
          </div>
      
      </section>
      <Footer />
    </main>
  );
}
