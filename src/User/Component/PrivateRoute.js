import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const useUserAuthenticated = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const tokenK = sessionStorage.getItem("token_k");
    const tokenN = sessionStorage.getItem("token_n");

    const userNo = parseInt(sessionStorage.getItem("id"));

    if ((token || tokenK || tokenN) && userNo) {
      if (token) {
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
      } else if (tokenK) {
        axios
          .get(`https://kapi.kakao.com/v1/user/access_token_info`, {
            headers: {
              Authorization: `Bearer ${tokenK}`,
            },
          })
          .then((res) => {
            const userNo = sessionStorage.getItem("id");
            const id = res.data.id;
            console.log(userNo, " ", id);
            axios
              .get(`/user/check/${id}/${userNo}`)
              .then((res) => {
                if (res.data.result) {
                  setAuthenticated(true); // 사용자 인증 성공 시 true로 설정
                  setIsAdmin(userNo === 1); // 관리자 여부 확인
                } else {
                  setAuthenticated(false);
                }
              })
              .catch((err) => {
                console.log(err);
                setAuthenticated(false);
              })
              .finally(() => {
                setLoading(false); // 로딩 상태 해제
              });
          })
          .catch((err) => {
            console.log(err);
            setAuthenticated(false);
            setLoading(false); // 로딩 상태 해제
          });
      } else if (tokenN) {
        // tokenN 로직
      }
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
