import React from "react";
import { Navigate } from "react-router-dom";

const isAdminAuthenticated = () => {
  return sessionStorage.getItem("id") === "0"; // '0'은 문자열로 비교해야 합니다.
};

const isUserAuthenticated = () => {
  return !!sessionStorage.getItem("id");
};

const PrivateRoute = ({ element }) => {
  return isUserAuthenticated() ? element : <Navigate to="/user/auth/login" />;
};

const AdminRoute = ({ element }) => {
  if (isAdminAuthenticated()) {
    return element;
  } else if (isUserAuthenticated()) {
    return <Navigate to="/unauthorized" />;
  } else {
    return <Navigate to="/login" />;
  }
};

export { PrivateRoute, AdminRoute };
