# 웹 소켓을 사용한 실시간 채팅

## 채팅 전송 처리 흐름

### 1. 사용자가 메시지 입력

- ChatInput 컴포넌트에서 사용자가 메시지 입력, Send 버튼을 클릭하면 handleSend 함수 호출

### 2. 메시지 전송

- handleSend 함수는 onSendMessage 함수를 호출, 입력된 메시지를 sendMessage 함수에 전달

### 3. 메시지 발송

- sendMessage 함수가 stompClient를 사용하여 STOMP 프로토콜을 통해 서버로 메시지 발송

## 컴포넌트의 역할

### ChatInput

사용자로부터 메시지를 입력받고 handleSend 함수를 통해 메시지 전송,
사용자가 메시지를 입력하고 전송할 수 있도록 함

### App

stompClient를 설정, STOMP 프로토콜을 통해 서버와 연결함. sendMessage 함수를 통해 서버로 메시지를 발송하고, ChatInput 컴포넌트를 통해 사용자로부터 입력된 메시지를 sendMessage 함수에 전달, 메시지를 서버로 전달함

## 서버 측에서의 메시지 수신 / 처리

클라이언트가 발송한 메시지를 받아서 해당 채팅방에 구독한 클라이언트들에게 메시지 방송

## 정리

채팅 메시지의 전송 부분은 클라이언트 측 **App** 내 **sendMessage 함수**
