import React from "react";
import { Route, Routes } from "react-router-dom";
import Sub from "../Main/Sub";
import Main from "../Main/Main";

export default function UserMainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/sub/:no" element={<Sub />} />
    </Routes>
  );
}
