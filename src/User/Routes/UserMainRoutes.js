import React from "react";
import { Route, Routes } from "react-router-dom";
import Sub from "../Main/Sub";
import Main from "../Main/Main";
import ShowList from "../Main/ShowList";

export default function UserMainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/sub/:no" element={<Sub />} />
      <Route path="/show" element={<ShowList />} />
    </Routes>
  );
}
