import React, { useState } from "react";

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");
  const userNo = sessionStorage.getItem("id"); // 현재 유저의 ID 가져오기

  const handleSend = () => {
    if (message.trim() !== "") {
      const messagePayload = {
        content: message, // Ensure this is a string
        receiverNo: 1,
        closeChat: false,
        sendAdmin: false,
        userNo: userNo,
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
