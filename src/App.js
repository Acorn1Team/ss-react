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
import LoadingScreen from "./User/Component/Loading";
import { PrivateRoute, AdminRoute } from "./User/Component/PrivateRoute";

function App() {
  const routeLocation = useLocation();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.loading.loading);

  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });

    const socket = new SockJS("/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("STOMP Debug: ", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log("Connected to server:", frame);
      console.log("Connected server version: ", frame.headers["version"]);
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
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
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify({
          userNo: parseInt(messageContent.userNo),
          content: messageContent.content,
          sendAdmin: messageContent.sendAdmin,
          chatNo: parseInt(messageContent.chatNo),
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
              element={
                <PrivateRoute
                  element={<ChatInput onSendMessage={sendMessage} />}
                />
              }
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
