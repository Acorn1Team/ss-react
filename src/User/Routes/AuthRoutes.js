import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "../Main/Login";
import Register from "../Main/Register";
import FindPass from "../User/FindPass";
import RegisterSuccess from "../Result/RegisterSuccess";
import DeleteSuccess from "../Result/DeleteSuccess";

export default function AuthRoutes() {
  const location = useLocation();

  useEffect(() => {
    console.log("Current path:", location.pathname); // 현재 경로 확인
  }, [location]);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/findPass" element={<FindPass />} />
      <Route path="/success" element={<RegisterSuccess />} />
      <Route path="/delete" element={<DeleteSuccess />} />
    </Routes>
  );
}
