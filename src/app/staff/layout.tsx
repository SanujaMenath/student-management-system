

"use client";

import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  CalendarDays,
  LogOut,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  UserRound,
  X,
} from "lucide-react";

type StaffLayoutProps = {
  children: ReactNode;
};

type StaffProfile = {
  fullName: string;
  phone: string;
  email: string;
  notificationPreference: string;
};

const navigation = [
  {
    name: "Dashboard",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Students",
    href: "/staff/students",
    icon: Users,
  },
  {
    name: "Learning Materials",
    href: "/staff/learning-materials",
    icon: BookOpen,
  },
  {
    name: "Communication",
    href: "/staff/communication",
    icon: MessageSquare,
  },
  {
    name: "Schedule",
    href: "/staff/schedule",
    icon: CalendarDays,
  },
];

const initialProfile: StaffProfile = {
  fullName: "Dilani Fernando",
  phone: "+94 77 348 2190",
  email: "dilani@handahamy.edu.lk",
  notificationPreference: "Email and system notifications",
};

export default function StaffLayout({
  children,
}: StaffLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Header search
  const [headerSearch, setHeaderSearch] = useState("");

  // Logout popup
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Staff profile popup
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Saved profile for current session
  const [staffProfile, setStaffProfile] =
    useState<StaffProfile>(initialProfile);

  // Editable profile form
  const [profileForm, setProfileForm] =
    useState<StaffProfile>(initialProfile);

  const [profileSaved, setProfileSaved] = useState(false);

  // Get staff initials
  const staffInitials = staffProfile.fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const staffDisplayName = staffProfile.fullName.trim()
    ? `Ms. ${staffProfile.fullName.trim().split(/\s+/)[0]}`
    : "Staff Member";

  // Upper search
  const handleHeaderSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query = headerSearch.trim();

    if (query) {
      router.push(
        `/staff/students?search=${encodeURIComponent(query)}`
      );
    } else {
      router.push("/staff/students");
    }
  };

  // Open profile
  const openProfileModal = () => {
    setProfileForm({ ...staffProfile });
    setProfileSaved(false);
    setShowProfileModal(true);
  };

  // Close profile without saving
  const closeProfileModal = () => {
    setProfileForm({ ...staffProfile });
    setShowProfileModal(false);
  };

  // Save profile locally
  const handleSaveProfile = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setStaffProfile({ ...profileForm });
    setProfileSaved(true);
    setShowProfileModal(false);
  };

  // Logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // TODO: Connect the real authentication sign-out
      // once your team's Supabase authentication is ready.
      // A redirect alone does not terminate the session.

      setShowLogoutModal(false);
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F8F7]">

      {/* ================= SIDEBAR ================= */}
      <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-[#082F27] p-5 text-white">

        {/* Institute branding */}
        <div className="border-b border-white/15 pb-7">
          <h1 className="text-xl font-bold tracking-wide">
            HANDAHAMY
          </h1>

          <p className="mt-1 text-[11px] font-semibold tracking-widest text-white">
            EDUCATIONAL INSTITUTE
          </p>
        </div>

        {/* Portal label */}
        <div className="mb-5 mt-7 px-4">
          <p className="text-xs tracking-widest text-emerald-200/60">
            STAFF PORTAL
          </p>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex flex-col gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 rounded-xl px-4 py-4 text-sm transition-colors ${
                  isActive
                    ? "bg-[#187055] font-semibold text-white"
                    : "font-normal text-emerald-50/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span className="flex-1">
                  {item.name}
                </span>

                {isActive && (
                  <ChevronRight size={16} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= SIDEBAR BOTTOM ================= */}
        <div className="mt-auto space-y-3 pt-6">

          {/* Logout button */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-white/20 px-4 py-4 text-left text-sm font-semibold text-white transition-colors duration-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-400 focus-visible:text-red-400"
          >
            <LogOut
              size={20}
              className="transition-colors group-hover:text-red-400"
            />

            <span>Logout</span>
          </button>

          {/* Staff profile button */}
          <button
            type="button"
            onClick={openProfileModal}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9AC23] text-lg font-bold text-[#082F27]">
              {staffInitials || "MD"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {staffDisplayName}
              </p>

              <p className="mt-1 text-xs text-emerald-200/70">
                Class Teacher
              </p>
            </div>

            <ChevronDown
              size={18}
              className="shrink-0 text-white"
            />
          </button>
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top header */}
        <header className="flex min-h-24 items-center justify-between gap-6 border-b border-gray-200 bg-white px-6 lg:px-10">

          {/* Search bar */}
          <form
            onSubmit={handleHeaderSearch}
            className="flex w-full max-w-lg items-center gap-3 rounded-xl bg-[#F5F8F7] px-4 py-3"
          >
            <Search
              size={20}
              className="shrink-0 text-gray-400"
            />

            <input
              type="text"
              value={headerSearch}
              onChange={(event) =>
                setHeaderSearch(event.target.value)
              }
              placeholder="Search students..."
              aria-label="Search students"
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />

            {headerSearch && (
              <button
                type="button"
                onClick={() => {
                  setHeaderSearch("");
                  router.push("/staff/students");
                }}
                aria-label="Clear header search"
                className="text-gray-400 hover:text-[#082F27]"
              >
                <X size={18} />
              </button>
            )}
          </form>

          {/* Right header */}
          <div className="flex shrink-0 items-center gap-5">

            {/* Notification */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F8F7] text-[#082F27] hover:bg-[#E8F0EC]"
            >
              <Bell size={20} />

              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                3
              </span>
            </button>

            {/* Header profile */}
            <button
              type="button"
              onClick={openProfileModal}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#187055] text-sm font-semibold text-white">
                {staffInitials || "MD"}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#082F27]">
                  {staffDisplayName}
                </p>

                <p className="text-xs text-gray-500">
                  Staff Member
                </p>
              </div>

              <UserRound
                size={18}
                className="hidden text-gray-400 lg:block"
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-[#F5F8F7]">
          {children}
        </main>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#082F27]/75 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isLoggingOut) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[537px] rounded-[22px] bg-white px-9 py-9 shadow-2xl"
          >

            {/* Icon */}
            <div className="mx-auto flex h-[73px] w-[73px] items-center justify-center rounded-[20px] bg-[#FCECEC]">
              <LogOut
                size={28}
                className="text-[#D93636]"
              />
            </div>

            {/* Title */}
            <h2
              id="logout-title"
              className="mt-7 text-center text-[28px] font-semibold text-[#1D2925]"
            >
              Log out of your account?
            </h2>

            {/* Description */}
            <p
              id="logout-description"
              className="mt-1 text-center text-[14px] text-[#788781]"
            >
              You will need to sign in again to access the staff portal.
            </p>

            {/* Divider */}
            <div className="mt-7 border-t border-[#D9E2DE]" />

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="h-14 w-[163px] rounded-[14px] border border-[#B7D0C6] bg-white text-[16px] font-semibold text-[#086046] hover:bg-[#F5F8F7] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="h-14 w-[163px] rounded-[14px] bg-[#187055] text-[16px] font-semibold text-white hover:bg-[#145C46] disabled:opacity-50"
              >
                {isLoggingOut
                  ? "Logging out..."
                  : "Yes, log out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAFF PROFILE MODAL ================= */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#082F27]/75 p-4 backdrop-blur-sm"
          onClick={closeProfileModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-profile-title"
            onClick={(event) => event.stopPropagation()}
            className="my-auto w-full max-w-[775px] rounded-[22px] bg-white p-7 shadow-2xl sm:p-9"
          >

            {/* Modal header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#187055]">
                  MY ACCOUNT
                </p>

                <h2
                  id="staff-profile-title"
                  className="mt-4 text-[28px] font-semibold text-[#1D2925]"
                >
                  Staff profile
                </h2>
              </div>

              <button
                type="button"
                onClick={closeProfileModal}
                aria-label="Close staff profile"
                className="rounded-xl bg-[#F0F6F3] p-3 text-[#082F27] hover:bg-[#E2EEE8]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="my-7 border-t border-[#D9E2DE]" />

            {/* Profile summary */}
            <div className="flex items-center gap-4 rounded-2xl bg-[#F0F7F3] p-5">
              <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-[#187055] text-xl font-semibold text-white">
                {profileForm.fullName
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((part) => part[0].toUpperCase())
                  .slice(0, 2)
                  .join("") || "DF"}
              </div>

              <div>
                <p className="font-semibold text-[#1D2925]">
                  {profileForm.fullName || "Staff Member"}
                </p>

                <p className="mt-1 text-xs text-[#788781]">
                  Class Teacher · Bright Beginners
                </p>
              </div>
            </div>

            {/* Profile form */}
            <form
              onSubmit={handleSaveProfile}
              className="mt-7 space-y-5"
            >
              {/* Full name and phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="staff-full-name"
                    className="mb-2 block text-sm font-semibold text-[#1D2925]"
                  >
                    Full name
                  </label>

                  <input
                    id="staff-full-name"
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(event) =>
                      setProfileForm((previous) => ({
                        ...previous,
                        fullName: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#CBDCD4] px-4 py-4 text-sm font-medium text-[#1D2925] outline-none focus:border-[#187055]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="staff-phone"
                    className="mb-2 block text-sm font-semibold text-[#1D2925]"
                  >
                    Phone
                  </label>

                  <input
                    id="staff-phone"
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#CBDCD4] px-4 py-4 text-sm font-medium text-[#1D2925] outline-none focus:border-[#187055]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="staff-email"
                  className="mb-2 block text-sm font-semibold text-[#1D2925]"
                >
                  Email address
                </label>

                <input
                  id="staff-email"
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#CBDCD4] px-4 py-4 text-sm font-medium text-[#1D2925] outline-none focus:border-[#187055]"
                />
              </div>

              {/* Notification preference */}
              <div>
                <label
                  htmlFor="staff-notifications"
                  className="mb-2 block text-sm font-semibold text-[#1D2925]"
                >
                  Notification preference
                </label>

                <select
                  id="staff-notifications"
                  value={profileForm.notificationPreference}
                  onChange={(event) =>
                    setProfileForm((previous) => ({
                      ...previous,
                      notificationPreference: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#CBDCD4] bg-white px-4 py-4 text-sm font-medium text-[#1D2925] outline-none focus:border-[#187055]"
                >
                  <option value="Email and system notifications">
                    Email and system notifications
                  </option>
                  <option value="Email notifications only">
                    Email notifications only
                  </option>
                  <option value="System notifications only">
                    System notifications only
                  </option>
                  <option value="No notifications">
                    No notifications
                  </option>
                </select>
              </div>

              {/* Footer buttons */}
              <div className="flex flex-wrap justify-end gap-3 border-t border-[#D9E2DE] pt-6">
                <button
                  type="button"
                  onClick={closeProfileModal}
                  className="rounded-xl border border-[#B7D0C6] px-6 py-4 font-semibold text-[#086046] hover:bg-[#F5F8F7]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#187055] px-6 py-4 font-semibold text-white hover:bg-[#145C46]"
                >
                  Save profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
