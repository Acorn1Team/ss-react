import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function FindPass() {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:8080/password-reset", {
        email,
        id,
      });
      alert("임시 비밀번호가 이메일로 전송되었습니다.");
      navigate("/user/auth/login");
    } catch (error) {
      console.error("비밀번호 재설정 요청 실패:", error);
      alert("비밀번호 재설정 요청에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        이메일:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        아이디:
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit">임시 비밀번호 요청</button>
    </form>
  );
}
export default FindPass;
