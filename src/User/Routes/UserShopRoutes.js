import React from "react";
import { Route, Routes } from "react-router-dom";
import Review from "../Shop/Review";
import ProductList from "../Shop/ProductList";
import ProductByCate from "../Shop/ProductByCate";
import ProductDetail from "../Shop/ProductDetail";
import Cartlist from "../Shop/Cartlist";

export default function UserShopRoutes() {
  return (
    <Routes>
      <Route path="/review/:no" element={<Review />} />
      <Route path="/productlist" element={<ProductList />} />
      <Route path="/productlist/category/:category" element={<ProductByCate />} />
      <Route path="/productlist/detail/:no" element={<ProductDetail />} />
      <Route path="/cartlist/:no" element={<Cartlist />} />
    </Routes>
  );
}
