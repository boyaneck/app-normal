import React from "react";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <aside className="fixed left-0 h-full w-60 flex flex-col bg-sky-400 border border-red-400">
      {children}
    </aside>
  );
};

export default Wrapper;
