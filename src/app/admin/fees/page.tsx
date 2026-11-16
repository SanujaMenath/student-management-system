'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { getInvoices, FeeInvoiceItem } from '@/actions/payments';

export default function AdminFeesPage() {
  const [invoices, setInvoices] = useState<FeeInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.toLowerCase().trim();
      const studentName = `${inv.student?.first_name || ''} ${inv.student?.last_name || ''}`.toLowerCase();
      const admNum = (inv.student?.admission_number || '').toLowerCase();
      const invNum = inv.invoice_number.toLowerCase();

      const matchesSearch =
        q === '' ||
        studentName.includes(q) ||
        admNum.includes(q) ||
        invNum.includes(q);

      const matchesStatus =
        statusFilter === 'All' || inv.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let collected = 0;
    let pending = 0;
    invoices.forEach((i) => {
      if (i.status === 'paid') collected += Number(i.amount_paid);
      if (i.status === 'pending') pending += Number(i.amount);
    });
    return { collected, pending };
  }, [invoices]);

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          ADMINISTRATOR CONSOLE
        </p>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Fees & Billing Management
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor tuition settlements, outstanding balances, and transaction logs.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Collected Fees</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            LKR {metrics.collected.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 mt-1">Directly cleared through portal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Outstandings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            LKR {metrics.pending.toLocaleString()}
          </p>
          <p className="text-[10px] text-amber-600 mt-1">Awaiting parent action</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {invoices.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Term 3 cycle</p>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number, student name, admission ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#0C4A35]/20 focus:border-[#0C4A35]"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-3.5 pr-8 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-t border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                <th className="py-3 px-5">INVOICE NO</th>
                <th className="py-3 px-5">STUDENT</th>
                <th className="py-3 px-5">TERM & MONTH</th>
                <th className="py-3 px-5">AMOUNT</th>
                <th className="py-3 px-5">DUE DATE</th>
                <th className="py-3 px-5">STATUS</th>
                <th className="py-3 px-5 text-right">REFERENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {inv.invoice_number}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800">
                        {inv.student?.first_name} {inv.student?.last_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {inv.student?.admission_number}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {inv.term} · {inv.billing_month}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900">
                      LKR {Number(inv.amount).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-slate-500">
                      {inv.due_date}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-slate-500 text-[11px]">
                      {inv.reference_no || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}