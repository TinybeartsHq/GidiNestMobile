import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth';
import { authReducerV2 } from './auth/indexV2';
import walletReducer from './wallet/walletSlice';
import accountReducer from './account/accountSlice';
// Import other reducers here as you add them
// import savingsReducer from './savings/savingsSlice';
// import communityReducer from './community/communitySlice';

const rootReducer = combineReducers({
  auth: authReducer, // V1 - Legacy (keep for backward compatibility during migration)
  authV2: authReducerV2, // V2 - New authentication system
  wallet: walletReducer, // V1 - Wallet operations
  account: accountReducer, // V1 - Account/Profile/KYC operations
  // Add other reducers here
  // savings: savingsReducer,
  // community: communityReducer,
});

export default rootReducer;

