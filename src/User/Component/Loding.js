import React from "react";

const LoadingScreen = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.5)", // 투명도 30% 흰색 배경으로 수정
        zIndex: 9999, // 모든 요소 위에 로딩 화면이 오도록 설정
        // pointerEvents: "none", // 로딩 화면 뒤의 요소와 상호작용을 허용
        backdropFilter: "blur(1px)", // 배경 흐림 효과 추가 (선택 사항)
      }}
    >
      <div
        style={{
          width: "100px",
          height: "100px",
        }}
      >
        <div className="flower-loader">Loading…</div>
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
      `}</style>
    </div>
  );
};

export default LoadingScreen;
