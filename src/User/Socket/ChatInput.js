import React, { useState } from "react";

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");
  const userNo = sessionStorage.getItem("id"); // 현재 유저의 ID 가져오기

  const handleSend = () => {
    if (message.trim() !== "") {
      const messagePayload = {
        no: userNo,
        content: message,
        sendAdmin: false,
      };
      console.log("Sending message:", JSON.stringify(messagePayload));
      onSendMessage(messagePayload);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default ChatInput;
