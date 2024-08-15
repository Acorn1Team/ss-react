import React from "react";
import { Route, Routes } from "react-router-dom";
import Posts from "../Posts/Posts";

export default function UserStyleRoutes() {
  return (
    <Routes>
      <Route path="/posts/:no" element={<Posts />} />
    </Routes>
  );
}
