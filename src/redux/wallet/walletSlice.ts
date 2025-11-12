import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import walletService, {
  WalletInfo,
  SavingsGoal,
  Transaction,
  Bank,
  WithdrawalRequest,
  ResolveAccountRequest,
} from '../../services/walletService';

// ============================================
// Types & Interfaces
// ============================================

export interface WalletState {
  wallet: WalletInfo | null;
  goals: SavingsGoal[];
  transactions: Transaction[];
  banks: Bank[];
  loading: boolean;
  error: string | null;
  transactionPinSet: boolean;
  walletNotFound: boolean;  // New: indicates user needs KYC to create wallet

  // Withdrawal state
  withdrawalLoading: boolean;
  withdrawalError: string | null;
  lastWithdrawalId: number | null;

  // Bank resolution state
  resolvedAccount: {
    account_number: string;
    account_name: string | null;
    bank_code: string;
    verified?: boolean;
  } | null;
  resolvingAccount: boolean;
}

const initialState: WalletState = {
  wallet: null,
  goals: [],
  transactions: [],
  banks: [],
  loading: false,
  error: null,
  transactionPinSet: false,
  walletNotFound: false,
  withdrawalLoading: false,
  withdrawalError: null,
  lastWithdrawalId: null,
  resolvedAccount: null,
  resolvingAccount: false,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Get wallet balance and goals
 */
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWalletBalance();
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;

      // 404 means wallet doesn't exist yet - user needs KYC
      if (status === 404) {
        return rejectWithValue({ walletNotFound: true, message: 'Wallet not found' });
      }

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch wallet balance';
      return rejectWithValue({ walletNotFound: false, message: errorMessage });
    }
  }
);

/**
 * Get transaction history
 */
export const fetchTransactionHistory = createAsyncThunk(
  'wallet/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getTransactionHistory();
      return response.data.transactions;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch transaction history';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Get bank list
 */
export const fetchBankList = createAsyncThunk(
  'wallet/fetchBanks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getBankList();
      // Transform API response to match expected format (lowercase to camelCase)
      const banks = response.data.banks.map((bank: any) => ({
        bankCode: bank.bankCode || bank.bankcode,
        bankName: bank.bankName || bank.bankname,
      }));
      return banks;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch bank list';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Resolve bank account
 */
export const resolveBankAccount = createAsyncThunk(
  'wallet/resolveAccount',
  async (data: ResolveAccountRequest, { rejectWithValue }) => {
    try {
      const response = await walletService.resolveBankAccount(data);
      // Include verified field from response
      return {
        ...response.data,
        verified: response.verified !== false, // Default to true if not specified
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to resolve bank account';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Initiate withdrawal
 */
export const initiateWithdrawal = createAsyncThunk(
  'wallet/initiateWithdrawal',
  async (data: WithdrawalRequest, { rejectWithValue }) => {
    try {
      const response = await walletService.initiateWithdrawal(data);
      return response.withdrawal_request;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to initiate withdrawal';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Check withdrawal status
 */
export const checkWithdrawalStatus = createAsyncThunk(
  'wallet/checkWithdrawalStatus',
  async (withdrawalId: number, { rejectWithValue }) => {
    try {
      const response = await walletService.getWithdrawalStatus(withdrawalId);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to check withdrawal status';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================
// Slice
// ============================================

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
      state.withdrawalError = null;
    },
    clearResolvedAccount: (state) => {
      state.resolvedAccount = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wallet Balance
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.walletNotFound = false;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload.wallet;
        state.goals = action.payload.user_goals;
        state.transactionPinSet = action.payload.transaction_pin_set;
        state.walletNotFound = false;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.walletNotFound) {
          state.walletNotFound = true;
          state.error = null; // Don't show as error - it's expected for new users
        } else {
          state.error = payload?.message || 'Failed to fetch wallet balance';
        }
      });

    // Fetch Transaction History
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Bank List
    builder
      .addCase(fetchBankList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankList.fulfilled, (state, action) => {
        state.loading = false;
        state.banks = action.payload;
      })
      .addCase(fetchBankList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Resolve Bank Account
    builder
      .addCase(resolveBankAccount.pending, (state) => {
        state.resolvingAccount = true;
        state.error = null;
        state.resolvedAccount = null;
      })
      .addCase(resolveBankAccount.fulfilled, (state, action) => {
        state.resolvingAccount = false;
        state.resolvedAccount = action.payload;
      })
      .addCase(resolveBankAccount.rejected, (state, action) => {
        state.resolvingAccount = false;
        state.error = action.payload as string;
      });

    // Initiate Withdrawal
    builder
      .addCase(initiateWithdrawal.pending, (state) => {
        state.withdrawalLoading = true;
        state.withdrawalError = null;
      })
      .addCase(initiateWithdrawal.fulfilled, (state, action) => {
        state.withdrawalLoading = false;
        state.lastWithdrawalId = action.payload.id;
      })
      .addCase(initiateWithdrawal.rejected, (state, action) => {
        state.withdrawalLoading = false;
        state.withdrawalError = action.payload as string;
      });

    // Check Withdrawal Status
    builder
      .addCase(checkWithdrawalStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkWithdrawalStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkWithdrawalStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWalletError, clearResolvedAccount } = walletSlice.actions;
export default walletSlice.reducer;
