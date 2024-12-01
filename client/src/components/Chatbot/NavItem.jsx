import React from "react";

const NavItem = React.memo(({ children, active, onClick }) => (
  <li>
    <div
      className={`flex items-center cursor-pointer px-3 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100 ${
        active ? "bg-gray-200" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  </li>
));
NavItem.displayName = "NavItem";

export default NavItem;
