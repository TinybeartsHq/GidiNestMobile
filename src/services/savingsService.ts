import apiClient from '../utils/apiClient';

// Base URL for V1 savings endpoints
const V1_SAVINGS_BASE = '/v1/savings';

// ============================================
// Types & Interfaces
// ============================================

// API Response from backend
export interface SavingsGoalApiResponse {
  id: number;
  name: string;
  target_amount: string;
  amount: string;
  status: string;
  accrued_interest: string;
  interest_rate: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
  category?: string;
}

// Transformed interface for app usage
export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category?: string;
  status?: string;
  accrued_interest?: number;
  interest_rate?: number;
  created_at: string;
  updated_at: string;
}

// API Response interfaces (what backend sends)
export interface GoalsListApiResponse {
  status: boolean;
  data: SavingsGoalApiResponse[];
  message?: string;
}

export interface GoalDetailApiResponse {
  status: boolean;
  data: SavingsGoalApiResponse;
  message?: string;
  detail?: string;
}

// App interfaces (transformed for use)
export interface GoalsListResponse {
  success: boolean;
  data: {
    goals: SavingsGoal[];
  };
}

export interface GoalDetailResponse {
  success: boolean;
  data: {
    goal: SavingsGoal;
  };
}

export interface CreateGoalRequest {
  name: string;
  target_amount: number;
  deadline?: string;
  category?: string;
}

export interface CreateGoalResponse {
  success: boolean;
  detail: string;
  data: {
    goal: SavingsGoal;
  };
}

export interface UpdateGoalRequest {
  name?: string;
  target_amount?: number;
  deadline?: string;
  category?: string;
}

export interface UpdateGoalResponse {
  success: boolean;
  detail: string;
  data: {
    goal: SavingsGoal;
  };
}

export interface DeleteGoalResponse {
  success: boolean;
  detail: string;
}

export interface FundGoalRequest {
  amount: number;
  transaction_pin: string;
}

export interface FundGoalResponse {
  success: boolean;
  detail: string;
  data: {
    goal: SavingsGoal;
    transaction: {
      id: string;
      amount: number;
      created_at: string;
    };
  };
}

export interface WithdrawFromGoalRequest {
  amount: number;
  transaction_pin: string;
}

export interface WithdrawFromGoalResponse {
  success: boolean;
  detail: string;
  data: {
    goal: SavingsGoal;
    transaction: {
      id: string;
      amount: number;
      created_at: string;
    };
  };
}

// ============================================
// Transformation Functions
// ============================================

/**
 * Transform API response to app format
 */
const transformGoalFromApi = (apiGoal: SavingsGoalApiResponse | any): SavingsGoal => {
  if (!apiGoal) {
    throw new Error('Cannot transform undefined goal');
  }

  return {
    id: String(apiGoal.id ?? 'undefined'),
    name: apiGoal.name ?? '',
    target_amount: parseFloat(String(apiGoal.target_amount)) || 0,
    current_amount: parseFloat(String(apiGoal.amount)) || 0,
    deadline: apiGoal.deadline || '',
    category: apiGoal.category,
    status: apiGoal.status,
    accrued_interest: parseFloat(String(apiGoal.accrued_interest)) || 0,
    interest_rate: parseFloat(String(apiGoal.interest_rate)) || 0,
    created_at: apiGoal.created_at || '',
    updated_at: apiGoal.updated_at || '',
  };
};

// ============================================
// API Service Functions
// ============================================

/**
 * Get all savings goals
 * GET /api/v1/savings/goals/
 */
export const getAllGoals = async (): Promise<GoalsListResponse> => {
  try {
    const response = await apiClient.get<GoalsListApiResponse>(`${V1_SAVINGS_BASE}/goals/`);
    const apiResponse = response.data;

    // Transform API response to app format
    const transformedGoals = (apiResponse.data || []).map(transformGoalFromApi);

    return {
      success: apiResponse.status,
      data: {
        goals: transformedGoals,
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status && status !== 401 && status !== 403) {
      console.error('Get all goals error:', error);
    }
    throw error;
  }
};

/**
 * Create a new savings goal
 * POST /api/v1/savings/goals/
 */
export const createGoal = async (data: CreateGoalRequest): Promise<CreateGoalResponse> => {
  try {
    const response = await apiClient.post<GoalDetailApiResponse>(`${V1_SAVINGS_BASE}/goals/`, data);
    const apiResponse = response.data;

    // Transform API response to app format
    const transformedGoal = transformGoalFromApi(apiResponse.data);

    return {
      success: apiResponse.status,
      detail: apiResponse.detail || apiResponse.message || 'Goal created successfully',
      data: {
        goal: transformedGoal,
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    if (status && status !== 401 && status !== 403) {
      console.error('Create goal error:', {
        status,
        detail: errorData?.detail,
        data: errorData,
      });
    }
    throw error;
  }
};

/**
 * Get a specific savings goal by ID
 * GET /api/v1/savings/goals/{id}/
 */
export const getGoalById = async (goalId: string): Promise<GoalDetailResponse> => {
  try {
    const response = await apiClient.get<any>(`${V1_SAVINGS_BASE}/goals/${goalId}/`);
    const apiResponse = response.data;

    // BACKEND BUG WORKAROUND: The API returns an array of all goals instead of a single goal
    // We need to find the specific goal by ID from the array
    let goalData: SavingsGoalApiResponse;

    if (Array.isArray(apiResponse.data)) {
      const numericGoalId = parseInt(goalId, 10);
      const foundGoal = apiResponse.data.find((g: any) => g.id === numericGoalId || g.id === goalId);

      if (!foundGoal) {
        throw new Error(`Goal with ID ${goalId} not found in response`);
      }

      goalData = foundGoal;
    } else {
      // If backend returns a single goal object (as it should)
      goalData = apiResponse.data;
    }

    const transformedGoal = transformGoalFromApi(goalData);

    return {
      success: apiResponse.status,
      data: {
        goal: transformedGoal,
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    console.error('Get goal by ID error:', {
      goalId,
      status,
      url: `${V1_SAVINGS_BASE}/goals/${goalId}/`,
      detail: errorData?.detail,
      error: error?.message,
    });
    throw error;
  }
};

/**
 * Update a savings goal
 * PUT /api/v1/savings/goals/{id}/
 */
export const updateGoal = async (
  goalId: string,
  data: UpdateGoalRequest
): Promise<UpdateGoalResponse> => {
  try {
    const response = await apiClient.put<GoalDetailApiResponse>(`${V1_SAVINGS_BASE}/goals/${goalId}/`, data);
    const apiResponse = response.data;

    return {
      success: apiResponse.status,
      detail: apiResponse.detail || apiResponse.message || 'Goal updated successfully',
      data: {
        goal: transformGoalFromApi(apiResponse.data),
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    if (status && status !== 401 && status !== 403) {
      console.error('Update goal error:', {
        status,
        detail: errorData?.detail,
        data: errorData,
      });
    }
    throw error;
  }
};

/**
 * Delete a savings goal
 * DELETE /api/v1/savings/goals/{id}/
 */
export const deleteGoal = async (goalId: string): Promise<DeleteGoalResponse> => {
  try {
    const response = await apiClient.delete(`${V1_SAVINGS_BASE}/goals/${goalId}/`);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    if (status && status !== 401 && status !== 403) {
      console.error('Delete goal error:', {
        status,
        detail: errorData?.detail,
        data: errorData,
      });
    }
    throw error;
  }
};

/**
 * Fund a savings goal
 * POST /api/v1/savings/goals/{id}/fund/
 */
export const fundGoal = async (
  goalId: string,
  data: FundGoalRequest
): Promise<FundGoalResponse> => {
  try {
    const response = await apiClient.post(`${V1_SAVINGS_BASE}/goals/${goalId}/fund/`, data);
    const apiResponse = response.data;

    // BACKEND BUG WORKAROUND: API returns null data after funding
    // We need to fetch the updated goal separately
    let transformedGoal: SavingsGoal;

    if (!apiResponse.data) {
      console.log('Fund goal: API returned null data, fetching updated goal...');
      // Fetch the updated goal
      const updatedGoalResponse = await getGoalById(goalId);
      transformedGoal = updatedGoalResponse.data.goal;
    } else {
      transformedGoal = transformGoalFromApi(apiResponse.data);
    }

    return {
      success: apiResponse.status,
      detail: apiResponse.detail || apiResponse.message || 'Goal funded successfully',
      data: {
        goal: transformedGoal,
        transaction: apiResponse.data?.transaction || {
          id: String(Date.now()),
          amount: data.amount,
          created_at: new Date().toISOString(),
        },
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    if (status && status !== 401 && status !== 403) {
      console.error('Fund goal error:', {
        status,
        detail: errorData?.detail,
        data: errorData,
      });
    }
    throw error;
  }
};

/**
 * Withdraw from a savings goal
 * POST /api/v1/savings/goals/{id}/withdraw/
 */
export const withdrawFromGoal = async (
  goalId: string,
  data: WithdrawFromGoalRequest
): Promise<WithdrawFromGoalResponse> => {
  try {
    const response = await apiClient.post(`${V1_SAVINGS_BASE}/goals/${goalId}/withdraw/`, data);
    const apiResponse = response.data;

    // BACKEND BUG WORKAROUND: API returns null data after withdrawal
    // We need to fetch the updated goal separately
    let transformedGoal: SavingsGoal;

    if (!apiResponse.data) {
      console.log('Withdraw goal: API returned null data, fetching updated goal...');
      // Fetch the updated goal
      const updatedGoalResponse = await getGoalById(goalId);
      transformedGoal = updatedGoalResponse.data.goal;
    } else {
      transformedGoal = transformGoalFromApi(apiResponse.data);
    }

    return {
      success: apiResponse.status,
      detail: apiResponse.detail || apiResponse.message || 'Withdrawal completed successfully',
      data: {
        goal: transformedGoal,
        transaction: apiResponse.data?.transaction || {
          id: String(Date.now()),
          amount: data.amount,
          created_at: new Date().toISOString(),
        },
      },
    };
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    if (status && status !== 401 && status !== 403) {
      console.error('Withdraw from goal error:', {
        status,
        detail: errorData?.detail,
        data: errorData,
      });
    }
    throw error;
  }
};

// Export all as default object for convenience
export default {
  getAllGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  fundGoal,
  withdrawFromGoal,
};
