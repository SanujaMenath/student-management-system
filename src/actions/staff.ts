'use server';

import { createClient } from '@/lib/supabase/server';
import type { StudentRecord } from '@/actions/students';

export async function getStaffStudents(): Promise<StudentRecord[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('You must be logged in to view students.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'staff') {
    throw new Error('Only staff members can access this page.');
  }

  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (staffError) {
    throw new Error(staffError.message);
  }

  if (!staff) {
    return [];
  }

  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', staff.id);

  if (classesError) {
    throw new Error(classesError.message);
  }

  const classIds = (classes ?? []).map((item) => item.id);

  if (classIds.length === 0) {
    return [];
  }

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select(`
      id,
      admission_number,
      first_name,
      last_name,
      date_of_birth,
      gender,
      blood_group,
      allergies,
      emergency_contact,
      class_id,
      parent_id,
      status,
      created_at,
      classes:class_id ( name ),
      parent:parent_id ( full_name, phone )
    `)
    .in('class_id', classIds)
    .order('created_at', { ascending: false });

  if (studentsError) {
    throw new Error(studentsError.message);
  }

  return (students as unknown as StudentRecord[]) ?? [];
}
export async function getStaffName(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "staff") {
    throw new Error("Only staff members can access this page.");
  }

  return profile.full_name || "Staff Member";
}


export async function saveStudentProgress(input: {
  studentId: string;
  learningArea: string;
  progressLevel: string;
  teacherNote: string;
}): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "staff") {
    throw new Error("Only staff members can record progress.");
  }

  const validLearningAreas = [
    "Language and literacy",
    "Numeracy",
    "Creative activities",
    "Social development",
    "Physical development",
  ];

  const validProgressLevels = [
    "Excellent progress",
    "Developing well",
    "Needs reading support",
  ];

  if (
    !input.studentId ||
    !validLearningAreas.includes(input.learningArea) ||
    !validProgressLevels.includes(input.progressLevel)
  ) {
    throw new Error("Invalid progress information.");
  }

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (staffError || !staff) {
    throw new Error("Staff account not found.");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, class_id")
    .eq("id", input.studentId)
    .maybeSingle();

  if (studentError || !student?.class_id) {
    throw new Error("Student not found.");
  }

  const { data: assignedClass, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("id", student.class_id)
    .eq("teacher_id", staff.id)
    .maybeSingle();

  if (classError) {
    throw new Error(classError.message);
  }

  if (!assignedClass) {
    throw new Error("You are not assigned to this student.");
  }

  const { error: insertError } = await supabase
    .from("student_progress")
    .insert({
      student_id: input.studentId,
      staff_id: user.id,
      learning_area: input.learningArea,
      progress_level: input.progressLevel,
      teacher_note: input.teacherNote.trim() || null,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }
}


export async function getStaffStudentProgress(): Promise<
  { student_id: string; progress_level: string }[]
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "staff") {
    throw new Error("Only staff members can view progress.");
  }

  const { data, error } = await supabase
    .from("student_progress")
    .select("student_id, progress_level")
    .order("recorded_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Keep the latest recorded progress for each student.
  const latest = new Map<string, string>();

  for (const record of data ?? []) {
    if (!latest.has(record.student_id)) {
      latest.set(record.student_id, record.progress_level);
    }
  }

  return Array.from(latest, ([student_id, progress_level]) => ({
    student_id,
    progress_level,
  }));
}
