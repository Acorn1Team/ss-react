import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../Style/UserUpdate.module.css";
import axios from "axios";

const DeleteForm = () => {
  const { userNo } = useParams();
  const [pass, setPass] = useState("");

  const nv = useNavigate();

  function Checkbox({ children, disabled, checked, onChange }) {
    return (
      <label>
        <input
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={({ target: { checked } }) => onChange(checked)}
        />
        {children}
      </label>
    );
  }
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleDelete = async () => {
    try {
      const response = await axios.put(`/user/mypage/delete`, {
        userNo: userNo, // 사용자 번호
        password: pass, // 입력받은 비밀번호
      });

      if (response.data.result) {
        nv("/"); // 성공적으로 삭제되면 홈으로 이동
      } else {
        if (response.data.message) {
          prompt(response.data.message);
        }
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
    }
  };

  const handleInputChange = (e) => {
    setPass(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.user_input}>
        <input
          type="text"
          name="pass"
          placeholder="비밀번호"
          value={pass}
          onChange={handleInputChange}
          // disabled={!nameNull}
        />
        {errors.name && (
          <div className={styles.error_message}>{errors.name}</div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.buttons}>
          <button type="button" onClick={handleDelete}>
            회원 탈퇴
          </button>
          <button
            type="button"
            style={{ backgroundColor: "darkgray" }}
            onClick={handleCancel}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteForm;
