import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DashboardPage from '../src/pages/dashboard';
import { getFacebookAccounts, getInsights } from '../src/redux/slices/facebookSlice';

// Mock redux store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock withAuth HOC
jest.mock('../src/utils/withAuth', () => {
  return (Component) => {
    return (props) => <Component {...props} />;
  };
});

describe('Dashboard Page', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          roles: [{ id: '1', name: 'ADMIN' }],
          permissions: ['analytics:read']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      facebook: {
        accounts: [
          { id: '1', name: 'Test Account', adAccounts: [{ id: '101', name: 'Ad Account 1' }] }
        ],
        selectedAccount: { 
          id: '1', 
          name: 'Test Account', 
          adAccounts: [{ id: '101', name: 'Ad Account 1' }] 
        },
        insights: {},
        loading: false,
        error: null
      }
    });
    store.dispatch = jest.fn();
  });

  test('renders dashboard page', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Facebook Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Ad Account/i)).toBeInTheDocument();
  });

  test('fetches Facebook accounts on mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if getFacebookAccounts action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // getFacebookAccounts is a thunk
      );
    });
  });

  test('fetches insights when ad account is selected', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Select ad account
    fireEvent.change(screen.getByLabelText(/Ad Account/i), {
      target: { value: '101' },
    });
    
    // Check if getInsights action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // getInsights is a thunk
      );
    });
  });

  test('displays loading state during data fetch', async () => {
    // Set up store with loading state
    store = mockStore({
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          roles: [{ id: '1', name: 'ADMIN' }],
          permissions: ['analytics:read']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      facebook: {
        accounts: [],
        selectedAccount: null,
        insights: {},
        loading: true,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if loading indicator is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when data fetch fails', async () => {
    // Set up store with error
    store = mockStore({
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          roles: [{ id: '1', name: 'ADMIN' }],
          permissions: ['analytics:read']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      facebook: {
        accounts: [],
        selectedAccount: null,
        insights: {},
        loading: false,
        error: 'Failed to fetch Facebook accounts'
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if error message is displayed
    expect(screen.getByText(/Failed to fetch Facebook accounts/i)).toBeInTheDocument();
  });

  test('allows adding new widgets', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Click on Add Widget
    fireEvent.click(screen.getByText(/Add Widget/i));
    
    // Check if dialog is opened
    await waitFor(() => {
      expect(screen.getByText(/Widget Title/i)).toBeInTheDocument();
      expect(screen.getByText(/Widget Type/i)).toBeInTheDocument();
    });
    
    // Fill in widget details
    fireEvent.change(screen.getByLabelText(/Widget Title/i), {
      target: { value: 'Test Widget' },
    });
    
    // Add widget
    fireEvent.click(screen.getByRole('button', { name: /Add Widget/i }));
    
    // Check if widget is added (dialog should be closed)
    await waitFor(() => {
      expect(screen.queryByText(/Widget Title/i)).not.toBeInTheDocument();
    });
  });
});
