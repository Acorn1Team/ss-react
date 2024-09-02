import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const userId = sessionStorage.getItem("id");

  useEffect(() => {
    const chatRoomId = `1_${userId}`;

    console.log("Chat Room ID:", chatRoomId); // 이 로그가 찍히는지 확인하세요.
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("STOMP Debug: ", str), // STOMP 디버그 로그를 활성화합니다.
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("Connected, subscribing to:", `/sub/chat/room/${chatRoomId}`);
      client.subscribe(`/sub/chat/room/${chatRoomId}`, (message) => {
        console.log("Raw message:", message);
        const receivedMessage = JSON.parse(message.body);
        console.log("Parsed message:", receivedMessage);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        alert("Message received: " + receivedMessage.content);
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
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
              msg.content
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatComponent;
