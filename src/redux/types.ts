// Redux types and interfaces
import { store } from './store';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export from store for convenience
export { type RootState, type AppDispatch } from './store';

