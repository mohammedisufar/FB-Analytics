import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PricingPage from '../src/pages/pricing';
import { getSubscriptionPlans, getCurrentSubscription, createCheckoutSession } from '../src/redux/slices/subscriptionSlice';

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

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

describe('Pricing Page', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          roles: [{ id: '1', name: 'FREE_USER' }],
          permissions: ['subscriptions:read']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      subscription: {
        plans: [
          { id: '1', name: 'Free', price: 0, billingInterval: 'MONTHLY', description: 'Free plan' },
          { id: '2', name: 'Pro', price: 49, billingInterval: 'MONTHLY', description: 'Pro plan' },
          { id: '3', name: 'Enterprise', price: 199, billingInterval: 'MONTHLY', description: 'Enterprise plan' }
        ],
        currentSubscription: {
          id: '101',
          plan: { id: '1', name: 'Free', price: 0, billingInterval: 'MONTHLY' },
          status: 'ACTIVE',
          startDate: '2023-01-01T00:00:00.000Z'
        },
        loading: false,
        error: null
      }
    });
    store.dispatch = jest.fn();
  });

  test('renders pricing page with subscription plans', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PricingPage />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/Subscription Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Current Subscription/i)).toBeInTheDocument();
    expect(screen.getByText(/Free/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise/i)).toBeInTheDocument();
  });

  test('fetches subscription plans and current subscription on mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PricingPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if actions were dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  test('displays current subscription details', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PricingPage />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/Plan:/i)).toBeInTheDocument();
    expect(screen.getByText(/Free/i)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/Price:/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0\/monthly/i)).toBeInTheDocument();
  });

  test('allows selecting a new subscription plan', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PricingPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Find and click the Pro plan subscribe button
    const proSubscribeButton = screen.getAllByText(/Subscribe/i)[0];
    fireEvent.click(proSubscribeButton);
    
    // Check if confirmation dialog is shown
    await waitFor(() => {
      expect(screen.getByText(/Confirm Subscription/i)).toBeInTheDocument();
      expect(screen.getByText(/Pro Plan/i)).toBeInTheDocument();
    });
    
    // Confirm subscription
    fireEvent.click(screen.getByRole('button', { name: /Subscribe/i }));
    
    // Check if createCheckoutSession action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // createCheckoutSession is a thunk
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
          roles: [{ id: '1', name: 'FREE_USER' }],
          permissions: ['subscriptions:read']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      subscription: {
        plans: [],
        currentSubscription: null,
        loading: true,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PricingPage />
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
          roles: [{ id: '1', name: 'FREE_USER' }],
          permissions: ['subscriptions:read']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      subscription: {
        plans: [],
        currentSubscription: null,
        loading: false,
        error: 'Failed to fetch subscription plans'
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PricingPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if error message is displayed
    expect(screen.getByText(/Failed to fetch subscription plans/i)).toBeInTheDocument();
  });

  test('allows canceling current subscription', async () => {
    // Set up store with active paid subscription
    store = mockStore({
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          roles: [{ id: '2', name: 'PAID_USER' }],
          permissions: ['subscriptions:write']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      subscription: {
        plans: [
          { id: '1', name: 'Free', price: 0, billingInterval: 'MONTHLY', description: 'Free plan' },
          { id: '2', name: 'Pro', price: 49, billingInterval: 'MONTHLY', description: 'Pro plan' }
        ],
        currentSubscription: {
          id: '101',
          plan: { id: '2', name: 'Pro', price: 49, billingInterval: 'MONTHLY' },
          status: 'ACTIVE',
          startDate: '2023-01-01T00:00:00.000Z'
        },
        loading: false,
        error: null
      }
    });
    store.dispatch = jest.fn();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <PricingPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Find and click the cancel subscription button
    const cancelButton = screen.getByText(/Cancel Subscription/i);
    fireEvent.click(cancelButton);
    
    // Check if confirmation dialog is shown
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to cancel your subscription?/i)).toBeInTheDocument();
    });
    
    // Confirm cancellation
    fireEvent.click(screen.getByRole('button', { name: /Cancel Subscription/i }));
    
    // Check if cancelSubscription action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // cancelSubscription is a thunk
      );
    });
  });
});
