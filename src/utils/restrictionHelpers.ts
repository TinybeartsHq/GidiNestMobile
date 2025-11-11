/**
 * Utility functions for handling 24-hour transaction restrictions
 */

export interface RestrictionInfo {
  isActive: boolean;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
  limit: number; // In Naira
  limitInKobo: number;
  formattedLimit: string;
  expiresAt: Date;
  message: string;
  shortMessage: string;
}

/**
 * Check if a restriction is currently active
 */
export const isRestrictionActive = (restrictedUntil: string | null): boolean => {
  if (!restrictedUntil) return false;

  const now = new Date();
  const until = new Date(restrictedUntil);

  return until.getTime() > now.getTime();
};

/**
 * Get detailed restriction information
 */
export const getRestrictionInfo = (
  restrictedUntil: string | null,
  restrictedLimit: number | null = 1000000 // Default ₦10,000 in kobo
): RestrictionInfo | null => {
  if (!restrictedUntil || !isRestrictionActive(restrictedUntil)) {
    return null;
  }

  const now = new Date();
  const until = new Date(restrictedUntil);
  const remainingMs = until.getTime() - now.getTime();

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const limitInKobo = restrictedLimit || 1000000;
  const limitInNaira = limitInKobo / 100;
  const formattedLimit = `₦${limitInNaira.toLocaleString()}`;

  return {
    isActive: true,
    remainingHours,
    remainingMinutes,
    remainingSeconds,
    limit: limitInNaira,
    limitInKobo,
    formattedLimit,
    expiresAt: until,
    message: `Transaction limit restricted to ${formattedLimit} for ${remainingHours}h ${remainingMinutes}m`,
    shortMessage: `Limit: ${formattedLimit} (${remainingHours}h ${remainingMinutes}m)`,
  };
};

/**
 * Format time remaining in human-readable format
 */
export const formatTimeRemaining = (restrictedUntil: string): string => {
  const info = getRestrictionInfo(restrictedUntil);

  if (!info) {
    return 'No restriction';
  }

  if (info.remainingHours > 0) {
    return `${info.remainingHours}h ${info.remainingMinutes}m remaining`;
  }

  if (info.remainingMinutes > 0) {
    return `${info.remainingMinutes}m ${info.remainingSeconds}s remaining`;
  }

  return `${info.remainingSeconds}s remaining`;
};

/**
 * Check if a transaction amount is within the restriction limit
 */
export const isWithinRestrictionLimit = (
  amount: number, // In kobo
  restrictedLimit: number | null,
  restrictedUntil: string | null
): { allowed: boolean; message?: string } => {
  // No restriction active
  if (!isRestrictionActive(restrictedUntil)) {
    return { allowed: true };
  }

  const limit = restrictedLimit || 1000000; // Default ₦10,000 in kobo

  if (amount > limit) {
    const formattedLimit = `₦${(limit / 100).toLocaleString()}`;
    const formattedAmount = `₦${(amount / 100).toLocaleString()}`;
    return {
      allowed: false,
      message: `Transaction amount (${formattedAmount}) exceeds your current limit of ${formattedLimit}`,
    };
  }

  return { allowed: true };
};

/**
 * Get restriction alert message for UI
 */
export const getRestrictionAlertMessage = (
  restrictedUntil: string | null,
  restrictedLimit: number | null
): string | null => {
  const info = getRestrictionInfo(restrictedUntil, restrictedLimit);

  if (!info) return null;

  return `⚠️ Your account has a temporary transaction limit of ${info.formattedLimit} due to recent security changes. This restriction will be lifted in ${info.remainingHours}h ${info.remainingMinutes}m.`;
};

/**
 * Calculate when restriction will expire
 */
export const getRestrictionExpiryDate = (restrictedUntil: string | null): Date | null => {
  if (!restrictedUntil) return null;
  return new Date(restrictedUntil);
};

/**
 * Check if restriction is about to expire (within 1 hour)
 */
export const isRestrictionExpiringSoon = (restrictedUntil: string | null): boolean => {
  const info = getRestrictionInfo(restrictedUntil);
  if (!info) return false;

  return info.remainingHours === 0 && info.remainingMinutes <= 60;
};

/**
 * Format restriction status for display
 */
export const formatRestrictionStatus = (
  isRestricted: boolean,
  restrictedUntil: string | null,
  restrictedLimit: number | null
): {
  status: 'active' | 'expiring_soon' | 'none';
  message: string;
  badge: string;
} => {
  if (!isRestricted || !isRestrictionActive(restrictedUntil)) {
    return {
      status: 'none',
      message: 'No restrictions',
      badge: 'Normal',
    };
  }

  const info = getRestrictionInfo(restrictedUntil, restrictedLimit);

  if (!info) {
    return {
      status: 'none',
      message: 'No restrictions',
      badge: 'Normal',
    };
  }

  if (isRestrictionExpiringSoon(restrictedUntil)) {
    return {
      status: 'expiring_soon',
      message: `Restriction expires in ${info.remainingMinutes}m`,
      badge: 'Expiring Soon',
    };
  }

  return {
    status: 'active',
    message: info.message,
    badge: 'Restricted',
  };
};

/**
 * Validate transaction against restriction
 */
export const validateTransactionRestriction = (
  amount: number, // In kobo
  isRestricted: boolean,
  restrictedUntil: string | null,
  restrictedLimit: number | null
): {
  isValid: boolean;
  error?: string;
  warning?: string;
} => {
  // No restriction
  if (!isRestricted || !isRestrictionActive(restrictedUntil)) {
    return { isValid: true };
  }

  const limit = restrictedLimit || 1000000;
  const formattedLimit = `₦${(limit / 100).toLocaleString()}`;
  const formattedAmount = `₦${(amount / 100).toLocaleString()}`;

  // Amount exceeds limit
  if (amount > limit) {
    return {
      isValid: false,
      error: `Transaction blocked: Amount (${formattedAmount}) exceeds your temporary limit of ${formattedLimit}. This restriction was applied due to recent security changes and will be lifted in ${formatTimeRemaining(restrictedUntil!)}.`,
    };
  }

  // Amount is within 80% of limit - show warning
  if (amount > limit * 0.8) {
    return {
      isValid: true,
      warning: `You're close to your temporary transaction limit of ${formattedLimit}. Remaining: ₦${((limit - amount) / 100).toLocaleString()}`,
    };
  }

  return { isValid: true };
};
