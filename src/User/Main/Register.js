import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [loginCheck, setLoginCheck] = useState(false); // 로그인 상태 체크

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    // JSON 형식의 데이터 생성
    const loginData = {
      id: id,
      pwd: pwd,
    };

    try {
      const response = await fetch("http://localhost:8080/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // JSON 형식으로 요청 헤더 설정
        },
        body: JSON.stringify(loginData), // JSON 형식으로 변환하여 요청 본문에 추가
      });

      if (!response.ok) {
        // 응답 상태가 2xx가 아니면 오류 처리
        const errorText = await response.text(); // 서버의 오류 메시지를 텍스트로 받기
        throw new Error(`로그인 요청이 실패했습니다: ${errorText}`);
      }

      const result = await response.json(); // JSON 응답 파싱

      // 응답에서 필요한 데이터 저장
      sessionStorage.setItem("token", result.token || "");
      sessionStorage.setItem("id", result.id || "");
      sessionStorage.setItem("role", result.role || "");
      sessionStorage.setItem("storeid", result.storeId || "");

      console.log("로그인 성공, ID : " + result.id);
      navigate("/"); // 로그인 성공 시 홈으로 이동
    } catch (error) {
      console.error("로그인 요청 중 오류 발생:", error);
      setLoginCheck(true); // 로그인 실패 상태 표시
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>회원가입</h1>
        <label htmlFor="username">아이디</label>
        <input
          type="text"
          id="id"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <br />

        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="pwd"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <br />
        <label htmlFor="name">이름</label>
        <input
          type="text"
          id="pwd"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <br />
        <label htmlFor="name">전화번호</label>
        <input
          type="text"
          id="pwd"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <br />
        <label htmlFor="name">이메일</label>
        <input
          type="text"
          id="pwd"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <br />
        <label htmlFor="name">주소</label>
        <input
          type="text"
          id="pwd"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <br />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default Register;
