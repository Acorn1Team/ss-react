import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import styles from "../../User/Style/AdminChat.module.css";

function AdminChat() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [chatNo, setChatNo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  const [showClosedChats, setShowClosedChats] = useState(false);

  // 채팅방 목록
  useEffect(() => {
    axios
      .get(`/chat/admin`)
      .then((res) => {
        setChatRooms(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedUserId, chatNo]);

  const handleUserSelect = (userId, chatNo) => {
    setSelectedUserId(userId);
    setChatNo(chatNo);
  };

  useEffect(() => {
    if (!selectedUserId || !chatNo) return;

    setMessages([]);
    if (stompClient) {
      stompClient.deactivate();
    }

    axios
      .get(`/chat/admin/${chatNo}`)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    const socket = new SockJS("http://192.168.0.19:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

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
  }, [selectedUserId, chatNo]);

  const chatClose = () => {
    if (
      window.confirm(
        "채팅을 종료하시겠습니까?\n종료된 채팅은 다시 재개할 수 없습니다."
      )
    ) {
      axios
        .put(`/chat/user/${selectedUserId}/${chatNo}`)
        .then((res) => {
          if (res.data.result) {
            setSelectedUserId(null);
            setChatNo(null);
            setMessages([]);
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
    <div className={styles.container}>
      <div className={styles.chatRoomList}>
        <button onClick={() => setShowClosedChats(!showClosedChats)}>
          {showClosedChats ? "진행 중인 채팅 보기" : "종료된 채팅 보기"}
        </button>
        <ul>
          {chatRooms
            .filter((room) => room.closeChat === showClosedChats)
            .map((room) => (
              <li
                key={room.no}
                onClick={() => handleUserSelect(room.userNo, room.no)}
                className={`${styles.chatRoomItem} ${
                  room.closeChat ? styles.closed : ""
                } ${chatNo === room.no ? styles.active : ""}`}
              >
                {room.no} 번 상담 <br />
                {room.userNo} 번 회원
                <br />
                {room.userName} ({room.category})
              </li>
            ))}
        </ul>
      </div>

      {selectedUserId && chatNo && (
        <div className={styles.chatWindow}>
          <h2>Admin Chat with User {selectedUserId}</h2>
          <div className={styles.messageList}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messageItem} ${
                  msg.sendAdmin ? styles.admin : ""
                }`}
              >
                {msg.sendAdmin ? "관리자: " : ""}
                {msg.content}
              </div>
            ))}
          </div>
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="메시지를 입력하세요!"
              className={styles.inputField}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
          <button className={styles.closeButton} onClick={() => chatClose()}>
            채팅 종료
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminChat;
