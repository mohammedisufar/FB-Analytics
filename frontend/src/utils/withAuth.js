import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../redux/slices/authSlice';

const withAuth = (WrappedComponent, requiredPermissions = []) => {
  const AuthComponent = (props) => {
    const { isAuthenticated, loading, user, permissions } = useSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
      // If we have a token but no user data, fetch the user
      if (isAuthenticated && !user && !loading) {
        dispatch(getCurrentUser());
      }
    }, [isAuthenticated, user, loading, dispatch]);

    useEffect(() => {
      // If not authenticated and not loading, redirect to login
      if (!isAuthenticated && !loading) {
        router.push('/login');
      }
      
      // If authenticated and we have permissions to check
      if (isAuthenticated && user && requiredPermissions.length > 0) {
        // Check if user has all required permissions
        const hasPermissions = requiredPermissions.every(permission => 
          permissions.includes(permission)
        );
        
        if (!hasPermissions) {
          // Redirect to unauthorized page
          router.push('/unauthorized');
        }
      }
    }, [isAuthenticated, loading, user, permissions, router]);

    // Show loading state while checking authentication
    if (loading || !isAuthenticated || !user) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      );
    }

    // If authenticated and has required permissions, render the component
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
