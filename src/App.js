import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import UserRoutes from "./User/Routes/UserRoutes";
import AdminRoutes from "./Admin/Routes/AdminRoutes";
import HeaderForm from "./User/Component/HeaderForm";
import AdminTop from "./Admin/AdminTop";
import ChatInput from "./User/Socket/ChatInput";
import SupportButton from "./User/Component/SupportButton"; // 고객지원 버튼 컴포넌트 import

function App() {
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
        console.log("Message received: ", JSON.parse(message.body));
      });
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const sendMessage = (messageContent) => {
    const adminUserNo = 100; // 관리자 ID
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify({
          userNo: adminUserNo, // 관리자 ID로 전송
          content: messageContent,
          sendCheck: true,
        }),
      });
    }
  };

  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/user/*" element={<HeaderForm />} />
          <Route path="/admin/*" element={<AdminTop />} />
        </Routes>
        <Routes>
          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route
            path="/user/chat"
            element={<ChatInput onSendMessage={sendMessage} />}
          />
        </Routes>
        <SupportButton /> {/* 고객지원 버튼을 모든 페이지에 표시 */}
      </BrowserRouter>
    </div>
  );
}

export default App;
