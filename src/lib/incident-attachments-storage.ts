import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Storage constants for Incident Attachments (Staff & Admin Communication Module)
 */
export const INCIDENT_ATTACHMENTS_BUCKET = 'incident-attachments';
export const MAX_INCIDENT_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB limit
export const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Canonical MIME types mapped by file extension
 */
export const CANONICAL_MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const SUPPORTED_EXTENSIONS = Object.keys(CANONICAL_MIME_BY_EXT);

/**
 * Compatible browser/client MIME variations allowed for each extension
 */
export const COMPATIBLE_MIMES_BY_EXT: Record<string, string[]> = {
  pdf: [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'applications/vnd.pdf',
    'text/pdf',
    'text/x-pdf',
  ],
  doc: [
    'application/msword',
    'application/doc',
    'appl/text',
    'application/vnd.msword',
    'application/vnd.ms-word',
    'application/winword',
    'application/word',
    'application/x-msw',
    'application/x-msword',
  ],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip',
  ],
  jpg: ['image/jpeg', 'image/pjpeg', 'image/jpg'],
  jpeg: ['image/jpeg', 'image/pjpeg', 'image/jpg'],
  png: ['image/png', 'image/x-png'],
  webp: ['image/webp'],
};

export interface StorageUploadResult {
  success: boolean;
  storagePath: string | null;
  error: string | null;
}

export interface StorageDeleteResult {
  success: boolean;
  error: string | null;
}

export interface StorageSignedUrlResult {
  signedUrl: string | null;
  error: string | null;
}

export interface UploadIncidentFileParams {
  supabase: SupabaseClient;
  reporterProfileId: string;
  file: File | Blob | Buffer | Uint8Array;
  fileName: string;
  contentType?: string;
}

/**
 * Extracts and sanitizes the file extension from a filename.
 * Rejects filenames lacking a name prefix (e.g. '.pdf') or trailing dots (e.g. 'report.').
 */
export function getSanitizedExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
    return '';
  }
  const rawExt = fileName.slice(lastDotIndex + 1).toLowerCase().trim();
  return rawExt.replace(/[^a-z0-9]/g, '');
}

/**
 * Validates and resolves the canonical MIME type based on extension and browser MIME.
 */
export function resolveIncidentAttachmentMimeType(
  fileName: string,
  browserMime?: string
): { valid: boolean; canonicalMime?: string; error?: string } {
  const ext = getSanitizedExtension(fileName);
  if (!ext || !CANONICAL_MIME_BY_EXT[ext]) {
    return {
      valid: false,
      error: `Unsupported file extension ".${ext || 'unknown'}". Supported extensions are: ${SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(', ')}.`,
    };
  }

  const canonicalMime = CANONICAL_MIME_BY_EXT[ext];
  const trimmedMime = (browserMime || '').trim().toLowerCase();

  // Empty or generic application/octet-stream fallback safely to canonical MIME
  if (!trimmedMime || trimmedMime === 'application/octet-stream') {
    return { valid: true, canonicalMime };
  }

  const allowedMimes = COMPATIBLE_MIMES_BY_EXT[ext] || [canonicalMime];
  if (allowedMimes.includes(trimmedMime)) {
    return { valid: true, canonicalMime };
  }

  return {
    valid: false,
    error: `Incompatible MIME type "${browserMime}" for extension ".${ext}". Expected "${canonicalMime}".`,
  };
}

/**
 * Constructs a storage object path matching the required convention:
 * `incidents/<reporter_profile_id>/<file_uuid>.<extension>`
 */
export function buildIncidentAttachmentStoragePath(
  reporterProfileId: string,
  originalFileName: string,
  customFileUuid?: string
): string {
  const fileUuid = customFileUuid || randomUUID();
  const ext = getSanitizedExtension(originalFileName);
  const fileNameWithExt = ext ? `${fileUuid}.${ext}` : fileUuid;

  return `incidents/${reporterProfileId}/${fileNameWithExt}`;
}

/**
 * Uploads an attachment to the private 'incident-attachments' Supabase Storage bucket.
 */
export async function uploadIncidentAttachmentFile(
  params: UploadIncidentFileParams
): Promise<StorageUploadResult> {
  const { supabase, reporterProfileId, file, fileName, contentType } = params;

  if (!reporterProfileId || !file || !fileName) {
    return {
      success: false,
      storagePath: null,
      error: 'Missing required upload parameters (reporterProfileId, file, or fileName).',
    };
  }

  const mimeResolution = resolveIncidentAttachmentMimeType(fileName, contentType);
  if (!mimeResolution.valid || !mimeResolution.canonicalMime) {
    return {
      success: false,
      storagePath: null,
      error: mimeResolution.error || 'Invalid file format.',
    };
  }

  const storagePath = buildIncidentAttachmentStoragePath(
    reporterProfileId,
    fileName
  );

  const { error: uploadError } = await supabase.storage
    .from(INCIDENT_ATTACHMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeResolution.canonicalMime,
      upsert: false,
    });

  if (uploadError) {
    return {
      success: false,
      storagePath: null,
      error: uploadError.message,
    };
  }

  return {
    success: true,
    storagePath,
    error: null,
  };
}

/**
 * Deletes an attachment from the private 'incident-attachments' storage bucket.
 * Used for atomic rollbacks and cleanup.
 */
export async function deleteIncidentAttachmentFile(
  supabase: SupabaseClient,
  storagePath: string
): Promise<StorageDeleteResult> {
  if (!storagePath) {
    return { success: false, error: 'Storage path is required.' };
  }

  const { error } = await supabase.storage
    .from(INCIDENT_ATTACHMENTS_BUCKET)
    .remove([storagePath]);

  if (error) {
    return {
      success: false,
      error: `Failed to remove storage object: ${error.message}`,
    };
  }

  return { success: true, error: null };
}

/**
 * Generates a temporary signed URL for downloading an incident attachment.
 */
export async function getIncidentAttachmentSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn: number = DEFAULT_SIGNED_URL_EXPIRY_SECONDS
): Promise<StorageSignedUrlResult> {
  if (!storagePath) {
    return { signedUrl: null, error: 'Storage path is required.' };
  }

  const { data, error } = await supabase.storage
    .from(INCIDENT_ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    return {
      signedUrl: null,
      error: error?.message || 'Could not generate signed download URL.',
    };
  }

  return {
    signedUrl: data.signedUrl,
    error: null,
  };
}
