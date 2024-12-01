"use client";
import { useParams } from "next/navigation";
import React from "react";
const UserLivePage = () => {
  const { id } = useParams<{ id: string }>();
  const user_id = id;
  return <div>UserLivePage{}</div>;
};

export default UserLivePage;
