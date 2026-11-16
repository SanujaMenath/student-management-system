'use server';

import { createClient } from '@/lib/supabase/server';

export interface DashboardMetrics {
  totalStudents: number;
  totalStaff: number;
  activeClasses: number;
  pendingAdmissions: number;
  outstandingFeesLKR: number;
  paidFeesLKR: number;
  feePercentage: number;
  upcomingEventsCount: number;
  nextEvent: {
    title: string;
    day: string;
    month: string;
    time: string;
    location: string;
  } | null;
  recentActivity: {
    title: string;
    description: string;
    timeAgo: string;
    initials: string;
  }[];
}

export async function getDashboardData(): Promise<DashboardMetrics> {
  const supabase = await createClient();

  // total students count
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  // active staff count
  const { count: staffCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'staff');

  // active classes count
  const { count: classCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true });

  // Pending Admissions Count
  const { count: pendingAdmissionsCount } = await supabase
    .from('admissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pending Review');

  // Fee Payments Totals
  const { data: fees } = await supabase
    .from('fee_payments')
    .select('amount, status');

  let paidTotal = 0;
  let pendingTotal = 0;

  if (fees && fees.length > 0) {
    fees.forEach((f) => {
      const amt = Number(f.amount) || 0;
      if (f.status === 'paid') paidTotal += amt;
      if (f.status === 'pending' || f.status === 'overdue') pendingTotal += amt;
    });
  }

  const grandTotal = paidTotal + pendingTotal;
  const feePercentage = grandTotal > 0 ? Math.round((paidTotal / grandTotal) * 100) : 100;

  // Upcoming Events
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: upcomingEvents, count: eventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact' })
    .gte('event_date', todayStr)
    .order('event_date', { ascending: true })
    .limit(1);

  let nextEvent = null;
  if (upcomingEvents && upcomingEvents.length > 0) {
    const raw = upcomingEvents[0];
    const eventDate = new Date(raw.event_date);
    nextEvent = {
      title: raw.title,
      day: String(eventDate.getDate()).padStart(2, '0'),
      month: eventDate.toLocaleString('default', { month: 'short' }).toUpperCase(),
      time: raw.start_time?.slice(0, 5) || '09:00',
      location: raw.location,
    };
  }

  // Recent Students Added
  const { data: recentStudents } = await supabase
    .from('students')
    .select('first_name, last_name, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  const recentActivity = (recentStudents || []).map((s) => ({
    title: 'New student added',
    description: `${s.first_name} ${s.last_name}`,
    timeAgo: 'Recently',
    initials: `${s.first_name[0] || 'N'}${s.last_name[0] || 'P'}`,
  }));

  return {
    totalStudents: studentCount ?? 0,
    totalStaff: staffCount ?? 0,
    activeClasses: classCount ?? 0,
    pendingAdmissions: pendingAdmissionsCount ?? 0,
    outstandingFeesLKR: pendingTotal,
    paidFeesLKR: paidTotal,
    feePercentage,
    upcomingEventsCount: eventsCount ?? 0,
    nextEvent,
    recentActivity,
  };
}