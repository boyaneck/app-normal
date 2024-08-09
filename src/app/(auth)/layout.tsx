import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      인증 레이아웃
      {children}
    </div>
  );
};

export default layout;
