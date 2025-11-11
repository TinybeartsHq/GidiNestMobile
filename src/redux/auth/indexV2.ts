// V2 Auth exports - New authentication system
export { default as authReducerV2 } from './authSliceV2';

export {
  // Authentication actions
  signUpUser,
  signInUser,
  checkAuthStatus,
  logoutUser,

  // Passcode actions
  setupPasscode,
  verifyPasscode,
  changePasscode,

  // PIN actions
  setupPin,
  verifyPin,
  changePin,
  checkPinStatus,

  // Utility actions
  clearError,
  clearSuccessMessage,
  setAuthenticated,
  updateUser,
} from './authSliceV2';

export type { AuthState } from './authSliceV2';
