export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
export const ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

/** Returns an error message, or null when the file may be uploaded. */
export function validateDocumentFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `${file.name}: only PDF, JPG, JPEG and PNG files are allowed.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: file is larger than 10 MB.`;
  }
  if (file.size === 0) {
    return `${file.name}: file is empty.`;
  }
  return null;
}
