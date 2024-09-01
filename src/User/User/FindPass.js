import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Style/FindPass.module.css";

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
    <form className={styles["form-container"]} onSubmit={handleSubmit}>
      <label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
        />
      </label>
      <label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="아이디"
          required
        />
      </label>
      <button type="submit">임시 비밀번호 요청</button>
    </form>
  );
}
export default FindPass;
