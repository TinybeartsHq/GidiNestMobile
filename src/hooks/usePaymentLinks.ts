import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchMyPaymentLinks,
  createGoalPaymentLink,
  createEventPaymentLink,
  createWalletPaymentLink,
  fetchPaymentLinkByToken,
  fetchPaymentLinkAnalytics,
  updatePaymentLink,
  deletePaymentLink,
  clearError,
  clearSelectedLink,
} from '../redux/paymentLinks';
import {
  CreateGoalLinkRequest,
  CreateEventLinkRequest,
  CreateWalletLinkRequest,
  UpdatePaymentLinkRequest,
} from '../services/paymentLinksService';

/**
 * Custom hook for payment links operations
 * Provides access to payment links state and actions
 */
export const usePaymentLinks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentLinksState = useSelector((state: RootState) => state.paymentLinks);

  return {
    // State
    links: paymentLinksState.links,
    selectedLink: paymentLinksState.selectedLink,
    loading: paymentLinksState.loading,
    linksLoading: paymentLinksState.linksLoading,
    createLoading: paymentLinksState.createLoading,
    updateLoading: paymentLinksState.updateLoading,
    deleteLoading: paymentLinksState.deleteLoading,
    analyticsLoading: paymentLinksState.analyticsLoading,
    error: paymentLinksState.error,

    // Actions - Fetch
    getMyLinks: () => dispatch(fetchMyPaymentLinks()),
    getLinkByToken: (token: string) => dispatch(fetchPaymentLinkByToken(token)),
    getLinkAnalytics: (token: string) => dispatch(fetchPaymentLinkAnalytics(token)),

    // Actions - Create
    createGoalLink: (data: CreateGoalLinkRequest) => dispatch(createGoalPaymentLink(data)),
    createEventLink: (data: CreateEventLinkRequest) => dispatch(createEventPaymentLink(data)),
    createWalletLink: (data: CreateWalletLinkRequest) => dispatch(createWalletPaymentLink(data)),

    // Actions - Update/Delete
    updateLink: (token: string, data: UpdatePaymentLinkRequest) =>
      dispatch(updatePaymentLink({ token, data })),
    deleteLink: (token: string) => dispatch(deletePaymentLink(token)),

    // Utility actions
    clearError: () => dispatch(clearError()),
    clearSelectedLink: () => dispatch(clearSelectedLink()),
  };
};
