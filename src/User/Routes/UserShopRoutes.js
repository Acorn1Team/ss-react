import React from "react";
import { Route, Routes } from "react-router-dom";
import Review from "../Shop/Review";
import ProductList from "../Shop/ProductList";
import ProductDetail from "../Shop/ProductDetail";
import Cartlist from "../Shop/Cartlist";
import CartDetail from "../Shop/CartDetail";
import PurchasePage from "../Shop/PurchasePage";

export default function UserShopRoutes() {
  return (
    <Routes>
      <Route path="/review/:no" element={<Review />} />
      <Route path="/productlist" element={<ProductList />} />
      <Route path="/productlist/detail/:no" element={<ProductDetail />} />
      <Route path="/cart" element={<Cartlist />} />
      <Route path="/order/detail/:orderNo" element={<CartDetail />} />
      <Route path="/purchase" element={<PurchasePage />} />
    </Routes>
  );
}
