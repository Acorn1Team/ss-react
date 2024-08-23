import React, { useEffect } from "react";

const LoadingScreen = () => {
  useEffect(() => {}, []);

  return (
    <div
      style={{
        height: "100vh", // 화면 전체 높이를 차지
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        animation: "fadeInOut 1s ease-in-out", // 페이드 인/아웃 애니메이션 추가
      }}
    >
      <div className="cell">
        <div className="card">
          <span className="flower-loader">Loading…</span>
        </div>
      </div>

      <style>{`
        .flower-loader {
          overflow: hidden;
          position: relative;
          text-indent: -9999px;
          display: inline-block;
          width: 16px;
          height: 16px;
          background: #FFFFEA;
          border-radius: 100%;
          box-shadow: white 0 0 15px 0, #333 -12px -12px 0 4px,
            #333 12px -12px 0 4px, #333 12px 12px 0 4px, #333 -12px 12px 0 4px;
          animation: flower-loader 5s infinite ease-in-out;
          transform-origin: 50% 50%;
        }

        @keyframes flower-loader {
          0% {
            transform: rotate(0deg);
            box-shadow: white 0 0 15px 0, #333 -12px -12px 0 4px,
              #333 12px -12px 0 4px, #333 12px 12px 0 4px, #333 -12px 12px 0 4px;
          }
          50% {
            transform: rotate(1080deg);
            box-shadow: white 0 0 15px 0, #333 12px 12px 0 4px,
              #333 -12px 12px 0 4px, #333 -12px -12px 0 4px, #333 12px -12px 0 4px;
          }
        }

        @keyframes fadeInOut {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
