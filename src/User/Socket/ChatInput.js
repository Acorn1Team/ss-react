import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import styles from "../Style/ChatModel.module.css"; // CSS 모듈 파일 import
import stylesChat from "../Style/ChatInput.module.css"; // CSS 모듈 파일 import

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");
  const userNo = Number(sessionStorage.getItem("id"));
  const [chatNo, setChatNo] = useState();
  const [chats, setChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  const nv = useNavigate();

  // 메시지 전송 함수
  const handleSend = () => {
    if (message.trim() !== "") {
      const messagePayload = {
        chatNo: chatNo,
        content: message,
        sendAdmin: false,
        userNo: userNo,
      };

      console.log("Sending message:", JSON.stringify(messagePayload));
      onSendMessage(messagePayload);
      setMessage("");
    }
  };

  // Enter 키를 눌렀을 때 메시지 전송
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // 채팅 종료 함수
  const chatClose = () => {
    if (
      window.confirm(
        "채팅을 종료하시겠습니까?\n종료된 채팅은 다시 확인할 수 없습니다."
      )
    ) {
      axios
        .put(`/chat/user/${userNo}/${chatNo}`)
        .then((res) => {
          if (res.data.result) {
            nv(`../user`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // 상담 구분 선택 함수
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    axios
      .put(`/chat/user/${userNo}/${chatNo}/${category}`)
      .then((res) => {
        if (res.data.result) {
          setIsModalOpen(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 컴포넌트가 마운트될 때 실행되는 useEffect
  useEffect(() => {
    // 기존 채팅 내역 불러오기
    axios
      .get(`/chat/user/${userNo}`)
      .then((res) => {
        if (res.data.chatNo) {
          setChatNo(res.data.chatNo.no);
        }
        if (res.data.chats) {
          setChats(res.data.chats);
        }
        if (res.data.create) {
          setChatNo(res.data.create.no);
          setIsModalOpen(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    // STOMP 클라이언트 설정 및 WebSocket 연결
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("STOMP Debug: ", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      const chatRoomId = `1_${userNo}`;
      console.log("Connected, subscribing to:", `/sub/chat/room/${chatRoomId}`);
      client.subscribe(`/sub/chat/room/${chatRoomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        // console.log("Received message:", receivedMessage);
        setChats((prevMessages) => [...prevMessages, receivedMessage]);
        // alert("Message received: " + receivedMessage.content);
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [userNo]);

  return (
    <div className={stylesChat.container}>
      <h2>{selectedCategory}</h2>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>상담 구분을 선택해 주세요.</h2>
            <ul>
              <li>
                <button onClick={() => handleCategorySelect("상품 문의")}>
                  상품 문의
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySelect("배송 문의")}>
                  배송 문의
                </button>
              </li>
              <li>
                <button onClick={() => handleCategorySelect("기타 문의")}>
                  기타 문의
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className={stylesChat.chatMessages}>
        {chats &&
          chats.map((c, index) => (
            <div
              key={index}
              className={`${stylesChat.chatMessage} ${
                c.sendAdmin ? stylesChat.admin : ""
              }`}
            >
              {c.sendAdmin ? "관리자: " : ""}
              {c.content}
            </div>
          ))}
      </div>
      <div className={stylesChat.inputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요!"
          className={stylesChat.inputField}
        />
        <button onClick={handleSend} className={stylesChat.sendButton}>
          Send
        </button>
      </div>
      <button onClick={chatClose} className={stylesChat.closeButton}>
        채팅 종료
      </button>
      <br />
      채팅 종료시, 상담 내역을 다시 확인할 수 없습니다.
    </div>
  );
}

export default ChatInput;
