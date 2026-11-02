'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, ArrowLeft, HelpCircle } from 'lucide-react';
import { login } from '@/actions/auth';

type Role = 'Admin' | 'Staff' | 'Parent';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('Parent');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    formData.append('expectedRole', selectedRole.toLowerCase());

    startTransition(async () => {
      const res = await login(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      }
    });
  };

  const getPlaceholderEmail = () => {
    switch (selectedRole) {
      case 'Admin':
        return 'admin@handahamy.edu.lk';
      case 'Staff':
        return 'staff@handahamy.edu.lk';
      case 'Parent':
      default:
        return 'parent@handahamy.edu.lk';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F7F9F8]">
      {/* Left Panel: Deep Green Branding */}
      <div className="relative w-full lg:w-[48%] bg-[#0e3b2e] text-white p-8 lg:p-16 flex flex-col justify-between overflow-hidden">
        {/* Subtle curved background overlay */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white/[0.03] pointer-events-none" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full border-[50px] border-white/[0.02] pointer-events-none" />

        {/* Brand Header */}
        <div className="z-10">
          <h1 className="text-xl font-bold tracking-wider uppercase">
            Handahamy
          </h1>
          <p className="text-[10px] tracking-widest text-emerald-200 uppercase font-medium">
            Educational Institute
          </p>
        </div>

        {/* Hero Message */}
        <div className="my-16 lg:my-0 max-w-lg z-10">
          <p className="text-xs font-semibold tracking-widest text-emerald-300 uppercase mb-4">
            Handahamy Community Portal
          </p>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Connected care for every child&apos;s journey.
          </h2>
          <p className="text-sm lg:text-base text-emerald-100/80 leading-relaxed font-light">
            One secure place for families, educators and administrators to learn,
            communicate and grow together.
          </p>
        </div>

        {/* Footer Credit */}
        <div className="z-10">
          <p className="text-xs text-emerald-200/60 font-light">
            Student Management System · IS Group 06
          </p>
        </div>
      </div>

      {/* Right Panel: Login Card */}
      <div className="relative w-full lg:w-[52%] flex flex-col justify-between items-center p-6 lg:p-12">
        {/* Top Back Link */}
        <div className="w-full flex justify-end">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-[#0e3b2e] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to website
          </Link>
        </div>

        {/* Centered Login Card */}
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.07)] border border-slate-100 my-8">
          {/* Card Icon Header */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center mb-6 text-[#0e3b2e]">
            <Lock className="w-5 h-5 text-[#14533e]" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Sign in securely to access your portal.
          </p>

          {/* Role Switcher Tabs */}
          <div className="flex bg-[#F2F5F3] p-1.5 rounded-2xl mb-6">
            {(['Admin', 'Staff', 'Parent'] as Role[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
                  selectedRole === role
                    ? 'bg-white text-[#14533e] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder={getPlaceholderEmail()}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14533e] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14533e] focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="w-4 h-4 rounded border-slate-300 text-[#14533e] focus:ring-[#14533e]"
                />
                <span className="text-xs text-slate-600">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-[#14533e] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#14533e] hover:bg-[#0e3b2e] text-white text-sm font-semibold shadow-sm transition disabled:opacity-60"
            >
              {isPending
                ? 'Authenticating...'
                : `Sign in as ${selectedRole.toLowerCase()}`}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 flex items-start space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
            <p className="text-[11px] leading-tight text-slate-500">
              Role-based access keeps student information private and secure.
            </p>
          </div>
        </div>

        {/* Floating Help Icon */}
        <div className="w-full flex justify-end">
          <button
            type="button"
            aria-label="Help and support"
            className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}