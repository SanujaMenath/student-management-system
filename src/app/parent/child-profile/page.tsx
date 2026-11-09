import {
  AlertTriangle,
  CalendarCheck,
  Droplet,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  ShieldPlus,
  UserRound,
} from 'lucide-react';

// Mock data – replace with a server action (e.g. getChildProfile) later
const child = {
  firstName: 'Amaya',
  lastName: 'Wijesinghe',
  admissionNumber: 'HDH-2026-4821',
  dateOfBirth: '2022-03-14',
  age: '4 years 7 months',
  gender: 'Female',
  className: 'Bright Beginners',
  classTeacher: 'Ms. Nimali Perera',
  room: 'Room 01',
  status: 'Active',
  bloodGroup: 'O+',
  allergies: 'Peanuts, dust',
  medicalNotes: 'Carries no regular medication.',
  emergencyContact: '+94 77 123 4567',
  guardian: { name: 'Sanjaya Wijesinghe', relation: 'Father', phone: '+94 71 987 6543', email: 'parent@handahamy.edu.lk' },
  attendance: { present: 42, absent: 3, rate: 93 },
};

const progress = [
  { subject: 'English', level: 'Developing well', score: 78, color: 'bg-[#0C4A35]' },
  { subject: 'Mathematics', level: 'Excellent', score: 90, color: 'bg-[#D28A20]' },
  { subject: 'Environmental Studies', level: 'Developing well', score: 74, color: 'bg-[#4E7D9A]' },
  { subject: 'General Knowledge', level: 'Good', score: 82, color: 'bg-[#A03C3C]' },
  { subject: 'Art and Craft', level: 'Excellent', score: 95, color: 'bg-[#7D4E9A]' },
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-50 py-2.5 text-xs last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5EEE9] text-[#14533E]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function ChildProfilePage() {
  const initials = `${child.firstName[0]}${child.lastName[0]}`;
  const formattedDob = new Date(child.dateOfBirth).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-7 text-slate-900">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Child profile</h2>
        <p className="mt-1 text-xs text-slate-500">View your child&apos;s details, health information and progress.</p>
      </div>

      {/* Profile header */}
      <section className="flex flex-col gap-5 rounded-3xl bg-[#0e3b2e] p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E5A93C] text-2xl font-extrabold text-slate-900">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-extrabold tracking-tight">
              {child.firstName} {child.lastName}
            </h3>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              {child.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-100/80">
            Admission No: <span className="font-semibold text-white">{child.admissionNumber}</span>
          </p>
          <p className="mt-0.5 text-xs text-emerald-100/80">
            {child.className} · {child.room} · {child.age}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          <Pencil className="h-3.5 w-3.5" />
          Request update
        </button>
      </section>

      {/* Allergy alert */}
      {child.allergies && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <span>
            <strong>Allergy notice:</strong> {child.allergies}. Our staff have been informed.
          </span>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Personal information" icon={UserRound}>
          <InfoRow label="Full name" value={`${child.firstName} ${child.lastName}`} />
          <InfoRow label="Date of birth" value={formattedDob} />
          <InfoRow label="Gender" value={child.gender} />
          <InfoRow label="Admission number" value={child.admissionNumber} />
        </Card>

        <Card title="Class details" icon={GraduationCap}>
          <InfoRow label="Class" value={child.className} />
          <InfoRow label="Class teacher" value={child.classTeacher} />
          <InfoRow label="Room" value={child.room} />
          <InfoRow label="Status" value={child.status} />
        </Card>

        <Card title="Health information" icon={ShieldPlus}>
          <div className="mb-1 flex items-center gap-2 text-xs">
            <Droplet className="h-3.5 w-3.5 text-red-500" />
            <span className="text-slate-500">Blood group</span>
            <span className="ml-auto font-semibold text-slate-900">{child.bloodGroup}</span>
          </div>
          <InfoRow label="Allergies" value={child.allergies} />
          <InfoRow label="Medical notes" value={child.medicalNotes} />
        </Card>

        <Card title="Guardian & emergency contact" icon={Phone}>
          <InfoRow label="Guardian" value={`${child.guardian.name} (${child.guardian.relation})`} />
          <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500"><Phone className="h-3.5 w-3.5" />Phone</span>
            <span className="font-semibold">{child.guardian.phone}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500"><Mail className="h-3.5 w-3.5" />Email</span>
            <span className="font-semibold">{child.guardian.email}</span>
          </div>
          <InfoRow label="Emergency contact" value={child.emergencyContact} />
        </Card>
      </div>

      {/* Attendance + progress */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Attendance this term" icon={CalendarCheck}>
          <div className="text-4xl font-extrabold text-[#14533E]">{child.attendance.rate}%</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#14533E]" style={{ width: `${child.attendance.rate}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-xl bg-[#E5EEE9] p-3">
              <div className="text-lg font-bold text-[#14533E]">{child.attendance.present}</div>
              <div className="text-slate-500">Days present</div>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <div className="text-lg font-bold text-red-600">{child.attendance.absent}</div>
              <div className="text-slate-500">Days absent</div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card title="Learning progress" icon={GraduationCap}>
            <div className="space-y-4">
              {progress.map((p) => (
                <div key={p.subject}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{p.subject}</span>
                    <span className="text-slate-400">{p.level}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}