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
import SupportButton from "./User/Component/SupportButton"; // 고객지원 버튼 컴포넌트 import
import { useDispatch, useSelector } from "react-redux"; // Redux 관련 import
import LoadingScreen from "./User/Component/Loding"; // 로딩 스크린 컴포넌트 import

function App() {
  const routeLocation = useLocation(); // location 대신 다른 이름 사용

  const dispatch = useDispatch(); // Redux dispatch 함수
  const loading = useSelector((state) => state.loading); // 전역 로딩 상태를 가져옴

  // 채팅 구현을 위한 STOMP 클라이언트 객체를 저장
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // 페이지 로딩 시작
    dispatch({ type: "SET_LOADING", payload: true });

    const socket = new SockJS("http://localhost:8080/ws");
    // SockJS를 사용하여 웹 소켓 엔드포인트 (/ws) 에 연결
    // 서버의 WebSocketConfig.java 의 registerStompEndpoints 오버라이딩 메소드에서 지정함
    const client = new Client({
      webSocketFactory: () => socket,
      // webSocketFactory : 웹 소켓 연결 생성
      // () => socket : SockJS를 사용하여 socket 객체가 웹 소켓 연결로 사용됨
      // SockJS는 웹 소켓을 지원하지 않는 브라우저에서 대체 프로토콜을 사용하여 웹 소켓 기능 제공
      debug: (str) => console.log(str),
      // debug : 디버깅 정보 출력 함수
      // 클라이언트 연결, 메시지 송/수신에 따른 디버깅 정보를 로그에 기록함
      // 이를 콘솔에 출력함으로써 웹 소켓 연결 상태와 메시지 송/수신 과정을 모니터링
      reconnectDelay: 5000,
      // 클라이언트가 서버와의 연결이 끊어졌을 때 자동으로 재연결을 시도하기 전에 대기하는 시간
      // 해당 설정은 연결이 끊어졌을 때, 5초 후에 재연결을 시도한다는 의미
      heartbeatIncoming: 4000,
      // 서버에서 주기적으로 보내는 하트비트(연결 유지를 위한 신호)의 주기 설정
      // 해당 설정은 서버가 클라이언트에게 4초마다 하트비트를 보낸다는 의미
      // 연결이 살아 있는지 확인하는 데 사용
      heartbeatOutgoing: 4000,
      // 클라이언트에서 서버로 주기적으로 보내는 하트비트의 주기 설정
      // 해당 설정은 클라이언트가 서버에게 4초마다 하트비트를 보낸다는 의미
    });

    client.onConnect = () => {
      // 클라이언트가 웹 소켓에 연결되었을 때 호출됨
      client.subscribe("/sub/chat/room/100", (message) => {
        // 해당 경로로 들어오는 메시지를 구독
        console.log("Message received: ", JSON.parse(message.body));
        // 수신된 메시지 콘솔 출력 (확인)
      });

      // 웹 소켓이 연결된 후 로딩 종료
      dispatch({ type: "SET_LOADING", payload: false });
    };

    client.activate();
    // STOMP 클라이언트를 활성화
    // 서버와 웹 소켓 연결 시작
    setStompClient(client);

    return () => {
      // 컴포넌트가 언마운트될 때 호출되는 클린업 함수
      if (client) {
        client.deactivate();
        // STOMP 클라이언트 비활성화
        // 서버와 웹 소켓 연결 종료
      }
    };
  }, [dispatch]);

  useEffect(() => {
    // 페이지 이동 시 로딩 상태를 true로 설정
    dispatch({ type: "SET_LOADING", payload: true });

    // 로딩 상태를 해제하는 함수
    const handleDataLoad = () => {
      // 데이터 로드가 완료되면 로딩 상태를 false로 설정
      dispatch({ type: "SET_LOADING", payload: false });
    };

    // 0.5초 후에 로딩 상태를 해제 (예시)
    const timer = setTimeout(handleDataLoad, 500);

    // 클린업 함수: 컴포넌트가 언마운트될 때 타이머를 정리
    return () => clearTimeout(timer);
  }, [routeLocation.pathname, dispatch]);

  // 메시지를 서버로 전송하는 함수
  const sendMessage = (messageContent) => {
    const adminUserNo = 100; // 관리자 ID
    if (stompClient && stompClient.connected) {
      // stompClient가 연결되어 있는 경우 해당 블록으로 들어옴
      stompClient.publish({
        destination: `/pub/chat/message`,
        // 메시지를 /pub/chat/message 경로로 발행
        body: JSON.stringify({
          // 발행할 때 타입은 JSON 형태
          userNo: adminUserNo, // 관리자 ID로 전송
          content: messageContent,
          sendCheck: true,
        }),
      });
    }
  };

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
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route
              path="/user/chat"
              element={<ChatInput onSendMessage={sendMessage} />}
            />
          </Routes>
        </div>
        {loading && <LoadingScreen />} {/* 로딩 상태일 때 로딩 화면을 표시 */}
        <SupportButton />
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
