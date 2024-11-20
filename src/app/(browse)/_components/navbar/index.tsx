import React from "react";
import Search from "./search";
import Login_authbar from "./login_authbar";
import Studio from "./studio";
import { BiBell } from "react-icons/bi";
const Navbar = () => {
  return (
    <nav
      className="z-[49] fixed top-0 w-full h-20 border 
    lg:px-4 flex justify-between items-center shadow-sm"
    >
      로고
      <div className="">
        <Search />
      </div>
      <div className="border border-red-300 flex space-x-4">
        <BiBell size={25} />
        <Studio />
        <Login_authbar />
      </div>
    </nav>
  );
};

export default Navbar;
