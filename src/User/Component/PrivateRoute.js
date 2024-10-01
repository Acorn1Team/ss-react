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
          .get(`/api/user/info`, {
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
              .get(`/api/user/check/${id}/${userNo}`)
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
        axios
          .post("/api/naver/user-info", { accessToken: tokenN }) // 백엔드로 액세스 토큰 전송
          .then((res) => {
            const userInfo = res.data; // 백엔드에서 받은 데이터
            console.log("Naver user info:", userInfo);

            const userNo = sessionStorage.getItem("id");

            // userInfo.result가 true인 경우 인증 성공
            if (
              userInfo &&
              userInfo.result &&
              String(userInfo.userNo) === String(userNo)
            ) {
              setAuthenticated(true); // 인증 성공
              setIsAdmin(userNo === "1"); // 관리자 여부 확인
            } else {
              setAuthenticated(false); // 인증 실패
            }
          })
          .catch((err) => {
            console.error("Error fetching Naver user info from backend:", err);
            setAuthenticated(false); // 인증 실패 시 처리
          })
          .finally(() => {
            setLoading(false); // 로딩 상태 해제
          });
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
