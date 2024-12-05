import { Outlet } from "react-router-dom";
import NewNavBar from "../Navbar/NewNavbar";

const Layout = () => {
  return (
    <div>
      {/* <Navbar /> */}
      <NewNavBar />
      <Outlet />
    </div>
  );
};

export default Layout;
