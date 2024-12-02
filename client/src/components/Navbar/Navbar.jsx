import { useAuth0 } from "@auth0/auth0-react";
import "boxicons/css/boxicons.min.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsPopoverOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="w-full h-fit flex px-[10px] justify-between select-none">
        <div className="flex gap-6">
          <a className="font-logo text-white py-[9px] flex" href="/">
            <img src="../src/assets/logoNB.png" className="size-8" />
          </a>
          <div className="flex mt-1">
            <div className="text-md tracking-wide flex gap-6 mr-6">
              <Link className="hover:text-[#6048F6]" to="/">
                <p className="py-1 mr-2 font-bold">Home</p>
              </Link>
              <Link className="hover:text-[#6048F6]" to="/recommend">
                <p className="py-1 mr-2">Recommend</p>
              </Link>
              <Link className="hover:text-[#6048F6]" to="/resources">
                <p className="mr-2 py-1 ">Resources</p>
              </Link>
              <Link className="hover:text-[#6048F6]" to="/contact">
                <p className="mr-2 py-1 ">Contact us</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex relative mr-2">
          {!isAuthenticated && (
            <button className="bg-[#6048F6] text-white px-4 py-2 rounded-md" onClick={loginWithRedirect}>
              {" "}
              Login{" "}
            </button>
          )}
          {isAuthenticated && (
            <div>
              <img
                src={user.picture}
                className="size-10 r-2 mt-3 cursor-pointer border-2 border-gray-200 rounded-full"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              />
              <div ref={popoverRef}>
                {isPopoverOpen && (
                  <div className="z-50 absolute right-0 mt-12 w-48 bg-white border rounded-lg shadow-lg">
                    <div className="p-4">
                      <p className="font-bold text-gray-600">{user.name}</p>
                      <p className="text-gray-500">Head Judge</p>
                    </div>
                    <hr />
                    <div className="p-4">
                      <Link to="/profile" className="block text-gray-800 hover:text-[#6048F6]">
                        Profile
                      </Link>
                      <button
                        onClick={() => logoutWithRedirect()}
                        className="block text-gray-800 hover:text-[#6048F6] mt-2"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
