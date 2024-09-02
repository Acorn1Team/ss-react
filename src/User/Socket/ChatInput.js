import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Style/ChatModel.module.css"; // CSS 모듈 파일 import

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState("");
  const userNo = Number(sessionStorage.getItem("id"));

  const [chatNo, setChatNo] = useState();
  const [chats, setChats] = useState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const nv = useNavigate();

  const handleSend = () => {
    if (message.trim() !== "") {
      const messagePayload = {
        chatNo: chatNo,
        content: message,
        sendAdmin: false,
        userNo: userNo,
      };

      // 전송한 메시지를 UI에 즉시 추가
      setChats([...chats, messagePayload]);

      // console.log("Sending message:", JSON.stringify(messagePayload));
      onSendMessage(messagePayload);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const chatClose = () => {
    if (
      prompt("채팅을 종료하시겠습니까?\n종료된 채팅은 다시 확인할 수 없습니다.")
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
    axios
      .get(`/chat/user/${userNo}`)
      .then((res) => {
        if (res.data.chatNo) {
          setChatNo(res.data.chatNo.no);
          // alert("1");
        }
        if (res.data.chats) {
          setChats(res.data.chats);
          // alert("2");
        }
        if (res.data.create) {
          setChatNo(res.data.create.no);
          setIsModalOpen(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
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
      {chats &&
        chats.map((c, index) => (
          <div key={index}>
            {c.sendAdmin ? "관리자: " : ""}
            {c.content}
          </div>
        ))}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요!"
      />
      <button onClick={handleSend}>Send</button>
      <br />
      <button onClick={chatClose}>채팅 종료</button>
      <br />
      채팅 종료시, 상담 내역을 다시 확인할 수 없습니다.
    </div>
  );
}

export default ChatInput;
