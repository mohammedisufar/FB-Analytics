import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import UserManagementPage from '../src/pages/user-management';
import { getAllUsers, createUser, updateUser, deleteUser, getAllRoles } from '../src/redux/slices/userManagementSlice';

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

describe('User Management Page', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: {
          id: '1',
          email: 'admin@example.com',
          roles: [{ id: '1', name: 'ADMIN' }],
          permissions: ['users:read', 'users:write']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      userManagement: {
        users: [
          { 
            id: '1', 
            email: 'admin@example.com', 
            firstName: 'Admin', 
            lastName: 'User', 
            isActive: true, 
            createdAt: '2023-01-01T00:00:00.000Z',
            roles: [{ id: '1', name: 'ADMIN' }]
          },
          { 
            id: '2', 
            email: 'user@example.com', 
            firstName: 'Regular', 
            lastName: 'User', 
            isActive: true, 
            createdAt: '2023-01-02T00:00:00.000Z',
            roles: [{ id: '2', name: 'FREE_USER' }]
          }
        ],
        roles: [
          { id: '1', name: 'ADMIN', description: 'Administrator' },
          { id: '2', name: 'FREE_USER', description: 'Free User' },
          { id: '3', name: 'PAID_USER', description: 'Paid User' }
        ],
        loading: false,
        error: null
      }
    });
    store.dispatch = jest.fn();
  });

  test('renders user management page with user list', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Add User/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
  });

  test('fetches users and roles on mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if actions were dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  test('opens add user dialog when Add User button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Click Add User button
    fireEvent.click(screen.getByText(/Add User/i));
    
    // Check if dialog is opened
    await waitFor(() => {
      expect(screen.getByText(/Add User/i, { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });
  });

  test('creates a new user when form is submitted', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Click Add User button
    fireEvent.click(screen.getByText(/Add User/i));
    
    // Fill in form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'newuser@example.com' },
      });
      
      fireEvent.change(screen.getByLabelText(/First Name/i), {
        target: { value: 'New' },
      });
      
      fireEvent.change(screen.getByLabelText(/Last Name/i), {
        target: { value: 'User' },
      });
      
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'password123' },
      });
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    // Check if createUser action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // createUser is a thunk
      );
    });
  });

  test('opens edit user dialog when Edit button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Find and click the first Edit button
    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(button => button.querySelector('svg[data-testid="EditIcon"]'));
    fireEvent.click(editButton);
    
    // Check if dialog is opened with user data
    await waitFor(() => {
      expect(screen.getByText(/Edit User/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/admin@example.com/i)).toBeInTheDocument();
    });
  });

  test('updates a user when edit form is submitted', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Find and click the first Edit button
    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(button => button.querySelector('svg[data-testid="EditIcon"]'));
    fireEvent.click(editButton);
    
    // Update form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/First Name/i), {
        target: { value: 'Updated' },
      });
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));
    
    // Check if updateUser action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // updateUser is a thunk
      );
    });
  });

  test('opens delete confirmation dialog when Delete button is clicked', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Find and click the first Delete button
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(button => button.querySelector('svg[data-testid="DeleteIcon"]'));
    fireEvent.click(deleteButton);
    
    // Check if confirmation dialog is opened
    await waitFor(() => {
      expect(screen.getByText(/Delete User/i)).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete the user/i)).toBeInTheDocument();
    });
  });

  test('deletes a user when confirmation is given', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Find and click the first Delete button
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(button => button.querySelector('svg[data-testid="DeleteIcon"]'));
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    });
    
    // Check if deleteUser action was dispatched
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.any(Function) // deleteUser is a thunk
      );
    });
  });

  test('displays loading state during data fetch', async () => {
    // Set up store with loading state
    store = mockStore({
      auth: {
        user: {
          id: '1',
          email: 'admin@example.com',
          roles: [{ id: '1', name: 'ADMIN' }],
          permissions: ['users:read', 'users:write']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      userManagement: {
        users: [],
        roles: [],
        loading: true,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
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
          email: 'admin@example.com',
          roles: [{ id: '1', name: 'ADMIN' }],
          permissions: ['users:read', 'users:write']
        },
        token: 'test-token',
        loading: false,
        error: null
      },
      userManagement: {
        users: [],
        roles: [],
        loading: false,
        error: 'Failed to fetch users'
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserManagementPage />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if error message is displayed
    expect(screen.getByText(/Failed to fetch users/i)).toBeInTheDocument();
  });
});
