import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authV2Service, {
  SignUpRequest,
  SignInRequest,
  PasscodeSetupRequest,
  PasscodeVerifyRequest,
  PasscodeChangeRequest,
  PinSetupRequest,
  PinVerifyRequest,
  PinChangeRequest,
  User,
  Tokens,
} from '../../services/authV2Service';

// ============================================
// Types & Interfaces
// ============================================

export interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Passcode & PIN states
  hasPasscode: boolean;
  hasPin: boolean;

  // Restriction states
  isRestricted: boolean;
  restrictedUntil: string | null;
  restrictedLimit: number | null; // Amount in kobo (₦10,000 = 1,000,000 kobo)

  // Loading states for specific operations
  passcodeLoading: boolean;
  pinLoading: boolean;

  // Success messages
  successMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hasPasscode: false,
  hasPin: false,
  isRestricted: false,
  restrictedUntil: null,
  restrictedLimit: null,
  passcodeLoading: false,
  pinLoading: false,
  successMessage: null,
};

// ============================================
// Async Thunks - Authentication
// ============================================

/**
 * Sign Up - Single-step registration
 */
export const signUpUser = createAsyncThunk(
  'authV2/signUp',
  async (userData: SignUpRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.signUp(userData);

      const { user, tokens } = response.data;

      // Store tokens securely
      await SecureStore.setItemAsync('accessToken', tokens.access_token);
      await SecureStore.setItemAsync('refreshToken', tokens.refresh_token);

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return { user, tokens };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Sign up failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Sign In - Login with email/password or passcode
 */
export const signInUser = createAsyncThunk(
  'authV2/signIn',
  async (credentials: SignInRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.signIn(credentials);

      const { user, tokens } = response.data;

      // Store tokens securely
      await SecureStore.setItemAsync('accessToken', tokens.access_token);
      await SecureStore.setItemAsync('refreshToken', tokens.refresh_token);

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return { user, tokens };
    } catch (error: any) {
      // Don't show refresh token errors to users
      const errorMsg = error.message || '';
      if (errorMsg.includes('No refresh token') || errorMsg.includes('refresh token')) {
        // Silently handle - user will be redirected to login
        return rejectWithValue('Session expired. Please sign in again.');
      }

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Sign in failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Check auth status on app start
 */
export const checkAuthStatus = createAsyncThunk(
  'authV2/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await AsyncStorage.getItem('user');

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr) as User;
        const tokens: Tokens = {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 3600, // Default 1 hour
        };

        return { user, tokens, isAuthenticated: true };
      }
      return rejectWithValue('No valid session found');
    } catch (error: any) {
      return rejectWithValue('Auth check failed');
    }
  }
);

/**
 * Logout with session invalidation
 */
export const logoutUser = createAsyncThunk(
  'authV2/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      // Call logout endpoint to invalidate session
      if (refreshToken) {
        await authV2Service.logout({ refresh_token: refreshToken });
      }

      // Clear all stored data
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await AsyncStorage.removeItem('user');

      return true;
    } catch (error: any) {
      // Even if API call fails, clear local data
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await AsyncStorage.removeItem('user');

      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// ============================================
// Async Thunks - Passcode Management
// ============================================

/**
 * Set up 6-digit passcode
 */
export const setupPasscode = createAsyncThunk(
  'authV2/setupPasscode',
  async (data: PasscodeSetupRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.setupPasscode(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Passcode setup failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Verify passcode
 */
export const verifyPasscode = createAsyncThunk(
  'authV2/verifyPasscode',
  async (data: PasscodeVerifyRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.verifyPasscode(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Passcode verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Change passcode (applies 24-hour restriction)
 */
export const changePasscode = createAsyncThunk(
  'authV2/changePasscode',
  async (data: PasscodeChangeRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.changePasscode(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Passcode change failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================
// Async Thunks - PIN Management
// ============================================

/**
 * Set up 4-digit transaction PIN
 */
export const setupPin = createAsyncThunk(
  'authV2/setupPin',
  async (data: PinSetupRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.setupPin(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'PIN setup failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Verify transaction PIN
 */
export const verifyPin = createAsyncThunk(
  'authV2/verifyPin',
  async (data: PinVerifyRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.verifyPin(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'PIN verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Change PIN (applies 24-hour restriction)
 */
export const changePin = createAsyncThunk(
  'authV2/changePin',
  async (data: PinChangeRequest, { rejectWithValue }) => {
    try {
      const response = await authV2Service.changePin(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'PIN change failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Check PIN status
 */
export const checkPinStatus = createAsyncThunk(
  'authV2/checkPinStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authV2Service.getPinStatus();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check PIN status');
    }
  }
);

// ============================================
// Slice
// ============================================

const authSliceV2 = createSlice({
  name: 'authV2',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // Sign Up
      // ============================================
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.hasPasscode = action.payload.user.has_passcode;
        state.hasPin = action.payload.user.has_pin;
        state.error = null;
        state.successMessage = 'Account created successfully!';
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // ============================================
      // Sign In
      // ============================================
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.hasPasscode = action.payload.user.has_passcode;
        state.hasPin = action.payload.user.has_pin;
        state.isRestricted = action.payload.user.is_restricted || false;
        state.error = null;
        state.successMessage = 'Welcome back!';
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // ============================================
      // Check Auth Status
      // ============================================
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.hasPasscode = action.payload.user.has_passcode;
        state.hasPin = action.payload.user.has_pin;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      })

      // ============================================
      // Logout
      // ============================================
      .addCase(logoutUser.fulfilled, (state) => {
        return { ...initialState };
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear state even if API call failed
        return { ...initialState };
      })

      // ============================================
      // Passcode Setup
      // ============================================
      .addCase(setupPasscode.pending, (state) => {
        state.passcodeLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(setupPasscode.fulfilled, (state, action) => {
        state.passcodeLoading = false;
        state.hasPasscode = action.payload.has_passcode;
        if (state.user) {
          state.user.has_passcode = action.payload.has_passcode;
        }
        state.successMessage = 'Passcode set successfully!';
      })
      .addCase(setupPasscode.rejected, (state, action) => {
        state.passcodeLoading = false;
        state.error = action.payload as string;
      })

      // ============================================
      // Verify Passcode
      // ============================================
      .addCase(verifyPasscode.pending, (state) => {
        state.passcodeLoading = true;
        state.error = null;
      })
      .addCase(verifyPasscode.fulfilled, (state) => {
        state.passcodeLoading = false;
        state.error = null;
      })
      .addCase(verifyPasscode.rejected, (state, action) => {
        state.passcodeLoading = false;
        state.error = action.payload as string;
      })

      // ============================================
      // Change Passcode
      // ============================================
      .addCase(changePasscode.pending, (state) => {
        state.passcodeLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePasscode.fulfilled, (state, action) => {
        state.passcodeLoading = false;
        state.hasPasscode = action.payload.has_passcode;

        // Apply 24-hour restriction
        if (action.payload.restriction_applied) {
          state.isRestricted = true;
          state.restrictedUntil = action.payload.restricted_until;
          state.restrictedLimit = action.payload.restricted_limit;
        }

        state.successMessage = 'Passcode changed successfully. Transaction limit restricted to ₦10,000 for 24 hours.';
      })
      .addCase(changePasscode.rejected, (state, action) => {
        state.passcodeLoading = false;
        state.error = action.payload as string;
      })

      // ============================================
      // PIN Setup
      // ============================================
      .addCase(setupPin.pending, (state) => {
        state.pinLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(setupPin.fulfilled, (state, action) => {
        state.pinLoading = false;
        state.hasPin = action.payload.has_pin;
        if (state.user) {
          state.user.has_pin = action.payload.has_pin;
        }
        state.successMessage = 'Transaction PIN set successfully!';
      })
      .addCase(setupPin.rejected, (state, action) => {
        state.pinLoading = false;
        state.error = action.payload as string;
      })

      // ============================================
      // Verify PIN
      // ============================================
      .addCase(verifyPin.pending, (state) => {
        state.pinLoading = true;
        state.error = null;
      })
      .addCase(verifyPin.fulfilled, (state) => {
        state.pinLoading = false;
        state.error = null;
      })
      .addCase(verifyPin.rejected, (state, action) => {
        state.pinLoading = false;
        state.error = action.payload as string;
      })

      // ============================================
      // Change PIN
      // ============================================
      .addCase(changePin.pending, (state) => {
        state.pinLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePin.fulfilled, (state, action) => {
        state.pinLoading = false;
        state.hasPin = action.payload.has_pin;

        // Apply 24-hour restriction
        if (action.payload.restriction_applied) {
          state.isRestricted = true;
          state.restrictedUntil = action.payload.restricted_until;
          state.restrictedLimit = action.payload.restricted_limit;
        }

        state.successMessage = 'PIN changed successfully. Transaction limit restricted to ₦10,000 for 24 hours.';
      })
      .addCase(changePin.rejected, (state, action) => {
        state.pinLoading = false;
        state.error = action.payload as string;
      })

      // ============================================
      // Check PIN Status
      // ============================================
      .addCase(checkPinStatus.fulfilled, (state, action) => {
        state.hasPin = action.payload.has_pin;
        if (state.user) {
          state.user.has_pin = action.payload.has_pin;
        }
      });
  },
});

export const { clearError, clearSuccessMessage, setAuthenticated, updateUser } = authSliceV2.actions;
export default authSliceV2.reducer;
