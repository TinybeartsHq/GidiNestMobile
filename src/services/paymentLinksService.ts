import apiClient from '../utils/apiClient';

// Base URL for V2 payment links endpoints
const V2_PAYMENT_LINKS_BASE = '/v2/wallet/payment-links';

// ============================================
// Types & Interfaces
// ============================================

export type PaymentLinkType = 'wallet' | 'savings_goal' | 'event';
export type ShowContributors = 'public' | 'private' | 'anonymous';

export interface PaymentLinkContributor {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  amount: number;
  message?: string;
  contributed_at: string;
}

export interface PaymentLink {
  id: string;
  token: string;
  link_type: PaymentLinkType;
  user: string;

  // Link settings
  description?: string;
  custom_message?: string;
  target_amount?: number;
  show_contributors: ShowContributors;
  expires_at?: string;
  is_one_time: boolean;

  // For savings_goal type
  savings_goal?: string;

  // For event type
  event_name?: string;
  event_date?: string;

  // Analytics
  total_raised: number;
  contribution_count: number;
  contributors?: PaymentLinkContributor[];

  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Shareable URL (constructed by backend)
  shareable_url?: string;

  // Account details for payment
  account_number?: string;
  account_name?: string;
  bank_name?: string;
}

// ============================================
// Request Interfaces
// ============================================

export interface CreateGoalLinkRequest {
  goal_id: string;
  description?: string;
  custom_message?: string;
  show_contributors?: ShowContributors;
  expires_at?: string;
  is_one_time?: boolean;
}

export interface CreateEventLinkRequest {
  event_name: string;
  event_date?: string;
  target_amount?: number;
  description?: string;
  custom_message?: string;
  show_contributors?: ShowContributors;
  link_to_goal?: boolean;
  goal_name?: string;
  expires_at?: string;
  is_one_time?: boolean;
}

export interface CreateWalletLinkRequest {
  description?: string;
  custom_message?: string;
  target_amount?: number;
  show_contributors?: ShowContributors;
  expires_at?: string;
  is_one_time?: boolean;
}

export interface UpdatePaymentLinkRequest {
  description?: string;
  custom_message?: string;
  target_amount?: number;
  show_contributors?: ShowContributors;
  expires_at?: string;
  is_active?: boolean;
}

// ============================================
// Response Interfaces
// ============================================

export interface PaymentLinkResponse {
  status: boolean;
  message: string;
  data: PaymentLink;
}

export interface PaymentLinksListResponse {
  status: boolean;
  message: string;
  data: PaymentLink[];
}

export interface PaymentLinkAnalyticsResponse {
  status: boolean;
  message: string;
  data: {
    link: PaymentLink;
    total_raised: number;
    contribution_count: number;
    recent_contributions: PaymentLinkContributor[];
    top_contributors: PaymentLinkContributor[];
  };
}

// ============================================
// API Service Functions
// ============================================

/**
 * Create a payment link for a specific savings goal
 * POST /api/v2/wallet/payment-links/create-goal-link
 */
export const createGoalLink = async (
  data: CreateGoalLinkRequest
): Promise<PaymentLinkResponse> => {
  try {
    const response = await apiClient.post(`${V2_PAYMENT_LINKS_BASE}/create-goal-link`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Create goal link error:', error);
    }
    throw error;
  }
};

/**
 * Create a payment link for an event (baby shower, etc.)
 * POST /api/v2/wallet/payment-links/create-event-link
 */
export const createEventLink = async (
  data: CreateEventLinkRequest
): Promise<PaymentLinkResponse> => {
  try {
    const response = await apiClient.post(`${V2_PAYMENT_LINKS_BASE}/create-event-link`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Create event link error:', error);
    }
    throw error;
  }
};

/**
 * Create a general wallet funding link
 * POST /api/v2/wallet/payment-links/create-wallet-link
 */
export const createWalletLink = async (
  data: CreateWalletLinkRequest
): Promise<PaymentLinkResponse> => {
  try {
    const response = await apiClient.post(`${V2_PAYMENT_LINKS_BASE}/create-wallet-link`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Create wallet link error:', error);
    }
    throw error;
  }
};

/**
 * Get all payment links for the current user
 * GET /api/v2/wallet/payment-links/my-links
 */
export const getMyPaymentLinks = async (): Promise<PaymentLinksListResponse> => {
  try {
    const response = await apiClient.get(`${V2_PAYMENT_LINKS_BASE}/my-links`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get my payment links error:', error);
    }
    throw error;
  }
};

/**
 * Get public view of a payment link (no authentication required)
 * GET /api/v2/wallet/payment-links/{token}/
 */
export const getPaymentLinkByToken = async (token: string): Promise<PaymentLinkResponse> => {
  try {
    const response = await apiClient.get(`${V2_PAYMENT_LINKS_BASE}/${token}/`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get payment link by token error:', error);
    }
    throw error;
  }
};

/**
 * Get analytics for a payment link (owner only)
 * GET /api/v2/wallet/payment-links/{token}/analytics
 */
export const getPaymentLinkAnalytics = async (
  token: string
): Promise<PaymentLinkAnalyticsResponse> => {
  try {
    const response = await apiClient.get(`${V2_PAYMENT_LINKS_BASE}/${token}/analytics`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get payment link analytics error:', error);
    }
    throw error;
  }
};

/**
 * Update a payment link
 * PATCH /api/v2/wallet/payment-links/{token}/update
 */
export const updatePaymentLink = async (
  token: string,
  data: UpdatePaymentLinkRequest
): Promise<PaymentLinkResponse> => {
  try {
    const response = await apiClient.patch(`${V2_PAYMENT_LINKS_BASE}/${token}/update`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Update payment link error:', error);
    }
    throw error;
  }
};

/**
 * Delete (deactivate) a payment link
 * DELETE /api/v2/wallet/payment-links/{token}/delete
 */
export const deletePaymentLink = async (token: string): Promise<{ status: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(`${V2_PAYMENT_LINKS_BASE}/${token}/delete`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Delete payment link error:', error);
    }
    throw error;
  }
};

// Export all as default object for convenience
export default {
  createGoalLink,
  createEventLink,
  createWalletLink,
  getMyPaymentLinks,
  getPaymentLinkByToken,
  getPaymentLinkAnalytics,
  updatePaymentLink,
  deletePaymentLink,
};
