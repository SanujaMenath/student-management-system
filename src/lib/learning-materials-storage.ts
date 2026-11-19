import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Storage constants for the Learning Materials module
 */
export const LEARNING_MATERIALS_BUCKET = 'learning-materials';
export const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour (3600 seconds)

/**
 * Result interfaces for Storage operations
 */
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

/**
 * Parameters required to upload a learning material file
 */
export interface UploadFileParams {
  supabase: SupabaseClient;
  classId: number | string;
  uploaderProfileId: string;
  file: File | Blob | Buffer | Uint8Array;
  fileName: string;
  contentType?: string;
}

/**
 * Extracts and sanitizes the file extension from a filename
 */
function getSanitizedExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return '';
  }
  const rawExt = fileName.slice(lastDotIndex + 1).toLowerCase().trim();
  // Keep only alphanumeric characters in extension
  return rawExt.replace(/[^a-z0-9]/g, '');
}

/**
 * Constructs a storage object path matching the required convention:
 * `classes/<class_id>/<uploader_profile_id>/<file_uuid>.<extension>`
 */
export function buildLearningMaterialStoragePath(
  classId: number | string,
  uploaderProfileId: string,
  originalFileName: string,
  customFileUuid?: string
): string {
  const fileUuid = customFileUuid || randomUUID();
  const ext = getSanitizedExtension(originalFileName);
  const fileNameWithExt = ext ? `${fileUuid}.${ext}` : fileUuid;

  return `classes/${classId}/${uploaderProfileId}/${fileNameWithExt}`;
}

/**
 * 1. Uploads a file to the private 'learning-materials' Supabase Storage bucket
 * 
 * Enforces the path convention:
 * classes/<class_id>/<uploader_profile_id>/<file_uuid>.<extension>
 */
export async function uploadLearningMaterialFile(
  params: UploadFileParams
): Promise<StorageUploadResult> {
  const {
    supabase,
    classId,
    uploaderProfileId,
    file,
    fileName,
    contentType,
  } = params;

  if (!classId || !uploaderProfileId || !file || !fileName) {
    return {
      success: false,
      storagePath: null,
      error: 'Missing required upload parameters (classId, uploaderProfileId, file, or fileName).',
    };
  }

  const storagePath = buildLearningMaterialStoragePath(
    classId,
    uploaderProfileId,
    fileName
  );

  try {
    const { error: uploadError } = await supabase.storage
      .from(LEARNING_MATERIALS_BUCKET)
      .upload(storagePath, file, {
        contentType,
        upsert: false, // Immutability: prevent accidental overwriting
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
  } catch (err) {
    return {
      success: false,
      storagePath: null,
      error: err instanceof Error ? err.message : 'Unknown storage upload error occurred.',
    };
  }
}

/**
 * 2. Deletes a file from the private 'learning-materials' bucket using its storage path
 */
export async function deleteLearningMaterialFile(
  supabase: SupabaseClient,
  storagePath: string
): Promise<StorageDeleteResult> {
  if (!storagePath || storagePath.trim() === '') {
    return {
      success: false,
      error: 'Storage path must be provided for deletion.',
    };
  }

  try {
    const { error: deleteError } = await supabase.storage
      .from(LEARNING_MATERIALS_BUCKET)
      .remove([storagePath]);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown storage deletion error occurred.',
    };
  }
}

/**
 * 3. Generates a temporary signed download URL (default: 3600 seconds / 1 hour)
 * for secure file access without exposing permanent public URLs
 */
export async function getLearningMaterialSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds: number = DEFAULT_SIGNED_URL_EXPIRY_SECONDS
): Promise<StorageSignedUrlResult> {
  if (!storagePath || storagePath.trim() === '') {
    return {
      signedUrl: null,
      error: 'Storage path must be provided to generate a signed download URL.',
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from(LEARNING_MATERIALS_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return {
        signedUrl: null,
        error: error ? error.message : 'Failed to generate signed download URL.',
      };
    }

    return {
      signedUrl: data.signedUrl,
      error: null,
    };
  } catch (err) {
    return {
      signedUrl: null,
      error: err instanceof Error ? err.message : 'Unknown signed URL generation error occurred.',
    };
  }
}

