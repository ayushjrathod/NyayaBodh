import { Spinner } from "@nextui-org/react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles, adminOnly }) => {
  const { isAuthenticated, userRole } = useAuth();

  // Show loading spinner while checking authentication status
  if (isAuthenticated === undefined) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!isAuthenticated || !localStorage.getItem("token")) {
    return <Navigate to="/welcome" replace />;
  }

  // Check for admin-only access
  if (adminOnly && userRole !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for specific role-based access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  adminOnly: PropTypes.bool,
};

export default ProtectedRoute;
