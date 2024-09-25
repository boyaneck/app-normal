import React from "react";
import Wrapper from "./wrapper";
import Toggle from "./toggle";
import Recommended from "./recommended";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Sidebar = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Wrapper>
        <Toggle />
        <div className="space-y-4 pt-4 lg:pt-0">
          <Recommended />
        </div>
      </Wrapper>
    </QueryClientProvider>
  );
};

export default Sidebar;
