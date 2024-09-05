import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const useUserAuthenticated = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userNo = parseInt(sessionStorage.getItem("id"));

    if (token && userNo) {
      axios
        .get(`/user/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          let un = parseInt(res.data.userNo);
          setAuthenticated(un === userNo);
          setIsAdmin(un === 1); // userNo가 1이면 관리자임을 설정
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
          setAuthenticated(false);
          setIsAdmin(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setAuthenticated(false);
      setIsAdmin(false);
      setLoading(false);
    }
  }, []);

  return { authenticated, isAdmin, loading };
};

// 일반 사용자 접근 라우트
const PrivateRoute = ({ element }) => {
  const { authenticated, loading } = useUserAuthenticated();

  if (loading) {
    return <div>Loading...</div>;
  }

  return authenticated ? element : <Navigate to="/user/auth/login" />;
};

// 관리자 접근 라우트
const AdminRoute = ({ element }) => {
  const { authenticated, isAdmin, loading } = useUserAuthenticated();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/user/admin/auth" />;
  }

  return isAdmin ? element : <Navigate to="/user/admin/auth" />;
};

export { PrivateRoute, AdminRoute };
