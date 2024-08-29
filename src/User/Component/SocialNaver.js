import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SocialNaver() {
  const client_id = "bdezpMeUAefIKAYh8VfO";
  const redirect_uri = "http://localhost:3000/user/callback/naver";
  const state = "abcdefg";
  const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&state=${state}&redirect_uri=${redirect_uri}`;

  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      console.log("코드:", code);

      // 네이버 인증 코드를 백엔드로 전송하여 토큰을 요청
      axios
        .post("/api/naver/token", { code, state })
        .then((res) => {
          console.log("토큰 응답:", res.data);
          const accessToken = res.data.access_token;

          sessionStorage.setItem("token_n", accessToken);
          alert(accessToken);
          // 백엔드에서 사용자 정보 요청
          return axios.post("/api/naver", { accessToken });
        })
        .then((res) => {
          console.log("서버 응답:", res.data);
          const { status, user } = res.data;

          sessionStorage.setItem("id", user.id);
          if (status === "login") {
            navigate("/user");
          } else if (status === "signup") {
            navigate(`/user/main/sub`);
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
  }, []);

  const handleLogin = () => {
    window.location.href = naverURL;
  };

  return (
    <>
      <img
        src={`${process.env.PUBLIC_URL}/images/naverlogin.png`}
        alt="naverlogin"
        onClick={handleLogin}
        width={"300px"}
      ></img>
    </>
  );
}
