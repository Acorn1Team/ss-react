import React from "react";
import { Route, Routes } from "react-router-dom";
import Review from "../Shop/Review";
import ProductList from "../Shop/ProductList";

export default function UserShopRoutes() {
  return (
    <Routes>
      <Route path="/review/:no" element={<Review />} />
      <Route path="/productlist" element={<ProductList />} />
    </Routes>
  );
}
