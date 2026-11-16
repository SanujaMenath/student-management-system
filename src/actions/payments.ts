'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface FeeInvoiceItem {
  id: string;
  invoice_number: string;
  student_id: string;
  term: string;
  billing_month: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'card' | 'bank_transfer' | 'cash' | 'online_gateway' | null;
  reference_no?: string | null;
  paid_at?: string | null;
  created_at: string;
  student?: {
    admission_number: string;
    first_name: string;
    last_name: string;
    classes?: { name: string } | null;
  } | null;
}

// Fetch Invoices for Admin Table
export async function getInvoices(statusFilter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('fee_invoices')
    .select(`
      id,
      invoice_number,
      student_id,
      term,
      billing_month,
      amount,
      amount_paid,
      due_date,
      status,
      payment_method,
      reference_no,
      paid_at,
      created_at,
      student:student_id (
        admission_number,
        first_name,
        last_name,
        classes:class_id ( name )
      )
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'All') {
    query = query.eq('status', statusFilter.toLowerCase());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching invoices:', error.message);
    return [];
  }

  return (data as unknown as FeeInvoiceItem[]) ?? [];
}

// Lookup Pending Invoice by Admission Number (Public Payment Portal)
export async function lookupStudentInvoice(admissionNumber: string) {
  const supabase = await createClient();
  const cleanIndex = admissionNumber.trim().toUpperCase();

  const { data, error } = await supabase.rpc('get_student_invoice_lookup', {
    p_admission_number: cleanIndex,
  });

  if (error || !data || !data.student) {
    return { error: 'No student found with admission index: ' + cleanIndex };
  }

  if (!data.invoice) {
    return { error: 'No outstanding pending fee found for this student.' };
  }

  return {
    student: data.student,
    invoice: data.invoice,
  };
}

// Process Public Payment Submission 
export async function processPortalPayment(params: {
  invoiceId: string;
  amount: number;
  paymentMethod: 'card' | 'online_gateway' | 'bank_transfer';
  referenceNo: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('fee_invoices')
    .update({
      status: 'paid',
      amount_paid: params.amount,
      payment_method: params.paymentMethod,
      reference_no: params.referenceNo,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.invoiceId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/fees');
  revalidatePath('/admin/dashboard');
  revalidatePath('/payments');

  return { success: true };
}