import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import NewNavBar from "../Navbar/NewNavbar";

const Layout = () => {
    return (
        <div>
            {/* <Navbar /> */}
            <NewNavBar />
            <Outlet />
        </div>
    )
}

export default Layout;