import React from "react";
import Search from "./search";
import { SearchIcon, X } from "lucide-react";
import Login_toolbar from "./login_toolbar";
const Navbar = () => {
  return (
    <nav
      className="z-[49] fixed top-0 w-full h-20 border  border-red-500
    lg:px-4 flex justify-between items-center shadow-sm"
    >
      <Search />
      <Login_toolbar />
    </nav>
  );
};

export default Navbar;
