import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import {
  fetchUserProfile,
  updateProfile,
  submitBVNVerification,
  submitNINVerification,
  fetchVerificationStatus,
  fetchTierInfo,
  syncEmbedly,
  createWalletManually,
  clearAccountError,
  clearSyncMessage,
} from '../redux/account/accountSlice';
import type {
  UpdateProfileRequest,
  BVNVerificationRequest,
  NINVerificationRequest,
} from '../services/accountService';

/**
 * Custom hook for account/profile operations
 * Provides access to account state and actions
 */
export const useAccount = () => {
  const dispatch = useDispatch<AppDispatch>();
  const accountState = useSelector((state: RootState) => state.account);

  return {
    // State
    profile: accountState.profile,
    verificationStatus: accountState.verificationStatus,
    tierInfo: accountState.tierInfo,
    loading: accountState.loading,
    profileLoading: accountState.profileLoading,
    verificationLoading: accountState.verificationLoading,
    tierInfoLoading: accountState.tierInfoLoading,
    syncLoading: accountState.syncLoading,
    walletCreationLoading: accountState.walletCreationLoading,
    error: accountState.error,
    verificationError: accountState.verificationError,
    lastSyncMessage: accountState.lastSyncMessage,

    // Actions
    getProfile: () => dispatch(fetchUserProfile()),
    updateProfile: (data: UpdateProfileRequest) => dispatch(updateProfile(data)),
    verifyBVN: (data: BVNVerificationRequest) => dispatch(submitBVNVerification(data)),
    verifyNIN: (data: NINVerificationRequest) => dispatch(submitNINVerification(data)),
    getVerificationStatus: () => dispatch(fetchVerificationStatus()),
    getTierInfo: () => dispatch(fetchTierInfo()),
    syncWithEmbedly: () => dispatch(syncEmbedly()),
    createWallet: () => dispatch(createWalletManually()),
    clearError: () => dispatch(clearAccountError()),
    clearSync: () => dispatch(clearSyncMessage()),
  };
};
