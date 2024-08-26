import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../Main/Login";
import Register from "../Main/Register";

export default function SearchRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
