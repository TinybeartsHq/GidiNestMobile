import apiClient from '../utils/apiClient';

// Base URL for V1 account endpoints
const V1_ACCOUNT_BASE = '/v1/account';

// ============================================
// Types & Interfaces
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  account_tier: string;
  has_virtual_wallet: boolean;
  has_bvn: boolean;
  has_nin: boolean;
  is_verified: boolean;
  has_passcode: boolean;
  has_pin: boolean;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  created_at: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ProfileResponse {
  success?: boolean;
  message?: string;
  data?: UserProfile;
}

export interface BVNVerificationRequest {
  bvn: string;
}

export interface NINVerificationRequest {
  nin: string;
  firstname: string;
  lastname: string;
  dob: string; // ISO format: "1990-01-01T00:00:00"
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}

export interface VerificationStatus {
  bvn: {
    verified: boolean;
    bvn_number?: string;
    verified_name?: string;
    dob?: string;
  };
  nin: {
    verified: boolean;
    nin_number?: string;
    verified_name?: string;
    dob?: string;
  };
  account_info: {
    account_tier: string;
    has_virtual_wallet: boolean;
    profile_name: string;
    profile_dob?: string;
  };
}

export interface TierInfo {
  name: string;
  daily_transaction_limit: number;
  cumulative_transaction_limit: number;
  wallet_balance_limit: number;
  features: string[];
  requirements: string[];
  is_current: boolean;
  can_upgrade: boolean;
}

export interface TierInfoResponse {
  current_tier: TierInfo;
  all_tiers: {
    tier_1: TierInfo;
    tier_2: TierInfo;
    tier_3: TierInfo;
  };
  verification_status: {
    has_bvn: boolean;
    has_nin: boolean;
    has_virtual_wallet: boolean;
  };
  upgrade_options: string[];
}

export interface EmbedlySyncResponse {
  success: boolean;
  data: {
    message: string;
    updated: boolean;
    changes: string[];
    current_status: {
      account_tier: string;
      has_bvn: boolean;
      has_nin: boolean;
      has_virtual_wallet: boolean;
    };
  };
}

export interface WalletCreationResponse {
  success: boolean;
  data: {
    message: string;
    wallet: {
      account_name: string;
      account_number: string;
      bank: string;
      bank_code: string;
      balance: number;
      currency: string;
    };
  };
}

// ============================================
// API Service Functions
// ============================================

/**
 * Get user profile
 * GET /api/v1/account/profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get(`${V1_ACCOUNT_BASE}/profile`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get user profile error:', error);
    }
    throw error;
  }
};

/**
 * Update user profile
 * PUT /api/v1/account/profile
 */
export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.put(`${V1_ACCOUNT_BASE}/profile`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Update user profile error:', error);
    }
    throw error;
  }
};

/**
 * Verify BVN
 * POST /api/v1/account/bvn-update
 */
export const verifyBVN = async (data: BVNVerificationRequest): Promise<VerificationResponse> => {
  try {
    const response = await apiClient.post(`${V1_ACCOUNT_BASE}/bvn-update`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Verify BVN error:', error);
    }
    throw error;
  }
};

/**
 * Verify NIN
 * POST /api/v1/account/nin-update
 */
export const verifyNIN = async (data: NINVerificationRequest): Promise<VerificationResponse> => {
  try {
    const response = await apiClient.post(`${V1_ACCOUNT_BASE}/nin-update`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Verify NIN error:', error);
    }
    throw error;
  }
};

/**
 * Get verification status
 * GET /api/v1/account/verification-status
 */
export const getVerificationStatus = async (): Promise<VerificationStatus> => {
  try {
    const response = await apiClient.get(`${V1_ACCOUNT_BASE}/verification-status`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get verification status error:', error);
    }
    throw error;
  }
};

/**
 * Get account tier information
 * GET /api/v1/account/tier-info
 */
export const getTierInfo = async (): Promise<TierInfoResponse> => {
  try {
    const response = await apiClient.get(`${V1_ACCOUNT_BASE}/tier-info`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get tier info error:', error);
    }
    throw error;
  }
};

/**
 * Sync verification with Embedly
 * POST /api/v1/account/sync-embedly
 */
export const syncWithEmbedly = async (): Promise<EmbedlySyncResponse> => {
  try {
    const response = await apiClient.post(`${V1_ACCOUNT_BASE}/sync-embedly`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Sync with Embedly error:', error);
    }
    throw error;
  }
};

/**
 * Create wallet manually
 * POST /api/v1/account/create-wallet
 */
export const createWallet = async (): Promise<WalletCreationResponse> => {
  try {
    const response = await apiClient.post(`${V1_ACCOUNT_BASE}/create-wallet`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Create wallet error:', error);
    }
    throw error;
  }
};

// Export all as default object for convenience
export default {
  getUserProfile,
  updateUserProfile,
  verifyBVN,
  verifyNIN,
  getVerificationStatus,
  getTierInfo,
  syncWithEmbedly,
  createWallet,
};
