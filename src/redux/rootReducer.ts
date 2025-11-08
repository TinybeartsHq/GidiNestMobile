import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth';
// Import other reducers here as you add them
// import savingsReducer from './savings/savingsSlice';
// import communityReducer from './community/communitySlice';
// import userProfileReducer from './userProfile/userProfileSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
  // savings: savingsReducer,
  // community: communityReducer,
  // userProfile: userProfileReducer,
});

export default rootReducer;

