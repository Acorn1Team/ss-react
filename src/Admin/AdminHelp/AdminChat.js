import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import Modal from "react-modal";
import styles from "../Style/AdminChat.module.css";

function AdminChat() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [chatNo, setChatNo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [closeState, setCloseState] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [showClosedChats, setShowClosedChats] = useState(false);

  // 채팅방 목록
  useEffect(() => {
    const fetchChatRooms = () => {
      axios
        .get(`/chat/admin`)
        .then((res) => {
          setChatRooms(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    // 최초에 한 번 채팅방 목록 불러오기
    fetchChatRooms();

    // 5초마다 주기적으로 채팅방 목록 불러오기
    const interval = setInterval(fetchChatRooms, 5000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(interval);
  }, []); // 의존성 배열에 아무것도 넣지 않음, 최초에 한 번만 실행

  const handleUserSelect = (userId, chatNo, closeState) => {
    setSelectedUserId(userId);
    setChatNo(chatNo);
    setCloseState(closeState);
  };

  // useEffect(() => {
  //   const chatWindow = document.querySelector(`.${styles.messageList}`);
  //   if (chatWindow) {
  //     chatWindow.scrollTop = chatWindow.scrollHeight;
  //   }
  // }, [messages]);

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

    const socket = new SockJS("/ws");
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
    axios
      .put(`/chat/user/${selectedUserId}/${chatNo}`)
      .then((res) => {
        if (res.data.result) {
          setSelectedUserId(null);
          setChatNo(null);
          setMessages([]);
          setIsCloseModalOpen(false);
          setCloseState(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
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
        <ul className={styles.chatRoomItems}>
          {chatRooms
            .filter((room) => room.closeChat === showClosedChats)
            .map((room) => (
              <li
                key={room.no}
                onClick={() =>
                  handleUserSelect(room.userNo, room.no, room.closeChat)
                }
                className={`${styles.chatRoomItem} ${
                  room.closeChat ? styles.closed : ""
                } ${chatNo === room.no ? styles.active : ""}`}
              >
                💬 {room.no}번 상담 <br />
                {room.category}<br />
                {room.userName} (9042{room.userNo})
              </li>
            ))}
        </ul>
      </div>

      {selectedUserId && chatNo && (
        <div className={styles.chatWindow}>
          <h2>회원 번호 : {selectedUserId}</h2>
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
          {!closeState ? (
            <div>
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

              <button
                className={styles.closeButton}
                onClick={() => setIsCloseModalOpen(true)}
              >
                채팅 종료
              </button>
            </div>
          ) : (
            <div>종료된 채팅입니다.</div>
          )}
        </div>
      )}
      <Modal
        isOpen={isCloseModalOpen}
        onRequestClose={() => setIsCloseModalOpen(false)}
        contentLabel="채팅 종료 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "300px",
            height: "200px",
            margin: "auto",
          },
        }}
      >
        <>
          <h4>채팅을 종료하시겠습니까?</h4>
          <h4>종료된 채팅은 다시 재개할 수 없습니다.</h4>
          <br />
          <br />
          <button className="delete-button" onClick={() => chatClose()}>
            종료
          </button>
          &nbsp;&nbsp;
          <button
            className="cancel-button"
            onClick={() => setIsCloseModalOpen(false)}
          >
            취소
          </button>
        </>
      </Modal>
    </div>
  );
}

export default AdminChat;
