"use client";
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return (
    <div>
      Container
      {children}
    </div>
  );
};

export default Container;
