import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function AdminChat({ selectedUserId }) {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const adminId = "1"; // 관리자는 항상 고정된 ID

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
      const chatRoomId = `${adminId}_${selectedUserId}`; // 유저와의 채팅방 구독

      client.subscribe(`/sub/chat/room/${chatRoomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [selectedUserId]);

  const sendMessage = (messageContent) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify({
          no: selectedUserId, // ChatUser ID 사용
          content: messageContent,
          sendAdmin: true,
        }),
      });
    }
  };

  return (
    <div>
      <h2>Admin Chat with User {selectedUserId}</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.sendAdmin ? "관리자: " : ""}
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage(e.target.value);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

export default AdminChat;
