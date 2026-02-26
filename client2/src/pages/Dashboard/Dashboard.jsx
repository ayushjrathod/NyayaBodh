import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/userSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user.isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user.isLoggedIn]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
      {/* Render role-specific content */}
    </div>
  );
};

export default Dashboard;
