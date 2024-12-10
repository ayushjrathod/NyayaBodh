import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, login, logout, updateProfile } from "../store/slices/userSlice";

export const useUser = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  return {
    user,
    login: (userData) => dispatch(login(userData)),
    logout: () => dispatch(logout()),
    fetchProfile: () => dispatch(fetchUserProfile()),
    updateProfile: (profileData) => dispatch(updateProfile(profileData)),
  };
};
