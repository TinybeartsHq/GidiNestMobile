import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import {
  fetchWalletBalance,
  fetchTransactionHistory,
  fetchBankList,
  resolveBankAccount,
  initiateWithdrawal,
  checkWithdrawalStatus,
  clearWalletError,
  clearResolvedAccount,
} from '../redux/wallet/walletSlice';

/**
 * Custom hook for wallet operations
 * Provides access to wallet state and actions
 */
export const useWallet = () => {
  const dispatch = useDispatch<AppDispatch>();
  const walletState = useSelector((state: RootState) => state.wallet);

  return {
    // State
    wallet: walletState.wallet,
    goals: walletState.goals,
    transactions: walletState.transactions,
    banks: walletState.banks,
    loading: walletState.loading,
    error: walletState.error,
    transactionPinSet: walletState.transactionPinSet,
    walletNotFound: walletState.walletNotFound,
    withdrawalLoading: walletState.withdrawalLoading,
    withdrawalError: walletState.withdrawalError,
    lastWithdrawalId: walletState.lastWithdrawalId,
    resolvedAccount: walletState.resolvedAccount,
    resolvingAccount: walletState.resolvingAccount,

    // Actions
    getWalletBalance: () => dispatch(fetchWalletBalance()),
    getTransactionHistory: () => dispatch(fetchTransactionHistory()),
    getBankList: () => dispatch(fetchBankList()),
    resolveAccount: (data: { account_number: string; bank_code: string }) =>
      dispatch(resolveBankAccount(data)),
    withdraw: (data: {
      bank_name: string;
      bank_code: string;
      account_number: string;
      account_name: string;
      amount: number;
      transaction_pin: string;
    }) => dispatch(initiateWithdrawal(data)),
    checkWithdrawal: (withdrawalId: number) => dispatch(checkWithdrawalStatus(withdrawalId)),
    clearError: () => dispatch(clearWalletError()),
    clearResolved: () => dispatch(clearResolvedAccount()),
  };
};
