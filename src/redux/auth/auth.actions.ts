// Re-export actions and thunks for convenience
export {
  loginUser,
  checkAuthStatus,
  logout,
  registerUser,
  verifyOtp,
  activateUserByEmail,
  finalizeSignup,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  clearError,
  clearAuthError,
  setAuthenticated,
} from './authSlice';

export type {
  LoginCredentials,
  RegisterData,
  OtpData,
  EmailActivationData,
  FinalizeSignupData,
  PasswordResetData,
} from './authSlice';


