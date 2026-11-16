"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Receipt,
  XCircle,
} from "lucide-react";
import { lookupStudentInvoice } from "@/actions/payments";
import { createStripeCheckoutSession, verifyAndMarkInvoicePaid } from "@/actions/stripe";

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("status");
  const paidInvoiceNo = searchParams.get("invoice_no");

  const [admissionIndex, setAdmissionIndex] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    student: any;
    invoice: any;
  } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionIndex.trim()) return;

    setErrorMsg(null);
    setPaymentData(null);
    setLoading(true);

    try {
      const res = await lookupStudentInvoice(admissionIndex);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setPaymentData(res as any);
      }
    } catch {
      setErrorMsg("Failed to fetch invoice. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (paymentStatus === "success" && paidInvoiceNo) {
      verifyAndMarkInvoicePaid(paidInvoiceNo);
    }
  }, [paymentStatus, paidInvoiceNo]);
  
  const handleStripeCheckout = async () => {
    if (!paymentData) return;
    setIsRedirecting(true);
    setErrorMsg(null);

    const res = await createStripeCheckoutSession({
      invoiceId: paymentData.invoice.id,
      invoiceNumber: paymentData.invoice.invoice_number,
      amountLKR: Number(paymentData.invoice.amount),
      studentName: `${paymentData.student.first_name} ${paymentData.student.last_name}`,
      admissionNumber: paymentData.student.admission_number,
      billingMonth: paymentData.invoice.billing_month,
    });

    if (res?.error) {
      setErrorMsg(res.error);
      setIsRedirecting(false);
      return;
    }

    if (res?.url) {
      window.location.href = res.url;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider uppercase text-slate-900">
              HANDAHAMY
            </span>
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-semibold">
              EDUCATIONAL INSTITUTE
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-1">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0C4A35] text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Stripe Encrypted Payment</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Handahamy Tuition & Care Fees
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Enter your child&apos;s Admission Number (e.g. HDM-0241) to look up
            outstanding invoices and proceed to Stripe checkout.
          </p>
        </div>

        {/* Success Banner */}
        {paymentStatus === "success" && (
          <div className="bg-white rounded-3xl p-8 max-w-md mx-auto border border-emerald-100 shadow-xl text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Payment Completed!
            </h3>
            <p className="text-xs text-slate-500">
              Invoice{" "}
              <strong className="text-slate-800">{paidInvoiceNo}</strong> has
              been successfully cleared via Stripe.
            </p>
            <Link
              href="/payments"
              className="inline-block w-full py-3 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold transition"
            >
              Done
            </Link>
          </div>
        )}

        {/* Cancellation Alert */}
        {paymentStatus === "cancelled" && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3 max-w-md mx-auto mb-8">
            <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Checkout was cancelled. No charges were made to your account.
            </span>
          </div>
        )}

        {paymentStatus !== "success" && (
          <div className="space-y-6">
            {/* Lookup Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-lg mx-auto">
              <form onSubmit={handleLookup} className="space-y-4">
                <label className="block text-xs font-bold text-slate-800">
                  Student Admission ID
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={admissionIndex}
                    onChange={(e) => setAdmissionIndex(e.target.value)}
                    placeholder="e.g. HDM-0241"
                    className="w-full pl-10 pr-4 py-3 text-xs uppercase tracking-wider rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
                >
                  {loading ? "Searching Records..." : "Check Outstanding Fees"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Invoice Review & Stripe Checkout Card */}
            {paymentData && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-5 h-5 text-[#0C4A35]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Invoice {paymentData.invoice.invoice_number}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Awaiting Payment
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Student:</span>
                    <span className="font-bold text-slate-900">
                      {paymentData.student.first_name}{" "}
                      {paymentData.student.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Class / Program:</span>
                    <span className="font-semibold text-slate-800">
                      {paymentData.student.classes?.name || "Enrolled"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Billing Term:</span>
                    <span className="text-slate-800">
                      {paymentData.invoice.term} (
                      {paymentData.invoice.billing_month})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Due Date:</span>
                    <span className="text-slate-800">
                      {paymentData.invoice.due_date}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
                    <span>Total Due:</span>
                    <span className="text-xl text-[#0C4A35]">
                      LKR {Number(paymentData.invoice.amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <button
                    onClick={handleStripeCheckout}
                    disabled={isRedirecting}
                    className="w-full py-3.5 rounded-xl bg-[#0C4A35] hover:bg-[#072B20] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {isRedirecting
                        ? "Redirecting to Stripe..."
                        : `Pay LKR ${Number(paymentData.invoice.amount).toLocaleString()} with Card`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        Handahamy Educational Institute · Payments secured by Stripe
      </footer>
    </div>
  );
}
