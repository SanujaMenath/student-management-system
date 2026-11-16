import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DoorOpen,
  Receipt,
  MessageSquare,
  Calendar,
  Image,
  FileBarChart,
} from 'lucide-react';

export const adminNavItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Students', href: '/admin/students', icon: GraduationCap },
  { title: 'Staff', href: '/admin/staff', icon: Users },
  { title: 'Classes', href: '/admin/classes', icon: DoorOpen },
  { title: 'Admissions', href: '/admin/admissions', icon: GraduationCap },
  { title: 'Fees & Billing', href: '/admin/fees', icon: Receipt },
  { title: 'Communications', href: '/admin/communications', icon: MessageSquare },
  { title: 'Events', href: '/admin/events', icon: Calendar },
  { title: 'Gallery', href: '/admin/gallery', icon: Image },
  { title: 'Reports', href: '/admin/reports', icon: FileBarChart },
];