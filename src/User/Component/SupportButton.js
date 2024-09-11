import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Style/SupportButton.module.css";
import "../Style/All.css";
import TranslateWidget from "../../TranslateWidget";

function SupportButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleOptionClick = (path) => {
    setIsModalOpen(false);
    navigate(path);
  };

  return (
    <div>
      <button className={styles["support-button"]} onClick={handleButtonClick}>
        고객지원
      </button>
      {isModalOpen && (
        <div className={styles["support-modal"]}>
          <div className={styles["support-modal-content"]}>
            <button
              className={styles["support-modal-option"]}
              onClick={() => handleOptionClick("/user/mypage/notice")}
            >
              공지사항
            </button>
            <button
              className={styles["support-modal-option"]}
              onClick={() => handleOptionClick("/user/chat")}
            >
              채팅 문의
            </button>
            <TranslateWidget />
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportButton;
