import React from "react";
import { Route, Routes } from "react-router-dom";
import PostForm from "../Posts/PostForm";
export default function UserStyleRoutes() {
  return (
    <Routes>
      <Route path="/post/*" element={<PostForm />} />
    </Routes>
  );
}
