import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SocialKakao = ({ props }) => {
  const Rest_api_key = "a8472f7278389dd9d8c2ed629df1ad30"; // REST API KEY
  const redirect_uri = "http://scenestealer.kr/user/callback"; // Redirect URI
  const client_secret = "KI4VoBFOCJ5lsEf26ivoI0QYdAZpSVSl";
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${Rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;

  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    const tokenInProgress = sessionStorage.getItem("token_in_progress");

    if (code && !tokenInProgress) {
      sessionStorage.setItem("token_in_progress", "true");

      axios
        .post(
          `https://kauth.kakao.com/oauth/token`,
          new URLSearchParams({
            grant_type: "authorization_code",
            client_id: Rest_api_key,
            redirect_uri: redirect_uri,
            code: code,
            client_secret: client_secret,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            },
          }
        )
        .then((response) => {
          console.log("토큰 응답:", response.data);
          const accessToken = response.data.access_token;

          sessionStorage.setItem("token_k", accessToken);

          // 서버로 토큰 전달
          return axios.post("/api/kakao", { accessToken });
        })
        .then((res) => {
          console.log("서버 응답:", res.data);
          const { status, user } = res.data;

          sessionStorage.setItem("id", user);
          if (status === "login") {
            navigate("/user");
          } else if (status === "signup") {
            navigate(`/user/mypage/update/${user}/kakao`);
          }
        })
        .catch((error) => {
          console.error(
            "에러 발생:",
            error.response ? error.response.data : error.message
          );
          navigate("/user/auth/login");
        })
        .finally(() => {
          sessionStorage.removeItem("token_in_progress");
        });
    }
  }, []);

  const handleLogin = () => {
    window.location.href = kakaoURL;
  };

  return (
    <>
      {props && (
        <img
          src={`${process.env.PUBLIC_URL}/images/kakaologin.png`}
          alt="kakaologin"
          onClick={handleLogin}
          width={"200px"}
        ></img>
      )}
    </>
  );
};

export default SocialKakao;
