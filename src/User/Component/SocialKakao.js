import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SocialKakao = () => {
  const Rest_api_key = "a8472f7278389dd9d8c2ed629df1ad30"; // REST API KEY
  const redirect_uri = "http://localhost:3000/user/callback"; // Redirect URI
  const client_secret = "KI4VoBFOCJ5lsEf26ivoI0QYdAZpSVSl";
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${Rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;

  const nv = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
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
          const accessToken = response.data.access_token;

          console.log(accessToken);

          // 서버로 토큰 전달
          axios
            .post("/api/kakao", { accessToken })
            .then((res) => {
              console.log("Server response:", res.data);
              // let userNo =
              // sessionStorage.setItem("id");
            })
            .catch((serverError) => {
              console.error(serverError);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  const handleLogin = () => {
    window.location.href = kakaoURL;
  };

  return (
    <>
      <img
        src={`${process.env.PUBLIC_URL}/images/kakaologin.png`}
        alt="kakaologin"
        onClick={handleLogin}
      ></img>
    </>
  );
};

export default SocialKakao;
