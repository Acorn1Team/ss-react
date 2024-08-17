import React from "react";
import { Route, Routes } from "react-router-dom";
import Search from "../Main/Search";

export default function SearchRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Search />} />
    </Routes>
  );
}
