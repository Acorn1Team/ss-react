import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

function AdminChat({ selectedUserId, chatNo, chatData }) {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState(chatData || []);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    console.log(messages);

    client.onConnect = () => {
      const chatRoomId = `1_${selectedUserId}`;
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
  }, [selectedUserId, chatData]);

  const chatClose = () => {
    if (
      prompt("채팅을 종료하시겠습니까?\n종료된 채팅은 다시 재개할 수 없습니다.")
    ) {
      axios
        .put(`/chat/user/${selectedUserId}/${chatNo}`)
        .then((res) => {
          if (res.data.result) {
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const sendMessage = (messageContent) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify({
          chatNo: chatNo,
          userNo: selectedUserId,
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
        placeholder="메시지를 입력하세요!"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage(e.target.value);
            e.target.value = "";
          }
        }}
      />
      <button onClick={chatClose}>채팅 종료</button>
    </div>
  );
}

export default AdminChat;
