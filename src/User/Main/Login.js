import React, { useEffect, useState } from "react";
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

  // 컴포넌트가 마운트될 때 로그인 상태를 확인
  // useEffect(() => {
  //   const checkLoginStatus = async () => {

  //     const userId = sessionStorage.getItem("id");
  //     if (userId) {
  //       navigate("/user"); // 로그인된 상태일 때 홈으로 리디렉션
  //     }
  //   };

  //   checkLoginStatus();
  // }, [navigate]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      // JWT 토큰을 sessionStorage에서 가져옴
      const userId = sessionStorage.getItem("token");
      const userNo = sessionStorage.getItem("id");

      if (userNo && userId) {
        // 토큰이 존재하면 로그인된 상태로 간주하고 홈으로 리디렉션
        navigate("/user");
      } else {
        // 토큰이 없으면 로그인 페이지로 리디렉션 (필요한 경우)
        // navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

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
        console.log(result.user);
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
  //   event.preventDefault();

  //   // 입력 검증
  //   if (!id || !pwd) {
  //     setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
  //     setLoginCheck(true);
  //     return;
  //   }

  //   const loginData = { id, pwd };

  //   try {
  //     const response = await fetch("http://localhost:8080/user/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify(loginData),
  //     });

  //     // 응답 상태 코드가 2xx 범위에 있으면 성공으로 처리
  //     if (response.ok) {
  //       const result = await response.json();

  //       if (result.success) {
  //         sessionStorage.setItem("token", result.token);
  //         console.log("로그인 성공, JWT 토큰 저장");
  //         // sessionStorage.setItem("id", result.user.no);
  //         // console.log("로그인 성공, ID : " + result.user.id);
  //         // 로그인 성공 시 홈으로 이동
  //         //console.log(result);
  //         navigate("/user");
  //       } else {
  //         console.error("로그인 실패:", result.message);
  //         setErrorMessage(
  //           result.message || "아이디 혹은 비밀번호가 틀렸습니다."
  //         );
  //         setLoginCheck(true); // 로그인 실패 상태 표시
  //       }
  //     } else {
  //       // 응답 상태 코드가 2xx 범위에 있지 않으면 에러 처리
  //       const errorResult = await response.json();
  //       setErrorMessage(
  //         errorResult.message || "아이디 혹은 비밀번호가 틀렸습니다."
  //       );
  //       setLoginCheck(true); // 로그인 실패 상태 표시
  //     }
  //   } catch (error) {
  //     console.error("로그인 요청 중 오류 발생:", error);
  //     setErrorMessage(
  //       "로그인 요청 중 오류가 발생했습니다. 나중에 다시 시도해주세요."
  //     );
  //     setLoginCheck(true); // 로그인 실패 상태 표시
  //   }
  // };

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
