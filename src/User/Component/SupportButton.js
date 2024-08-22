import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/SupportButton.css";

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
      <button className="support-button" onClick={handleButtonClick}>
        고객지원
      </button>
      {isModalOpen && (
        <div className="support-modal">
          <div className="support-modal-content">
            <button
              className="support-modal-option"
              onClick={() => handleOptionClick("/user/mypage/notice")}
            >
              공지사항
            </button>
            <button
              className="support-modal-option"
              onClick={() => handleOptionClick("/user/chat")}
            >
              채팅 문의
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportButton;
