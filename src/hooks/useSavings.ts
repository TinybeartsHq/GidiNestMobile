import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchAllGoals,
  createSavingsGoal,
  fetchGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
  fundSavingsGoal,
  withdrawFromSavingsGoal,
  clearError,
  clearSelectedGoal,
  clearLastFundedGoal,
  clearLastWithdrawalGoal,
} from '../redux/savings';
import {
  CreateGoalRequest,
  UpdateGoalRequest,
  FundGoalRequest,
  WithdrawFromGoalRequest,
} from '../services/savingsService';

/**
 * Custom hook for savings operations
 * Provides access to savings state and actions
 */
export const useSavings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const savingsState = useSelector((state: RootState) => state.savings);

  return {
    // State
    goals: savingsState.goals,
    selectedGoal: savingsState.selectedGoal,
    loading: savingsState.loading,
    goalsLoading: savingsState.goalsLoading,
    createLoading: savingsState.createLoading,
    updateLoading: savingsState.updateLoading,
    deleteLoading: savingsState.deleteLoading,
    fundLoading: savingsState.fundLoading,
    withdrawLoading: savingsState.withdrawLoading,
    error: savingsState.error,
    lastFundedGoalId: savingsState.lastFundedGoalId,
    lastWithdrawalGoalId: savingsState.lastWithdrawalGoalId,

    // Actions - Goals CRUD
    getAllGoals: () => dispatch(fetchAllGoals()),
    createGoal: (data: CreateGoalRequest) => dispatch(createSavingsGoal(data)),
    getGoalById: (goalId: string) => dispatch(fetchGoalById(goalId)),
    updateGoal: (goalId: string, data: UpdateGoalRequest) =>
      dispatch(updateSavingsGoal({ goalId, data })),
    deleteGoal: (goalId: string) => dispatch(deleteSavingsGoal(goalId)),

    // Actions - Fund and Withdraw
    fundGoal: (goalId: string, data: FundGoalRequest) =>
      dispatch(fundSavingsGoal({ goalId, data })),
    withdrawFromGoal: (goalId: string, data: WithdrawFromGoalRequest) =>
      dispatch(withdrawFromSavingsGoal({ goalId, data })),

    // Utility actions
    clearError: () => dispatch(clearError()),
    clearSelectedGoal: () => dispatch(clearSelectedGoal()),
    clearLastFundedGoal: () => dispatch(clearLastFundedGoal()),
    clearLastWithdrawalGoal: () => dispatch(clearLastWithdrawalGoal()),
  };
};
