import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const PublicRoute = ({ children, redirectTo = "/" }) => {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect them away from public-only pages (like login)
  if (isAuthenticated && localStorage.getItem("token")) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default PublicRoute;
