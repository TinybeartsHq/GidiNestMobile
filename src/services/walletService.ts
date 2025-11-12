import apiClient from '../utils/apiClient';

// Base URL for V1 wallet endpoints
const V1_WALLET_BASE = '/v1/wallet';

// Fallback Nigerian bank list (from Paystack) - used when API is not available
const FALLBACK_NIGERIAN_BANKS: Bank[] = [
  { bankCode: '044', bankName: 'Access Bank' },
  { bankCode: '063', bankName: 'Access Bank (Diamond)' },
  { bankCode: '050', bankName: 'Ecobank Nigeria' },
  { bankCode: '070', bankName: 'Fidelity Bank' },
  { bankCode: '011', bankName: 'First Bank of Nigeria' },
  { bankCode: '214', bankName: 'First City Monument Bank' },
  { bankCode: '058', bankName: 'Guaranty Trust Bank' },
  { bankCode: '030', bankName: 'Heritage Bank' },
  { bankCode: '301', bankName: 'Jaiz Bank' },
  { bankCode: '082', bankName: 'Keystone Bank' },
  { bankCode: '526', bankName: 'Parallex Bank' },
  { bankCode: '076', bankName: 'Polaris Bank' },
  { bankCode: '101', bankName: 'Providus Bank' },
  { bankCode: '221', bankName: 'Stanbic IBTC Bank' },
  { bankCode: '068', bankName: 'Standard Chartered Bank' },
  { bankCode: '232', bankName: 'Sterling Bank' },
  { bankCode: '100', bankName: 'Suntrust Bank' },
  { bankCode: '032', bankName: 'Union Bank of Nigeria' },
  { bankCode: '033', bankName: 'United Bank For Africa' },
  { bankCode: '215', bankName: 'Unity Bank' },
  { bankCode: '035', bankName: 'Wema Bank' },
  { bankCode: '057', bankName: 'Zenith Bank' },
];

// ============================================
// Types & Interfaces
// ============================================

export interface WalletInfo {
  id: string;
  account_name: string;
  account_number: string;
  bank: string;
  bank_code: string;
  balance: number;
  currency: string;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  data: {
    wallet: WalletInfo;
    user_goals: SavingsGoal[];
    transaction_pin_set: boolean;
  };
}

export interface Transaction {
  id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description: string;
  sender_name?: string;
  sender_account?: string;
  external_reference?: string;
  created_at: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
  };
}

export interface Bank {
  bankCode: string;
  bankName: string;
}

export interface BankListResponse {
  success: boolean;
  data: {
    banks: Bank[];
  };
}

export interface ResolveAccountRequest {
  account_number: string;
  bank_code: string;
}

export interface ResolveAccountResponse {
  status: boolean;
  detail: string;
  verified?: boolean;  // Added for graceful degradation
  data: {
    account_number: string;
    account_name: string | null;  // Can be null when verification unavailable
    bank_code: string;
  };
}

export interface WithdrawalRequest {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  amount: number;
  transaction_pin: string;
}

export interface WithdrawalResponse {
  status: boolean;
  detail: string;
  withdrawal_request: {
    id: number;
    amount: number;
    bank_name: string;
    account_number: string;
    bank_account_name: string;
    status: 'processing' | 'completed' | 'failed';
  };
}

export interface WithdrawalStatusResponse {
  status: boolean;
  detail: string;
  data: {
    id: number;
    amount: number;
    bank_name: string;
    account_number: string;
    status: 'processing' | 'completed' | 'failed';
    created_at: string;
    completed_at?: string;
  };
}

// ============================================
// API Service Functions
// ============================================

/**
 * Get wallet balance and goals
 * GET /api/v1/wallet/balance
 */
export const getWalletBalance = async (): Promise<WalletBalanceResponse> => {
  try {
    const response = await apiClient.get(`${V1_WALLET_BASE}/balance`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get wallet balance error:', error);
    }
    throw error;
  }
};

/**
 * Get transaction history
 * GET /api/v1/wallet/history
 */
export const getTransactionHistory = async (): Promise<TransactionHistoryResponse> => {
  try {
    const response = await apiClient.get(`${V1_WALLET_BASE}/history`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get transaction history error:', error);
    }
    throw error;
  }
};

/**
 * Get list of banks
 * GET /api/v1/wallet/banks
 * Falls back to hardcoded Nigerian bank list if API is not available
 */
export const getBankList = async (): Promise<BankListResponse> => {
  try {
    const response = await apiClient.get(`${V1_WALLET_BASE}/banks`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    // Only log non-auth errors
    if (status && status !== 401 && status !== 403) {
      console.warn('Bank list API not available, using fallback list');
    }
    // Return fallback bank list instead of throwing
    return {
      success: true,
      data: {
        banks: FALLBACK_NIGERIAN_BANKS,
      },
    };
  }
};

/**
 * Resolve bank account
 * POST /api/v1/wallet/resolve-bank-account
 */
export const resolveBankAccount = async (
  data: ResolveAccountRequest
): Promise<ResolveAccountResponse> => {
  try {
    console.log('Resolving account:', data);
    const response = await apiClient.post(`${V1_WALLET_BASE}/resolve-bank-account`, data);
    console.log('Account resolved:', response.data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    // Only log non-auth errors
    if (status && status !== 401 && status !== 403) {
      console.error('Resolve account failed:', {
        status,
        detail: errorData?.detail,
        data: errorData,
        request: data,
      });
    }
    throw error;
  }
};

/**
 * Initiate withdrawal
 * POST /api/v1/wallet/withdraw/request
 */
export const initiateWithdrawal = async (
  data: WithdrawalRequest
): Promise<WithdrawalResponse> => {
  try {
    console.log('Withdrawal request payload:', JSON.stringify(data, null, 2));
    const response = await apiClient.post(`${V1_WALLET_BASE}/withdraw/request`, data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const errorDetail = error?.response?.data?.detail || error?.response?.data?.message;
    const errorData = error?.response?.data;

    console.error('Initiate withdrawal error:', {
      status,
      detail: errorDetail,
      fullError: errorData,
      requestData: data,
    });

    if (status && status !== 401 && status !== 403) {
      console.error('Full error response:', JSON.stringify(errorData, null, 2));
    }
    throw error;
  }
};

/**
 * Check withdrawal status
 * GET /api/v1/wallet/withdraw/status/{id}
 */
export const getWithdrawalStatus = async (
  withdrawalId: number
): Promise<WithdrawalStatusResponse> => {
  try {
    const response = await apiClient.get(`${V1_WALLET_BASE}/withdraw/status/${withdrawalId}`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get withdrawal status error:', error);
    }
    throw error;
  }
};

// Export all as default object for convenience
export default {
  getWalletBalance,
  getTransactionHistory,
  getBankList,
  resolveBankAccount,
  initiateWithdrawal,
  getWithdrawalStatus,
};
