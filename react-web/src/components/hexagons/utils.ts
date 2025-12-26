/**
 * Shared utilities for hex content components
 */

/**
 * Process avatar URLs - handles various formats and returns a usable URL or undefined
 * @param avatarPath - The avatar path from the user object
 * @returns A valid URL string or undefined if no valid avatar
 */
export function processAvatarUrl(avatarPath: string | null | undefined): string | undefined {
  if (!avatarPath) return undefined;

  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }

  // If it's a storage ID (like 'gcp/filename.jpg'), we need to generate a signed URL
  // For now, we'll return undefined to show initials instead
  // TODO: Implement signed URL generation on frontend or fix backend getAllUsers method
  if (avatarPath.startsWith('gcp/')) {
    console.log('Avatar image needs signed URL generation:', avatarPath);
    return undefined;
  }

  return avatarPath;
}

/**
 * Generate initials from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name (optional)
 * @returns Two-letter initials in uppercase
 */
export function generateInitials(firstName: string, lastName?: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
}
