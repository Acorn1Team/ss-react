import React from "react";
import styles from "../Style/Footer.module.css"; // CSS 파일 임포트

export default function FooterForm() {
  return (
    <footer className={styles["footer-container"]}>
      <div className={styles["footer-top"]}>
        <h2 className={styles["footer-logo"]}>SceneStealer</h2>
      </div>
      <div className={styles["footer-bottom"]}>
        <p>Team Daracle | 팀 다라클 | teamdaracle@gmail.com</p>
      </div>
      <p>© 2024 SceneStealer. All rights reserved.</p>
    </footer>
  );
}
