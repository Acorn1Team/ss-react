import React from "react";
import { Link } from "react-router-dom";
import NoticeManage from "./NoticeManage";

export default function HelpManage() {
  return (
    <>
      <h2>
        <ul className="chat-list">
          <li>
            <Link to="/admin/help/chat" className="chat-link">
              <span className="icon">🧑🏻‍💻💬</span>
              <span className="title">채팅 상담하러 가기</span>
            </Link>
          </li>
        </ul>
        <NoticeManage />
      </h2>

      <style jsx>{`
  .chat-list {
    position: relative;
    display: flex;
    justify-content: center;
    gap: 15px; /* 간격을 줄입니다 */
  }

  .chat-list li {
    position: relative;
    list-style: none;
    width: 150px; /* width를 줄였습니다 */
    height: 50px; /* height를 줄였습니다 */
    background: #fff;
    border-radius: 50px; /* border-radius도 줄입니다 */
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: width 0.5s, box-shadow 0.5s;
  }

  .chat-list li:hover {
    width: 250px; /* hover 시 width도 줄였습니다 */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0);
  }

  .chat-list li::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50px; /* border-radius 조정 */
    background: linear-gradient(45deg, #df919e, #c9aaaf);
    opacity: 0;
    transition: opacity 0.5s;
  }

  .chat-list li:hover::before {
    opacity: 1;
  }

  .chat-list li::after {
    content: "";
    position: absolute;
    top: 10px;
    width: 100%;
    height: 100%;
    border-radius: 50px;
    background: linear-gradient(45deg, #df919e, #c9aaaf);
    transition: opacity 0.5s, filter 0.5s;
    filter: blur(10px); /* blur 정도 줄임 */
    z-index: -1;
    opacity: 0;
  }

  .chat-list li:hover::after {
    opacity: 0.5;
  }

  .chat-list .icon {
    color: #777;
    font-size: 1.5em; /* 아이콘 크기 조정 */
    transition: transform 0.2s, color 0.2s;
  }

  .chat-list li:hover .icon {
    transform: scale(0);
    color: #fff;
  }

  .chat-list .title {
    color: #fff;
    font-size: 0.9em; /* 폰트 크기 줄임 */
    text-transform: uppercase;
    letter-spacing: 0.1em;
    position: absolute;
    white-space: nowrap;
    transition: transform 0.2s, opacity 0.2s;
    transform: scale(0);
    opacity: 0;
    text-align: center;
  }

  .chat-list li:hover .title {
    transform: scale(1);
    opacity: 1;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(1);
  }
`}</style>

    </>
  );
}
