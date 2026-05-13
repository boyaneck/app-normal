import React from "react";
import Link from "next/link";
import Login_authbar from "./login_authbar";

const Navbar = () => {
  return (
    <nav
      className="z-[49] fixed top-0 w-full h-20 flex items-center justify-between pr-8"
    >
      {/* 로고 — 왼쪽으로 100px */}
      <div style={{ paddingLeft: 92 }}>
        <Link href="/">
          <img
            src="/images/appnormal_logo.svg"
            alt="appnormal logo"
            className="h-[56px] w-auto cursor-pointer"
          />
        </Link>
      </div>

      <Login_authbar />
    </nav>
  );
};

export default Navbar;
