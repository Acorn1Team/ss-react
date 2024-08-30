import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import UserRoutes from "./User/Routes/UserRoutes";
import Process from "./User/Main/Process";
import AdminRoutes from "./Admin/Routes/AdminRoutes";
import HeaderForm from "./User/Component/HeaderForm";
import AdminTop from "./Admin/AdminTop";
import ChatInput from "./User/Socket/ChatInput";

import { useDispatch, useSelector } from "react-redux";
import LoadingScreen from "./User/Component/Loding";
import { PrivateRoute, AdminRoute } from "./User/Component/PrivateRoute";

function App() {
  const routeLocation = useLocation();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.loading.loading); // 올바른 경로 사용

  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      const userNo = sessionStorage.getItem("id"); // 사용자 ID를 세션 등에서 가져옴
      const chatRoomId = `admin_${userNo}`; // 관리자와 사용자 간의 고유 경로 생성

      client.subscribe(`/sub/chat/room/${chatRoomId}`, (message) => {
        console.log("Message received: ", JSON.parse(message.body));
      });

      dispatch({ type: "SET_LOADING", payload: false });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [dispatch]);

  const sendMessage = (messageContent) => {
    const userNo = sessionStorage.getItem("id"); // 사용자 ID를 세션 등에서 가져옴
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify({
          userNo: { no: userNo }, // DTO에서 userNo 필드를 맞춤
          content: messageContent,
          sendCheck: true,
        }),
      });
    }
  };

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });

    const handleDataLoad = () => {
      dispatch({ type: "SET_LOADING", payload: false });
    };

    const timer = setTimeout(handleDataLoad, 500);

    return () => clearTimeout(timer);
  }, [routeLocation.pathname, dispatch]);

  return (
    <div className="container">
      <>
        <Routes>
          <Route path="/user/*" element={<HeaderForm />} />
          <Route path="/admin/*" element={<AdminTop />} />
        </Routes>
        <div>
          <Routes>
            <Route path="/" element={<Process />} />
            <Route path="/user/*" element={<UserRoutes />} />
            <Route
              path="/admin/*"
              element={<AdminRoute element={<AdminRoutes />} />}
            />

            <Route
              path="/user/chat"
              element={<ChatInput onSendMessage={sendMessage} />}
            />
          </Routes>
        </div>
        {loading && <LoadingScreen />}
      </>
    </div>
  );
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
