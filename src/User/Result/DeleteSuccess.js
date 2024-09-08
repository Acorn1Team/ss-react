import React from "react";
import { Link } from "react-router-dom";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import styles from "../Style/DeleteSuccess.module.css"; // CSS 모듈 임포트

const RegisterSuccess = () => {
  return (
    <div className={styles.container}>
      <LiaCheckDoubleSolid size={80} className={styles.icon} />
      <h2 className={styles.heading}>회원탈퇴가 완료되었습니다.</h2>
      그동안 SceneStealer를 이용해 주셔서 감사합니다.
      <div className={styles.buttonGroup}>
        <Link to="/user">
          <button type="button" className={styles.button}>
            홈으로
          </button>
        </Link>
      </div>
    </div>
  );
};

export default RegisterSuccess;
