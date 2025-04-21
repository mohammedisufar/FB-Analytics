import { configureStore } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import authReducer from './slices/authSlice';
import userManagementReducer from './slices/userManagementSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import facebookReducer from './slices/facebookSlice';

let store;

const initialState = {};

function initStore(preloadedState = initialState) {
  return configureStore({
    reducer: {
      auth: authReducer,
      userManagement: userManagementReducer,
      subscription: subscriptionReducer,
      facebook: facebookReducer,
    },
    preloadedState,
  });
}

export const initializeStore = (preloadedState) => {
  let _store = store ?? initStore(preloadedState);

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;
  
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
}
