import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import LoginPage from '../src/pages/login';
import { login } from '../src/redux/slices/authSlice';

// Mock redux store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock useRouter
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Login Page', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null
      }
    });
    store.dispatch = jest.fn();
  });

  test('renders login form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Try to submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
    
    // Fill in invalid email
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' },
    });
    
    // Check for email validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill in valid data
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Check if login action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // login is a thunk, so it's a function
      );
    });
  });

  test('displays error message when login fails', async () => {
    // Set up store with error
    store = mockStore({
      auth: {
        user: null,
        token: null,
        loading: false,
        error: 'Invalid credentials'
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if error message is displayed
    expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  test('shows loading state during login', async () => {
    // Set up store with loading state
    store = mockStore({
      auth: {
        user: null,
        token: null,
        loading: true,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if loading indicator is shown and button is disabled
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeDisabled();
  });
});
