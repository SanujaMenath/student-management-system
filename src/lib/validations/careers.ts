import { z } from 'zod';

export const MAX_CV_SIZE = 5 * 1024 * 1024;

export const careerApplicationTextSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(20, 'Phone number is too long'),
  position: z.enum([
    'Teaching Assistant',
    'Early Childhood Educator',
    'Assistant Administrative Officer',
    'other',
  ], {
    message: 'Select a position',
  }),
  cover_message: z.string().trim().min(20, 'Cover message must be at least 20 characters'),
});

export function validateCareerCv(file: File) {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension =
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.docx');

  if (file.size === 0) return 'Select a valid CV file';
  if (file.size > MAX_CV_SIZE) return 'CV must be 5 MB or smaller';
  if (!hasAllowedExtension) return 'CV must be a PDF, DOC, or DOCX file';
  return null;
}
