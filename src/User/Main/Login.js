import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SocialKakao from "../Component/SocialKakao";
import SocailNaver from "../Component/SocialNaver";
import styles from "../Style/Login.module.css";

const Login = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [loginCheck, setLoginCheck] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    const loginData = { id, pwd };
    try {
      const response = await fetch("http://localhost:8080/user/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        // 응답이 정상적이지 않을 경우 오류를 발생시킵니다.
        const errorData = await response.json(); // 오류 메시지를 응답에서 가져옵니다.
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem("id", result.user.no); // 로그인 성공 시 사용자 ID 저장
        sessionStorage.setItem("token", result.token); // JWT 토큰을 세션 스토리지에 저장합니다.
        navigate("/user"); // 로그인 성공 시 리다이렉트합니다.
      } else {
        // 로그인 실패 시 오류 메시지를 콘솔에 로그하고 상태를 설정합니다.
        console.error("Login failed:", result.message);
        setErrorMessage(result.message || "아이디 혹은 비밀번호가 틀렸습니다.");
        setLoginCheck(true);
      }
    } catch (error) {
      // 네트워크 오류 등 예외적인 상황을 처리합니다.
      console.error("Error during login:", error);
      setErrorMessage(error.message || "로그인 처리 중 오류가 발생했습니다.");
      setLoginCheck(true);
    }
  };

  return (
    <div className={styles["login-container"]}>
      <form className={styles["login-form"]} onSubmit={handleLogin}>
        <h1>SceneStealer</h1>

        <input
          type="text"
          placeholder="아이디"
          id="id"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          id="pwd"
          placeholder="비밀번호"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />

        {loginCheck && (
          <label className={styles["error-message"]}>{errorMessage}</label>
        )}

        <button type="submit">로그인</button>
        <br />
        <div>
          <Link to="/user/auth/findPass">비밀번호 찾기</Link>
        </div>
        <p className={styles["signup-link"]}>
          아직 회원이 아니신가요? <Link to="/user/auth/register">회원가입</Link>
        </p>
      </form>
      <SocialKakao />
      <br />
      <SocailNaver />
    </div>
  );
};

export default Login;
