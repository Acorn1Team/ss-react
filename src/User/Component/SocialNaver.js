import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SocialNaver({ props }) {
  const client_id = "bdezpMeUAefIKAYh8VfO";
  const redirect_uri = "http://scenestealer.kr/user/callback/naver";
  const state = "abcdefg";
  const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&state=${state}&redirect_uri=${redirect_uri}`;

  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    const storedCode = sessionStorage.getItem("naver_auth_code");

    if (code && code !== storedCode) {
      sessionStorage.setItem("naver_auth_code", code); // 인증 코드를 저장하여 중복 실행 방지
      axios
        .post("/api/naver/token", { code, state })
        .then((res) => {
          const accessToken = res.data.access_token;
          sessionStorage.setItem("token_n", accessToken);

          return axios.post("/api/naver", { accessToken });
        })
        .then((res) => {
          console.log("서버 응답:", res.data);
          const { status, user } = res.data;
          sessionStorage.setItem("id", user);
          if (status === "login") {
            navigate("/user");
          } else if (status === "signup") {
            navigate(`/user/mypage/update/${user}/naver`);
          }
        })
        .catch((error) => {
          console.error(
            "에러 발생:",
            error.response ? error.response.data : error.message
          );
          navigate("/user/auth/login");
        });
    }
  }, [navigate, state]);

  const handleLogin = () => {
    window.location.href = naverURL;
  };

  return (
    <>
      {props && (
        <img
          src={`${process.env.PUBLIC_URL}/images/naverlogin.png`}
          alt="naverlogin"
          onClick={handleLogin}
          width={"200px"}
        ></img>
      )}
    </>
  );
}
