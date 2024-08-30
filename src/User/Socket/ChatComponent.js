import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const userId = sessionStorage.getItem("id"); // 세션에서 ID를 가져옴

  useEffect(() => {
    let chatRoomId;

    if (userId === "0") {
      chatRoomId = "0"; // 관리자 전용 방이 있을 경우 여기서 설정
    } else {
      chatRoomId = `0_${userId}`; // 일반 사용자 채팅방
    }

    console.log("Chat Room ID:", chatRoomId); // 구독하려는 경로를 확인

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("Connected, subscribing to:", `/sub/chat/room/${chatRoomId}`);
      client.subscribe(`/sub/chat/room/${chatRoomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log("Received message:", receivedMessage);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [userId]);

  return (
    <div>
      <h2>Chat Messages</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg.sendAdmin ? (
              <span>
                <strong>관리자:</strong> {msg.content}
              </span>
            ) : (
              msg.content // 내가 보낸 메시지
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatComponent;
