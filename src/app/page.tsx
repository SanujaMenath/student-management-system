'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  User,
  ShieldCheck,
  HeartHandshake,
  Star,
} from 'lucide-react';
import ChatWidget from '@/components/chat/ChatWidget';
import PublicNavbar from '@/components/shared/PublicNavbar';
import Footer from '@/components/shared/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-emerald-100">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-16 lg:pt-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column (7 cols): Content & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#F1E4CE] text-[#8C6226] text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-[#8C6226] text-[#8C6226]" />
            <span>A caring place to learn and grow</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Nurturing young minds, building bright futures.
          </h1>

          {/* Subparagraph */}
          <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
            Handahamy Educational Institute creates a safe, joyful and
            child-centered environment where every little learner is known,
            encouraged and inspired.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold shadow-sm transition"
            >
              <span>Explore admissions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <span>Parent login</span>
              <User className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>

          {/* 3 Metric Counters */}
          <div className="pt-6 grid grid-cols-3 gap-6 max-w-md border-t border-slate-100">
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                10+
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Years of care
              </p>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                250+
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Happy learners
              </p>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                15
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Dedicated educators
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Hero Image & Floating Badges */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
            <Image
              src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80"
              alt="Child engaged in creative learning activity at Handahamy"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Floating Card Top-Left */}
          <div className="absolute -top-3 -left-4 sm:left-2 bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5 z-10">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0C4A35] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                Safe & caring
              </p>
              <p className="text-[9px] text-slate-400 leading-tight">
                Child-first environment
              </p>
            </div>
          </div>

          {/* Floating Card Bottom-Right */}
          <div className="absolute -bottom-4 right-0 sm:right-4 bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5 z-10">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0C4A35] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                Parents connected
              </p>
              <p className="text-[9px] text-slate-400 leading-tight">
                Every step of the way
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      {/* Floating AI RAG Assistant Widget */}
      <ChatWidget />
    </div>
  );
}