import React from "react";
import "../Style/Footer.module.css"; // CSS 파일 임포트

export default function FooterForm() {
  return (
    <footer className="footer-container">
      <div className="footer-top">
        <h2 className="footer-logo">SceneStealer</h2>
        {/* <p className="footer-tagline">Transforming Scenes into Style</p> */}
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Team Daracle | 팀 다라클 | teamdaracle@gmail.com</p>
      </div>
      <p>© 2024 SceneStealer. All rights reserved.</p>
    </footer>
  );
}
