import { Link } from "react-router-dom";

const Navbar = ({ toggleDrawer }) => (
  <nav className="bg-white border-b border-gray-200 px-8 py-4 fixed left-0 right-0 top-0 z-50 h-16">
    <div className="flex justify-between items-center">
      <button
        className="p-1 mr-1 mt text-gray-600 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 md:hidden"
        onClick={toggleDrawer}
      >
        <p>More</p>
      </button>
      <Link to="/chatbot" className="p-1 font-semibold whitespace-nowrap">
        AlliedBot 2.0
      </Link>
      <Link to="/" className="text-xl text-gray-800">
        <i className="bx bx-home"></i>
      </Link>
    </div>
  </nav>
);

export default Navbar;
