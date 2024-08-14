import React from "react";
import { Route, Routes } from "react-router-dom";
import Sub from "../Main/Sub";

export default function UserMainRoutes() {
  return (
    <Routes>
      <Route path="/sub/:no" element={<Sub />} />
    </Routes>
  );
}
