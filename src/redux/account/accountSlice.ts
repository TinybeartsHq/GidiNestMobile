import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import accountService, {
  UserProfile,
  UpdateProfileRequest,
  BVNVerificationRequest,
  NINVerificationRequest,
  VerificationStatus,
  TierInfoResponse,
} from '../../services/accountService';

// ============================================
// Types & Interfaces
// ============================================

export interface AccountState {
  profile: UserProfile | null;
  verificationStatus: VerificationStatus | null;
  tierInfo: TierInfoResponse | null;
  loading: boolean;
  profileLoading: boolean;
  verificationLoading: boolean;
  tierInfoLoading: boolean;
  syncLoading: boolean;
  walletCreationLoading: boolean;
  error: string | null;
  verificationError: string | null;
  lastSyncMessage: string | null;
}

const initialState: AccountState = {
  profile: null,
  verificationStatus: null,
  tierInfo: null,
  loading: false,
  profileLoading: false,
  verificationLoading: false,
  tierInfoLoading: false,
  syncLoading: false,
  walletCreationLoading: false,
  error: null,
  verificationError: null,
  lastSyncMessage: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Get user profile
 */
export const fetchUserProfile = createAsyncThunk(
  'account/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getUserProfile();
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk(
  'account/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await accountService.updateUserProfile(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Verify BVN
 */
export const submitBVNVerification = createAsyncThunk(
  'account/verifyBVN',
  async (data: BVNVerificationRequest, { rejectWithValue }) => {
    try {
      const response = await accountService.verifyBVN(data);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to verify BVN';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Verify NIN
 */
export const submitNINVerification = createAsyncThunk(
  'account/verifyNIN',
  async (data: NINVerificationRequest, { rejectWithValue }) => {
    try {
      const response = await accountService.verifyNIN(data);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to verify NIN';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Get verification status
 */
export const fetchVerificationStatus = createAsyncThunk(
  'account/fetchVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getVerificationStatus();
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch verification status';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Get tier information
 */
export const fetchTierInfo = createAsyncThunk(
  'account/fetchTierInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getTierInfo();
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch tier information';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Sync with Embedly
 */
export const syncEmbedly = createAsyncThunk(
  'account/syncEmbedly',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.syncWithEmbedly();
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to sync with Embedly';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create wallet
 */
export const createWalletManually = createAsyncThunk(
  'account/createWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.createWallet();
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to create wallet';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================
// Slice
// ============================================

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    clearAccountError: (state) => {
      state.error = null;
      state.verificationError = null;
    },
    clearSyncMessage: (state) => {
      state.lastSyncMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        if (action.payload) {
          state.profile = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload as string;
      });

    // Verify BVN
    builder
      .addCase(submitBVNVerification.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(submitBVNVerification.fulfilled, (state) => {
        state.verificationLoading = false;
        // Trigger refresh of profile and verification status
      })
      .addCase(submitBVNVerification.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload as string;
      });

    // Verify NIN
    builder
      .addCase(submitNINVerification.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(submitNINVerification.fulfilled, (state) => {
        state.verificationLoading = false;
        // Trigger refresh of profile and verification status
      })
      .addCase(submitNINVerification.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload as string;
      });

    // Fetch Verification Status
    builder
      .addCase(fetchVerificationStatus.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.verificationStatus = action.payload;
      })
      .addCase(fetchVerificationStatus.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload as string;
      });

    // Fetch Tier Info
    builder
      .addCase(fetchTierInfo.pending, (state) => {
        state.tierInfoLoading = true;
        state.error = null;
      })
      .addCase(fetchTierInfo.fulfilled, (state, action) => {
        state.tierInfoLoading = false;
        state.tierInfo = action.payload;
      })
      .addCase(fetchTierInfo.rejected, (state, action) => {
        state.tierInfoLoading = false;
        state.error = action.payload as string;
      });

    // Sync Embedly
    builder
      .addCase(syncEmbedly.pending, (state) => {
        state.syncLoading = true;
        state.error = null;
      })
      .addCase(syncEmbedly.fulfilled, (state, action) => {
        state.syncLoading = false;
        state.lastSyncMessage = action.payload.data.message;
        // Update profile with new status if changes were made
        if (action.payload.data.updated && action.payload.data.current_status) {
          if (state.profile) {
            state.profile.has_bvn = action.payload.data.current_status.has_bvn;
            state.profile.has_nin = action.payload.data.current_status.has_nin;
            state.profile.has_virtual_wallet = action.payload.data.current_status.has_virtual_wallet;
            state.profile.account_tier = action.payload.data.current_status.account_tier;
          }
        }
      })
      .addCase(syncEmbedly.rejected, (state, action) => {
        state.syncLoading = false;
        state.error = action.payload as string;
      });

    // Create Wallet
    builder
      .addCase(createWalletManually.pending, (state) => {
        state.walletCreationLoading = true;
        state.error = null;
      })
      .addCase(createWalletManually.fulfilled, (state) => {
        state.walletCreationLoading = false;
        // Update profile to show wallet created
        if (state.profile) {
          state.profile.has_virtual_wallet = true;
        }
      })
      .addCase(createWalletManually.rejected, (state, action) => {
        state.walletCreationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAccountError, clearSyncMessage } = accountSlice.actions;
export default accountSlice.reducer;
