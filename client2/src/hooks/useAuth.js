import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthState } from "../store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userRole } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check auth state on mount
    dispatch(checkAuthState());
  }, [dispatch]);

  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";

  return {
    isAuthenticated,
    userRole,
    isAdmin,
    isUser,
  };
};

export default useAuth;
