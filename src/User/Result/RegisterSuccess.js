import React from "react";
import { Link } from "react-router-dom";
import { LuUserCheck2 } from "react-icons/lu";
import styles from "../Style/RegisterSuccess.module.css"; // CSS 모듈 임포트

const RegisterSuccess = () => {
  return (
    <div className={styles.container}>
      <LuUserCheck2 size={80} className={styles.icon} />
      <h2 className={styles.heading}>회원가입이 완료되었습니다.</h2>
      <div className={styles.buttonGroup}>
        <Link to="/user">
          <button type="button" className={styles.button}>
            홈으로
          </button>
        </Link>
        <Link to="/user/auth/login">
          <button type="button" className={styles.button}>
            로그인
          </button>
        </Link>
      </div>
    </div>
  );
};

export default RegisterSuccess;
