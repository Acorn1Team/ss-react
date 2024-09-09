import React, { useState } from "react";
import PostWrite from "./PostWrite";
import UserProfile from "./UserProfile";

function ContentState() {
  const [resetWriting, setResetWriting] = useState(false);

  // 버튼 클릭 시 호출되는 함수
  const handleResetClick = () => {
    setResetWriting(true);

    // 상태를 일정 시간 후에 리셋
    setTimeout(() => setResetWriting(false), 1000); // 1초 후 리셋
  };

  console.log("ContentState render", { resetWriting });

  return (
    <div>
      <PostWrite resetWriting={resetWriting} /> {/* resetWriting prop 전달 */}
      <UserProfile onResetClick={handleResetClick} />
    </div>
  );
}

export default ContentState;
