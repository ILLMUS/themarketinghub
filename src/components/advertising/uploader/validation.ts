// src/components/advertising/uploader/validation.ts

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const RECOMMENDED_WIDTH = 1200;
export const RECOMMENDED_HEIGHT = 250;

export const MIN_WIDTH = 1000;
export const MIN_HEIGHT = 200;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateBanner(file: File): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(
      "Only JPG, PNG and WEBP images are supported."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push("Maximum file size is 5 MB.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}