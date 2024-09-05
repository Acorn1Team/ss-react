import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotAdmin() {
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    // 2초 동안 메시지를 보여준 후에 리다이렉트
    const timer = setTimeout(() => {
      navigate("/user");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      {showMessage && (
        <div>
          <h2>삐빅! 접근할 수 없습니다.</h2>
          <p>
            이 페이지에 접근할 권한이 없습니다.
            <br />
            2초 후에 메인 페이지로 이동합니다.
          </p>
        </div>
      )}
    </>
  );
}
