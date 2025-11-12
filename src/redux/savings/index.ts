import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as savingsService from '../../services/savingsService';
import {
  SavingsGoal,
  CreateGoalRequest,
  UpdateGoalRequest,
  FundGoalRequest,
  WithdrawFromGoalRequest,
} from '../../services/savingsService';

// ============================================
// State Interface
// ============================================

export interface SavingsState {
  goals: SavingsGoal[];
  selectedGoal: SavingsGoal | null;
  loading: boolean;
  goalsLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  fundLoading: boolean;
  withdrawLoading: boolean;
  error: string | null;
  lastFundedGoalId: string | null;
  lastWithdrawalGoalId: string | null;
}

const initialState: SavingsState = {
  goals: [],
  selectedGoal: null,
  loading: false,
  goalsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  fundLoading: false,
  withdrawLoading: false,
  error: null,
  lastFundedGoalId: null,
  lastWithdrawalGoalId: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Fetch all savings goals
 */
export const fetchAllGoals = createAsyncThunk(
  'savings/fetchAllGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await savingsService.getAllGoals();
      return response.data.goals;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Failed to fetch goals';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create a new savings goal
 */
export const createSavingsGoal = createAsyncThunk(
  'savings/createGoal',
  async (data: CreateGoalRequest, { rejectWithValue }) => {
    try {
      const response = await savingsService.createGoal(data);
      return response.data.goal;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Failed to create goal';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch a specific goal by ID
 */
export const fetchGoalById = createAsyncThunk(
  'savings/fetchGoalById',
  async (goalId: string, { rejectWithValue }) => {
    try {
      const response = await savingsService.getGoalById(goalId);
      return response.data.goal;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Failed to fetch goal details';
      console.error('Redux: fetchGoalById error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update a savings goal
 */
export const updateSavingsGoal = createAsyncThunk(
  'savings/updateGoal',
  async ({ goalId, data }: { goalId: string; data: UpdateGoalRequest }, { rejectWithValue }) => {
    try {
      const response = await savingsService.updateGoal(goalId, data);
      return response.data.goal;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Failed to update goal';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Delete a savings goal
 */
export const deleteSavingsGoal = createAsyncThunk(
  'savings/deleteGoal',
  async (goalId: string, { rejectWithValue }) => {
    try {
      await savingsService.deleteGoal(goalId);
      return goalId;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Failed to delete goal';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fund a savings goal
 */
export const fundSavingsGoal = createAsyncThunk(
  'savings/fundGoal',
  async ({ goalId, data }: { goalId: string; data: FundGoalRequest }, { rejectWithValue }) => {
    try {
      const response = await savingsService.fundGoal(goalId, data);
      return { goal: response.data.goal, goalId };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Failed to fund goal';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Withdraw from a savings goal
 */
export const withdrawFromSavingsGoal = createAsyncThunk(
  'savings/withdrawFromGoal',
  async (
    { goalId, data }: { goalId: string; data: WithdrawFromGoalRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await savingsService.withdrawFromGoal(goalId, data);
      return { goal: response.data.goal, goalId };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || 'Failed to withdraw from goal';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================
// Slice
// ============================================

const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedGoal: (state) => {
      state.selectedGoal = null;
    },
    clearLastFundedGoal: (state) => {
      state.lastFundedGoalId = null;
    },
    clearLastWithdrawalGoal: (state) => {
      state.lastWithdrawalGoalId = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all goals
    builder
      .addCase(fetchAllGoals.pending, (state) => {
        state.goalsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllGoals.fulfilled, (state, action: PayloadAction<SavingsGoal[]>) => {
        state.goalsLoading = false;
        state.goals = action.payload;
      })
      .addCase(fetchAllGoals.rejected, (state, action) => {
        state.goalsLoading = false;
        state.error = action.payload as string;
      });

    // Create goal
    builder
      .addCase(createSavingsGoal.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createSavingsGoal.fulfilled, (state, action: PayloadAction<SavingsGoal>) => {
        state.createLoading = false;
        state.goals.push(action.payload);
      })
      .addCase(createSavingsGoal.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      });

    // Fetch goal by ID
    builder
      .addCase(fetchGoalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoalById.fulfilled, (state, action: PayloadAction<SavingsGoal>) => {
        state.loading = false;
        state.selectedGoal = action.payload;
        // Update the goal in the goals array if it exists
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(fetchGoalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update goal
    builder
      .addCase(updateSavingsGoal.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateSavingsGoal.fulfilled, (state, action: PayloadAction<SavingsGoal>) => {
        state.updateLoading = false;
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.selectedGoal?.id === action.payload.id) {
          state.selectedGoal = action.payload;
        }
      })
      .addCase(updateSavingsGoal.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // Delete goal
    builder
      .addCase(deleteSavingsGoal.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteSavingsGoal.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteLoading = false;
        state.goals = state.goals.filter((g) => g.id !== action.payload);
        if (state.selectedGoal?.id === action.payload) {
          state.selectedGoal = null;
        }
      })
      .addCase(deleteSavingsGoal.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload as string;
      });

    // Fund goal
    builder
      .addCase(fundSavingsGoal.pending, (state) => {
        state.fundLoading = true;
        state.error = null;
      })
      .addCase(
        fundSavingsGoal.fulfilled,
        (state, action: PayloadAction<{ goal: SavingsGoal; goalId: string }>) => {
          state.fundLoading = false;
          const index = state.goals.findIndex((g) => g.id === action.payload.goalId);
          if (index !== -1) {
            state.goals[index] = action.payload.goal;
          }
          if (state.selectedGoal?.id === action.payload.goalId) {
            state.selectedGoal = action.payload.goal;
          }
          state.lastFundedGoalId = action.payload.goalId;
        }
      )
      .addCase(fundSavingsGoal.rejected, (state, action) => {
        state.fundLoading = false;
        state.error = action.payload as string;
      });

    // Withdraw from goal
    builder
      .addCase(withdrawFromSavingsGoal.pending, (state) => {
        state.withdrawLoading = true;
        state.error = null;
      })
      .addCase(
        withdrawFromSavingsGoal.fulfilled,
        (state, action: PayloadAction<{ goal: SavingsGoal; goalId: string }>) => {
          state.withdrawLoading = false;
          const index = state.goals.findIndex((g) => g.id === action.payload.goalId);
          if (index !== -1) {
            state.goals[index] = action.payload.goal;
          }
          if (state.selectedGoal?.id === action.payload.goalId) {
            state.selectedGoal = action.payload.goal;
          }
          state.lastWithdrawalGoalId = action.payload.goalId;
        }
      )
      .addCase(withdrawFromSavingsGoal.rejected, (state, action) => {
        state.withdrawLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedGoal, clearLastFundedGoal, clearLastWithdrawalGoal } =
  savingsSlice.actions;

export default savingsSlice.reducer;

