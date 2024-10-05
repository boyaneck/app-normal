import React from "react";
import Wrapper from "./wrapper";
import Toggle from "./toggle";
import Recommended from "./recommended";

const Sidebar = () => {
  return (
    <Wrapper>
      <Toggle />
      <div className="space-y-4 pt-4 lg:pt-0">
        <Recommended />
      </div>
    </Wrapper>
  );
};

export default Sidebar;
