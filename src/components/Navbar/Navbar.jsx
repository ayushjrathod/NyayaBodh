import "boxicons/css/boxicons.min.css";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

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
          <img
            src="../src/assets/Avatar.png"
            className="size-10 r-2 mt-3 cursor-pointer border-2 border-gray-200 rounded-full"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          />
          <div ref={popoverRef}>
            {isPopoverOpen && (
              <div className="z-50 absolute right-0 mt-12 w-48 bg-white border rounded-lg shadow-lg">
                <div className="p-4">
                  <p className="font-bold text-gray-600">Justice S. Kapoor</p>
                  <p className="text-gray-500">Head Judge</p>
                </div>
                <hr />
                <div className="p-4">
                  <Link to="/profile" className="block text-gray-800 hover:text-[#6048F6]">
                    Profile
                  </Link>
                  <Link to="/logout" className="block text-gray-800 hover:text-[#6048F6] mt-2">
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
