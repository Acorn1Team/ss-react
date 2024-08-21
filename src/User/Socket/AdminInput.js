// AdminChat.js
import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function AdminInput() {
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe("/sub/chat/room/100", (message) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          JSON.parse(message.body),
        ]);
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const sendMessage = (roomId, messageContent) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify({
          userNo: null, // 유저 ID를 null로 설정하거나 적절히 설정
          content: messageContent,
          roomId: roomId,
          sendCheck: true,
        }),
      });
    }
  };

  return (
    <div>
      <h2>Admin Chat</h2>
      {/* 유저 목록과 채팅 내용 표시 */}
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>User {msg.userNo}:</strong> {msg.content}
          </div>
        ))}
      </div>
      {/* 메시지 입력 및 전송 */}
      <input
        type="text"
        onKeyPress={(e) =>
          e.key === "Enter" && sendMessage(100, e.target.value)
        }
      />
    </div>
  );
}

export default AdminInput;
