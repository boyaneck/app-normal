import React from "react";
import Link from "next/link";
import Login_authbar from "./login_authbar";

const Navbar = () => {
  return (
    <nav
      className="z-[49] fixed top-0 w-full h-20 flex items-center justify-between pr-8"
      style={{
        background: "rgba(7,28,46,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "0.5px solid rgba(56,189,248,0.1)",
      }}
    >
      {/* 로고 — 왼쪽으로 100px */}
      <div style={{ paddingLeft: 100 }}>
        <Link href="/">
          <span
            className="text-[17px] font-bold tracking-tight cursor-pointer"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            로고
          </span>
        </Link>
      </div>

      <Login_authbar />
    </nav>
  );
};

export default Navbar;
