import React, { useEffect, useRef, useState } from "react";

const SpaceMenu = ({ space, setSpace }) => {
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
    <div className="relative inline-block group" ref={popoverRef}>
      <button className="text-black text-md flex items-center" onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
        {space}
        <span className={`ml-2 transition-transform ${isPopoverOpen ? "rotate-180" : "rotate-0"}`}>⌄</span>
      </button>
      {isPopoverOpen && (
        <div className="w-48 absolute bg-gray-100 shadow-lg z-10">
          <div className="flex p-2 hover:bg-gray-400 mt-2">
            <input
              type="radio"
              id="general"
              name="space"
              value="general"
              onClick={(e) => setSpace(`Space: ${e.target.value}`)}
              className="text-black p-3 block no-underline"
            />
            <label htmlFor="general" className="mx-2">
              General
            </label>
          </div>
          <div className="flex p-2 hover:bg-gray-400 mt-2">
            <input
              type="radio"
              id="issues"
              name="space"
              value="issues"
              onClick={(e) => setSpace(`Space: ${e.target.value}`)}
              className="text-black p-3 block no-underline"
            />
            <label htmlFor="issues" className="mx-2">
              Issues
            </label>
          </div>
          <div className="flex p-2 hover:bg-gray-400 mt-2">
            <input
              type="radio"
              id="laws"
              name="space"
              value="laws"
              onClick={(e) => setSpace(`Space: ${e.target.value}`)}
              className="text-black p-3 block no-underline"
            />
            <label htmlFor="laws" className="mx-2">
              Laws
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceMenu;
