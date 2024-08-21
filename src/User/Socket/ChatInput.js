import React, { useState } from "react";

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() !== "") {
      // 입력 필드가 비어 있거나 공백만 있지 않으면 해당 블록으로 진입
      onSendMessage(message);
      // 부모 컴포넌트에게 메시지 전달
      setMessage("");
      // 메시지 전송 후 입력 필드 초기화
    }
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={() => handleSend()}>Send</button>
    </div>
  );
}

export default ChatInput;
