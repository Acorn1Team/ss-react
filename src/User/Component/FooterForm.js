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
      <div style={{ fontSize: "180%" }}>
        본 사이트는 개인 포트폴리오를 목적으로 제작된 페이지입니다.
        <br />
        상업적인 목적이나 이익 창출과는 무관하며, 실제 운영되는 서비스가
        아닙니다.
      </div>
    </footer>
  );
}
