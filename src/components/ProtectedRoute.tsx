import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({
  allowedRoles,
  requireApproval = true,
}: {
  allowedRoles?: string[];
  requireApproval?: boolean;
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Student accounts must be approved before accessing contest arena & dashboard
  if (user.role === 'STUDENT' && requireApproval) {
    if (user.approved === false || user.status === 'PENDING' || user.status === 'REJECTED') {
      return (
        <Navigate
          to={`/account/pending?email=${encodeURIComponent(user.email)}&studentId=${encodeURIComponent(user.id)}`}
          replace
        />
      );
    }
  }

  return <Outlet />;
};
