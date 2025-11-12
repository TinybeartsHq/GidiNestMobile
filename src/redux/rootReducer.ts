import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth';
import { authReducerV2 } from './auth/indexV2';
import walletReducer from './wallet/walletSlice';
// Import other reducers here as you add them
// import savingsReducer from './savings/savingsSlice';
// import communityReducer from './community/communitySlice';
// import userProfileReducer from './userProfile/userProfileSlice';

const rootReducer = combineReducers({
  auth: authReducer, // V1 - Legacy (keep for backward compatibility during migration)
  authV2: authReducerV2, // V2 - New authentication system
  wallet: walletReducer, // V1 - Wallet operations
  // Add other reducers here
  // savings: savingsReducer,
  // community: communityReducer,
  // userProfile: userProfileReducer,
});

export default rootReducer;

