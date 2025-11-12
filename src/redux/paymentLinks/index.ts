import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as paymentLinksService from '../../services/paymentLinksService';
import {
  PaymentLink,
  CreateGoalLinkRequest,
  CreateEventLinkRequest,
  CreateWalletLinkRequest,
  UpdatePaymentLinkRequest,
} from '../../services/paymentLinksService';

// ============================================
// State Interface
// ============================================

export interface PaymentLinksState {
  links: PaymentLink[];
  selectedLink: PaymentLink | null;
  loading: boolean;
  linksLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  analyticsLoading: boolean;
  error: string | null;
}

const initialState: PaymentLinksState = {
  links: [],
  selectedLink: null,
  loading: false,
  linksLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  analyticsLoading: false,
  error: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Fetch all payment links for the current user
 */
export const fetchMyPaymentLinks = createAsyncThunk(
  'paymentLinks/fetchMyLinks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentLinksService.getMyPaymentLinks();
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to fetch payment links';
      console.error('Fetch payment links error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create a payment link for a savings goal
 */
export const createGoalPaymentLink = createAsyncThunk(
  'paymentLinks/createGoalLink',
  async (data: CreateGoalLinkRequest, { rejectWithValue }) => {
    try {
      const response = await paymentLinksService.createGoalLink(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create goal payment link';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create a payment link for an event
 */
export const createEventPaymentLink = createAsyncThunk(
  'paymentLinks/createEventLink',
  async (data: CreateEventLinkRequest, { rejectWithValue }) => {
    try {
      const response = await paymentLinksService.createEventLink(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create event payment link';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create a general wallet payment link
 */
export const createWalletPaymentLink = createAsyncThunk(
  'paymentLinks/createWalletLink',
  async (data: CreateWalletLinkRequest, { rejectWithValue }) => {
    try {
      const response = await paymentLinksService.createWalletLink(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create wallet payment link';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Get public view of a payment link
 */
export const fetchPaymentLinkByToken = createAsyncThunk(
  'paymentLinks/fetchByToken',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await paymentLinksService.getPaymentLinkByToken(token);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to fetch payment link';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Get analytics for a payment link
 */
export const fetchPaymentLinkAnalytics = createAsyncThunk(
  'paymentLinks/fetchAnalytics',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await paymentLinksService.getPaymentLinkAnalytics(token);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to fetch analytics';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update a payment link
 */
export const updatePaymentLink = createAsyncThunk(
  'paymentLinks/update',
  async ({ token, data }: { token: string; data: UpdatePaymentLinkRequest }, { rejectWithValue }) => {
    try {
      const response = await paymentLinksService.updatePaymentLink(token, data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to update payment link';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Delete (deactivate) a payment link
 */
export const deletePaymentLink = createAsyncThunk(
  'paymentLinks/delete',
  async (token: string, { rejectWithValue }) => {
    try {
      await paymentLinksService.deletePaymentLink(token);
      return token;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete payment link';
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================
// Slice
// ============================================

const paymentLinksSlice = createSlice({
  name: 'paymentLinks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedLink: (state) => {
      state.selectedLink = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch my payment links
    builder
      .addCase(fetchMyPaymentLinks.pending, (state) => {
        state.linksLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPaymentLinks.fulfilled, (state, action: PayloadAction<PaymentLink[]>) => {
        state.linksLoading = false;
        state.links = action.payload;
      })
      .addCase(fetchMyPaymentLinks.rejected, (state, action) => {
        state.linksLoading = false;
        state.error = action.payload as string;
      });

    // Create goal payment link
    builder
      .addCase(createGoalPaymentLink.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createGoalPaymentLink.fulfilled, (state, action: PayloadAction<PaymentLink>) => {
        state.createLoading = false;
        state.links.unshift(action.payload);
        state.selectedLink = action.payload;
      })
      .addCase(createGoalPaymentLink.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      });

    // Create event payment link
    builder
      .addCase(createEventPaymentLink.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createEventPaymentLink.fulfilled, (state, action: PayloadAction<PaymentLink>) => {
        state.createLoading = false;
        state.links.unshift(action.payload);
        state.selectedLink = action.payload;
      })
      .addCase(createEventPaymentLink.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      });

    // Create wallet payment link
    builder
      .addCase(createWalletPaymentLink.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createWalletPaymentLink.fulfilled, (state, action: PayloadAction<PaymentLink>) => {
        state.createLoading = false;
        state.links.unshift(action.payload);
        state.selectedLink = action.payload;
      })
      .addCase(createWalletPaymentLink.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      });

    // Fetch payment link by token
    builder
      .addCase(fetchPaymentLinkByToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentLinkByToken.fulfilled, (state, action: PayloadAction<PaymentLink>) => {
        state.loading = false;
        state.selectedLink = action.payload;
      })
      .addCase(fetchPaymentLinkByToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch payment link analytics
    builder
      .addCase(fetchPaymentLinkAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentLinkAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        // Update selected link with analytics data
        if (state.selectedLink) {
          state.selectedLink = {
            ...state.selectedLink,
            ...action.payload.link,
          };
        }
      })
      .addCase(fetchPaymentLinkAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      });

    // Update payment link
    builder
      .addCase(updatePaymentLink.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentLink.fulfilled, (state, action: PayloadAction<PaymentLink>) => {
        state.updateLoading = false;
        const index = state.links.findIndex((l) => l.token === action.payload.token);
        if (index !== -1) {
          state.links[index] = action.payload;
        }
        if (state.selectedLink?.token === action.payload.token) {
          state.selectedLink = action.payload;
        }
      })
      .addCase(updatePaymentLink.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // Delete payment link
    builder
      .addCase(deletePaymentLink.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deletePaymentLink.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteLoading = false;
        state.links = state.links.filter((l) => l.token !== action.payload);
        if (state.selectedLink?.token === action.payload) {
          state.selectedLink = null;
        }
      })
      .addCase(deletePaymentLink.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedLink } = paymentLinksSlice.actions;

export default paymentLinksSlice.reducer;
