import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface LoginCredentials {
  login_type: 'password';
  password: string;
  login_with: 'email' | 'phone';
  email?: string;
  phone?: string;
}

export interface RegisterData {
  email?: string;
  phone?: string;
  name: string;
  password: string;
}

export interface OtpData {
  email?: string;
  phone?: string;
  otp: string;
}

export interface EmailActivationData {
  email: string;
  activation_token: string;
}

export interface FinalizeSignupData {
  // Add fields as needed based on your API
  [key: string]: any;
}

export interface PasswordResetData {
  email: string;
  otp: string;
  new_password: string;
}

export interface AuthState {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registrationMessage: string | null; // Message after initial registration step
  otpVerified: boolean; // Status after OTP verification
  signupFinalized: boolean; // Status after final signup step
  // Password reset states (can be separate since they're a different flow)
  resetOtpLoading: boolean;
  resetOtpError: string | null;
  resetOtpSuccess: boolean;
  resetPasswordLoading: boolean;
  resetPasswordError: string | null;
  resetPasswordSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registrationMessage: null,
  otpVerified: false,
  signupFinalized: false,
  resetOtpLoading: false,
  resetOtpError: null,
  resetOtpSuccess: false,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
};

// --- Login Actions ---
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/login', credentials);
      const user = response.data.data.user;
      const refresh = response.data.data.token.refresh;
      const access = response.data.data.token.access;

      // Store tokens securely
      if (access) {
        await SecureStore.setItemAsync('accessToken', access);
      }
      if (refresh) {
        await SecureStore.setItemAsync('refreshToken', refresh);
      }
      // Store user data in AsyncStorage (for JSON)
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      return { user, token: access, refreshToken: refresh };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Check auth status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { token, user, isAuthenticated: true };
      }
      return rejectWithValue('No token found');
    } catch (error: any) {
      return rejectWithValue('Auth check failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await AsyncStorage.removeItem('user');
  return true;
});

// --- Registration Flow Actions ---
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/register/initiate', userData);
      return {
        message: response.data.message || 'Registration initiated successfully. Check your email for OTP.',
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData: OtpData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/register/verify-otp', otpData);
      return {
        message: response.data.message || 'OTP verified successfully. Proceed to finalize signup.',
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'OTP verification failed.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const activateUserByEmail = createAsyncThunk(
  'auth/activateUserByEmail',
  async (emailData: EmailActivationData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/register/email/activation', emailData);
      return {
        message: response.data.message || 'Email Activated successfully. Proceed to finalize login.',
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Email Activation failed.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const finalizeSignup = createAsyncThunk(
  'auth/finalizeSignup',
  async (finalData: FinalizeSignupData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/register/complete', finalData);
      const user = response.data.data.user;
      const refresh = response.data.data.token.refresh;
      const access = response.data.data.token.access;

      // Store tokens securely
      if (access) {
        await SecureStore.setItemAsync('accessToken', access);
      }
      if (refresh) {
        await SecureStore.setItemAsync('refreshToken', refresh);
      }
      // Store user data
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      return {
        user,
        token: access,
        refreshToken: refresh,
        message: response.data.message || 'Signup completed successfully.',
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Signup finalization failed.';
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Password Reset Actions ---
export const requestPasswordResetOtp = createAsyncThunk(
  'auth/requestPasswordResetOtp',
  async (emailData: { email: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/request-otp', emailData);
      return {
        success: true,
        message: response.data.message || 'OTP sent successfully. Check your email.',
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to send OTP.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyPasswordResetOtp = createAsyncThunk(
  'auth/verifyPasswordResetOtp',
  async (otpData: OtpData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/verify-otp', otpData);
      return {
        success: true,
        message: response.data.message || 'OTP verified successfully.',
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'OTP verification failed.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData: PasswordResetData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('onboarding/reset-password', resetData);
      return {
        success: true,
        message: response.data.message || 'Password reset successfully.',
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Password reset failed.';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
      state.resetOtpError = null;
      state.resetPasswordError = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Clear registration flow states when login starts
        state.registrationMessage = null;
        state.otpVerified = false;
        state.signupFinalized = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.registrationMessage = null;
        state.otpVerified = false;
        state.signupFinalized = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        return {
          ...initialState,
          token: null,
          isAuthenticated: false,
        };
      })
      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Clear specific messages/statuses when a new flow starts
        state.registrationMessage = null;
        state.otpVerified = false;
        state.signupFinalized = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationMessage = action.payload.message; // Store the success message from registration
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP cases
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Clear statuses when starting OTP verification
        state.registrationMessage = null;
        state.otpVerified = false;
        state.signupFinalized = false;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        state.registrationMessage = action.payload.message; // Can update message here too
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.otpVerified = false; // Reset on failure
      })
      // Activate user by email cases (same as verifyOtp)
      .addCase(activateUserByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationMessage = null;
        state.otpVerified = false;
        state.signupFinalized = false;
      })
      .addCase(activateUserByEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        state.registrationMessage = action.payload.message;
        state.error = null;
      })
      .addCase(activateUserByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.otpVerified = false;
      })
      // Finalize signup cases
      .addCase(finalizeSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Clear statuses when starting finalization
        state.registrationMessage = null;
        state.signupFinalized = false;
      })
      .addCase(finalizeSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true; // Set isAuthenticated to true upon finalization
        state.user = action.payload.user; // User data on finalization
        state.registrationMessage = action.payload.message; // Store the success message from finalization
        state.otpVerified = true; // Remains true
        state.signupFinalized = true; // Set true on completion
        state.error = null;
      })
      .addCase(finalizeSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.signupFinalized = false; // Reset on failure
      })
      // Request password reset OTP cases
      .addCase(requestPasswordResetOtp.pending, (state) => {
        state.resetOtpLoading = true;
        state.resetOtpError = null;
        state.resetOtpSuccess = false;
      })
      .addCase(requestPasswordResetOtp.fulfilled, (state) => {
        state.resetOtpLoading = false;
        state.resetOtpSuccess = true;
        state.resetOtpError = null;
      })
      .addCase(requestPasswordResetOtp.rejected, (state, action) => {
        state.resetOtpLoading = false;
        state.resetOtpError = action.payload as string;
        state.resetOtpSuccess = false;
      })
      // Verify password reset OTP cases
      .addCase(verifyPasswordResetOtp.pending, (state) => {
        state.resetOtpLoading = true;
        state.resetOtpError = null;
        state.resetOtpSuccess = false;
      })
      .addCase(verifyPasswordResetOtp.fulfilled, (state) => {
        state.resetOtpLoading = false;
        state.resetOtpSuccess = true;
        state.resetOtpError = null;
      })
      .addCase(verifyPasswordResetOtp.rejected, (state, action) => {
        state.resetOtpLoading = false;
        state.resetOtpError = action.payload as string;
        state.resetOtpSuccess = false;
      })
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload as string;
        state.resetPasswordSuccess = false;
      });
  },
});

export const { clearError, clearAuthError, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
