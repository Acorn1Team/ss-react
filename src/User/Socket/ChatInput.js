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
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false); // 채팅 종료 모달 상태
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

  // 채팅 종료 모달 열기
  const openCloseModal = () => {
    setIsCloseModalOpen(true);
  };

  // 채팅 종료 함수
  const handleCloseChat = () => {
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
    setIsCloseModalOpen(false);
  };

  // 채팅 종료 모달 닫기
  const closeModal = () => {
    setIsCloseModalOpen(false);
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

  useEffect(() => {
    const chatMessagesDiv = document.querySelector(
      `.${stylesChat.chatMessages}`
    );
    if (chatMessagesDiv) {
      chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }
  }, [chats]);

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
    const socket = new SockJS("/ws");
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
                <input
                  type="button"
                  className="btn1"
                  value="상품 문의"
                  onClick={() => handleCategorySelect("상품 문의")}
                ></input>
              </li>
              <li>
                <input
                  type="button"
                  className="btn1"
                  value="배송 문의"
                  onClick={() => handleCategorySelect("배송 문의")}
                ></input>
              </li>
              <li>
                <input
                  type="button"
                  className="btn1"
                  value="기타 문의"
                  onClick={() => handleCategorySelect("기타 문의")}
                ></input>
              </li>
            </ul>
            <input
              type="button"
              value="뒤로 가기"
              className="btn3"
              onClick={() => nv(-1)}
            ></input>
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
        <button onClick={handleSend} className="btn1">
          전송
        </button>
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={openCloseModal} className="btn3">
          채팅 종료
        </button>
        <br />
        채팅 종료시, 상담 내역을 다시 확인할 수 없습니다.
      </div>
      {isCloseModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <span className={styles.modalClose} onClick={closeModal}>
              &times;
            </span>
            <div className={styles.modalHeader}>
              채팅을 종료하시겠습니까?
              <br />
              종료된 채팅은 다시 확인할 수 없습니다.
            </div>
            <div className={styles.modalFooter}>
              <button className="btn1" onClick={handleCloseChat}>
                확인
              </button>
              <button className="btn1" onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInput;
