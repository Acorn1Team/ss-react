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
              <span className="icon">💬</span>
              <span className="title">채팅 상담하러 가기</span>
            </Link>
          </li>
        </ul>
        <hr />
        <NoticeManage />
      </h2>

      <style jsx>{`
        .chat-list {
          position: relative;
          display: flex;
          gap: 25px;
        }

        .chat-list li {
          position: relative;
          list-style: none;
          width: 60px;
          height: 60px;
          background: #fff;
          border-radius: 60px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          transition: width 0.5s, box-shadow 0.5s;
        }

        .chat-list li:hover {
          width: 200px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0);
        }

        .chat-list li::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 60px;
          background: linear-gradient(45deg, #56ccf2, #2f80ed);
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
          border-radius: 60px;
          background: linear-gradient(45deg, #56ccf2, #2f80ed);
          transition: opacity 0.5s, filter 0.5s;
          filter: blur(15px);
          z-index: -1;
          opacity: 0;
        }

        .chat-list li:hover::after {
          opacity: 0.5;
        }

        .chat-list .icon {
          color: #777;
          font-size: 1.75em;
          transition: transform 0.2s, color 0.2s;
        }

        .chat-list li:hover .icon {
          transform: scale(0);
          color: #fff;
        }

        .chat-list .title {
          color: #fff;
          font-size: 1.1em;
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
