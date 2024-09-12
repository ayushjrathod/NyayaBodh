import React from "react";

const SpaceMenu = ({ space, setSpace }) => {
  return (
    <div className="relative inline-block group w-fit">
      <button className="bg-gray-200 text-black px-2 py-1 mt-2 text-md border-2 rounded-sm">
        {space}
      </button>
      <div className="hidden w-48 absolute bg-gray-100 shadow-lg z-10 group-hover:block">
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
            General space
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
            Issues space
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
            Laws space
          </label>
        </div>
      </div>
    </div>
  );
};

export default SpaceMenu;
