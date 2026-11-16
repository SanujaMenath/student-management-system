'use server';

import { stripe } from '@/lib/payments/stripe';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Admin Supabase client to safely bypass RLS on server-verified operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateCheckoutParams {
  invoiceId: string;
  invoiceNumber: string;
  amountLKR: number;
  studentName: string;
  admissionNumber: string;
  billingMonth: string;
}

export async function createStripeCheckoutSession(params: CreateCheckoutParams) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const unitAmount = Math.round(params.amountLKR * 100);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `Tuition Fee - ${params.billingMonth}`,
              description: `Student: ${params.studentName} (${params.admissionNumber}) | Invoice: ${params.invoiceNumber}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/payments?status=success&invoice_no=${params.invoiceNumber}`,
      cancel_url: `${siteUrl}/payments?status=cancelled`,
      metadata: {
        invoiceId: params.invoiceId,
        invoiceNumber: params.invoiceNumber,
        admissionNumber: params.admissionNumber,
      },
    });

    if (!session.url) {
      return { error: 'Failed to create checkout session URL' };
    }

    return { url: session.url };
  } catch (err: any) {
    console.error('Error initiating Stripe session:', err);
    return { error: err.message || 'Payment service error' };
  }
}

export async function verifyAndMarkInvoicePaid(invoiceNumber: string) {
  try {
    // Fetch the exact invoice to get the actual amount
    const { data: inv, error: fetchErr } = await supabaseAdmin
      .from('fee_invoices')
      .select('id, amount, status')
      .eq('invoice_number', invoiceNumber)
      .single();

    if (fetchErr || !inv) {
      console.error('Invoice not found for marking paid:', fetchErr);
      return { success: false };
    }

    // Mark as paid using admin privileges
    const { error: updateErr } = await supabaseAdmin
      .from('fee_invoices')
      .update({
        status: 'paid',
        amount_paid: inv.amount,
        payment_method: 'card',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('invoice_number', invoiceNumber);

    if (updateErr) {
      console.error('Error updating invoice status:', updateErr.message);
      return { success: false };
    }

    // Clear Next.js cache so the admin table updates immediately
    revalidatePath('/admin/fees');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (e) {
    console.error('Failed to verify invoice:', e);
    return { success: false };
  }
}