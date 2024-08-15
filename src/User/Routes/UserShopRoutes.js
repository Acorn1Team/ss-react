import React from "react";
import { Route, Routes } from "react-router-dom";
import Review from "../Shop/Review";

export default function UserShopRoutes() {
  return (
    <Routes>
      <Route path="/review/:no" element={<Review />} />
    </Routes>
  );
}
