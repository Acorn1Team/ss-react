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
          gap: 15px;
        }

        .chat-list li {
          position: relative;
          list-style: none;
          width: 150px;
          height: 50px;
          background: #fff;
          border-radius: 50px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: width 0.5s, box-shadow 0.5s;
        }

        .chat-list li:hover {
          width: 250px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0);
        }

        .chat-list li::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50px;
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
          filter: blur(10px);
          z-index: -1;
          opacity: 0;
        }

        .chat-list li:hover::after {
          opacity: 0.5;
        }

        .chat-list .icon {
          color: #777;
          font-size: 1.5em;
          transition: transform 0.2s, color 0.2s;
        }

        .chat-list li:hover .icon {
          transform: scale(0);
          color: #fff;
        }

        .chat-list .title {
          color: #fff;
          font-size: 0.9em;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          position: absolute;
          left: 50%; /* 수평 중앙 정렬 */
          top: 50%;
          transform: translate(-50%, -50%); /* 중앙으로 이동 */
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        }

        .chat-list li:hover .title {
          opacity: 1;
          transform: translate(-50%, -50%); /* hover 상태에서도 중앙 유지 */
        }
      `}</style>
    </>
  );
}
