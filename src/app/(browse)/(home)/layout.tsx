import React from "react";
import Navbar from "../_components/navbar";

interface childrenProps {
  children: React.ReactNode;
}
const Layout = ({ children }: childrenProps) => {
  return (
    <div>
      <Navbar />
      {children}
      Layout
    </div>
  );
};

export default Layout;
