import React from "react";

const DrawerBackdrop = React.memo(({ onClick }) => (
  <div className="fixed inset-0 z-30 bg-black opacity-50" onClick={onClick} />
));
DrawerBackdrop.displayName = "DrawerBackdrop";

export default DrawerBackdrop;
