import { useEffect } from "react";
import axios from "axios";

const SocialKakao = () => {
  const Rest_api_key = "a8472f7278389dd9d8c2ed629df1ad30"; // REST API KEY
  const Client_secret = "KI4VoBFOCJ5lsEf26ivoI0QYdAZpSVSl";
  const redirect_uri = "http://localhost:3000/user/callback"; // Redirect URI
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${Rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;

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
            client_secret: Client_secret, // Client Secret 추가
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          const accessToken = response.data.access_token;
          // 서버로 토큰 전달
          axios
            .post("/api/kakao", { accessToken })
            .then((serverResponse) => {
              console.log("Server response:", serverResponse.data);
            })
            .catch((serverError) => {
              console.error("Error sending token to server", serverError);
            });
        })
        .catch((error) => {
          console.error("Error fetching token", error);
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
