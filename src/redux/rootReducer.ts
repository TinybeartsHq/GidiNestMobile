import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth';
import { authReducerV2 } from './auth/indexV2';
import walletReducer from './wallet/walletSlice';
import accountReducer from './account/accountSlice';
import savingsReducer from './savings';
import paymentLinksReducer from './paymentLinks';
// Import other reducers here as you add them
// import communityReducer from './community/communitySlice';

const rootReducer = combineReducers({
  auth: authReducer, // V1 - Legacy (keep for backward compatibility during migration)
  authV2: authReducerV2, // V2 - New authentication system
  wallet: walletReducer, // V1 - Wallet operations
  account: accountReducer, // V1 - Account/Profile/KYC operations
  savings: savingsReducer, // V1 - Savings goals operations
  paymentLinks: paymentLinksReducer, // V2 - Payment links operations
  // Add other reducers here
  // community: communityReducer,
});

export default rootReducer;

