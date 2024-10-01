import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SocialKakao from "../Component/SocialKakao";
import SocailNaver from "../Component/SocialNaver";
import styles from "../Style/Login.module.css";
import "../Style/All.css";

const Login = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    const loginData = { id, pwd };
    try {
      const response = await fetch("/api/user/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      // 응답이 HTML인지 JSON인지 확인
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (response.ok && result.success) {
          // 로그인 성공 처리
          sessionStorage.setItem("id", result.user.no);
          sessionStorage.setItem("token", result.token);
          navigate(-1);
        } else {
          // 서버에서 전달된 오류 메시지
          setErrorMessage(
            result.message || "아이디 혹은 비밀번호가 틀렸습니다."
          );
        }
      } else {
        // JSON이 아닌 응답을 받을 때 (예: HTML 에러 페이지)
        const errorText = await response.text(); // HTML 내용을 텍스트로 받음
        setErrorMessage("서버 오류가 발생했습니다: " + errorText);
      }
    } catch (error) {
      setErrorMessage(error.message || "로그인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles["login-container"]}>
        <form className={styles["login-form"]} onSubmit={handleLogin}>
          <h1>로 그 인</h1>

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

          {errorMessage && (
            <label className={styles.errorMessage}>{errorMessage}</label>
          )}

          <input type="submit" value="로그인" className="btn3Long"></input>
          <br />
          <div>
            <Link to="/user/auth/findPass">비밀번호 찾기</Link>
          </div>
          <p className={styles["signup-link"]}>
            아직 회원이 아니신가요?{" "}
            <Link to="/user/auth/register">회원가입</Link>
          </p>
        </form>
        <SocialKakao props="social" />
        <br />
        <SocailNaver props="social" />
      </div>
    </div>
  );
};

export default Login;
