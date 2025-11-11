import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
  signUpUser,
  signInUser,
  logoutUser,
  setupPasscode,
  verifyPasscode,
  changePasscode,
  setupPin,
  verifyPin,
  changePin,
  checkPinStatus,
  clearError,
  clearSuccessMessage,
} from '../redux/auth/indexV2';
import {
  SignUpRequest,
  SignInRequest,
  PasscodeSetupRequest,
  PasscodeVerifyRequest,
  PasscodeChangeRequest,
  PinSetupRequest,
  PinVerifyRequest,
  PinChangeRequest,
} from '../services/authV2Service';

/**
 * Custom hook for V2 authentication
 * Provides easy access to auth state and actions
 */
export const useAuthV2 = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.authV2);

  // Authentication actions
  const signUp = useCallback(
    (data: SignUpRequest) => dispatch(signUpUser(data)),
    [dispatch]
  );

  const signIn = useCallback(
    (data: SignInRequest) => dispatch(signInUser(data)),
    [dispatch]
  );

  const logout = useCallback(
    () => dispatch(logoutUser()),
    [dispatch]
  );

  // Passcode actions
  const createPasscode = useCallback(
    (data: PasscodeSetupRequest) => dispatch(setupPasscode(data)),
    [dispatch]
  );

  const checkPasscode = useCallback(
    (data: PasscodeVerifyRequest) => dispatch(verifyPasscode(data)),
    [dispatch]
  );

  const updatePasscode = useCallback(
    (data: PasscodeChangeRequest) => dispatch(changePasscode(data)),
    [dispatch]
  );

  // PIN actions
  const createPin = useCallback(
    (data: PinSetupRequest) => dispatch(setupPin(data)),
    [dispatch]
  );

  const checkPin = useCallback(
    (data: PinVerifyRequest) => dispatch(verifyPin(data)),
    [dispatch]
  );

  const updatePin = useCallback(
    (data: PinChangeRequest) => dispatch(changePin(data)),
    [dispatch]
  );

  const getPinStatus = useCallback(
    () => dispatch(checkPinStatus()),
    [dispatch]
  );

  // Utility actions
  const clearAuthError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  const clearSuccess = useCallback(
    () => dispatch(clearSuccessMessage()),
    [dispatch]
  );

  return {
    // State
    user: auth.user,
    tokens: auth.tokens,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    successMessage: auth.successMessage,

    // Passcode & PIN status
    hasPasscode: auth.hasPasscode,
    hasPin: auth.hasPin,

    // Restrictions
    isRestricted: auth.isRestricted,
    restrictedUntil: auth.restrictedUntil,
    restrictedLimit: auth.restrictedLimit,

    // Loading states
    passcodeLoading: auth.passcodeLoading,
    pinLoading: auth.pinLoading,

    // Actions
    signUp,
    signIn,
    logout,
    createPasscode,
    checkPasscode,
    updatePasscode,
    createPin,
    checkPin,
    updatePin,
    getPinStatus,
    clearAuthError,
    clearSuccess,
  };
};

/**
 * Hook specifically for passcode operations
 */
export const usePasscode = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPasscode, passcodeLoading, error } = useSelector(
    (state: RootState) => state.authV2
  );

  const setup = useCallback(
    (data: PasscodeSetupRequest) => dispatch(setupPasscode(data)),
    [dispatch]
  );

  const verify = useCallback(
    (data: PasscodeVerifyRequest) => dispatch(verifyPasscode(data)),
    [dispatch]
  );

  const change = useCallback(
    (data: PasscodeChangeRequest) => dispatch(changePasscode(data)),
    [dispatch]
  );

  return {
    hasPasscode,
    loading: passcodeLoading,
    error,
    setup,
    verify,
    change,
  };
};

/**
 * Hook specifically for PIN operations
 */
export const usePin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPin, pinLoading, error } = useSelector(
    (state: RootState) => state.authV2
  );

  const setup = useCallback(
    (data: PinSetupRequest) => dispatch(setupPin(data)),
    [dispatch]
  );

  const verify = useCallback(
    (data: PinVerifyRequest) => dispatch(verifyPin(data)),
    [dispatch]
  );

  const change = useCallback(
    (data: PinChangeRequest) => dispatch(changePin(data)),
    [dispatch]
  );

  const checkStatus = useCallback(
    () => dispatch(checkPinStatus()),
    [dispatch]
  );

  return {
    hasPin,
    loading: pinLoading,
    error,
    setup,
    verify,
    change,
    checkStatus,
  };
};

/**
 * Hook for checking and displaying restriction info
 */
export const useRestriction = () => {
  const { isRestricted, restrictedUntil, restrictedLimit } = useSelector(
    (state: RootState) => state.authV2
  );

  const getRestrictionInfo = useCallback(() => {
    if (!isRestricted || !restrictedUntil) {
      return null;
    }

    const now = new Date();
    const until = new Date(restrictedUntil);
    const remainingMs = until.getTime() - now.getTime();

    if (remainingMs <= 0) {
      return null; // Restriction expired
    }

    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      isActive: true,
      remainingHours,
      remainingMinutes,
      limit: restrictedLimit ? restrictedLimit / 100 : 10000, // Convert kobo to Naira
      formattedLimit: `₦${((restrictedLimit || 1000000) / 100).toLocaleString()}`,
      expiresAt: until,
      message: `Transaction limit restricted to ₦${((restrictedLimit || 1000000) / 100).toLocaleString()} for ${remainingHours}h ${remainingMinutes}m`,
    };
  }, [isRestricted, restrictedUntil, restrictedLimit]);

  return {
    isRestricted,
    restrictedUntil,
    restrictedLimit,
    getRestrictionInfo,
  };
};
