import React from "react";
import Login_authbar from "./login_authbar";

const Navbar = () => {
  return (
    <nav
      className="z-[49] fixed top-0 w-full h-20 border
    lg:px-4 flex justify-between items-center shadow-sm"
    >
      로고
      <Login_authbar />
    </nav>
  );
};

export default Navbar;
