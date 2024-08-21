import SockJS from "sockjs-client";
import Stomp from "stompjs";

const socket = new SockJS("http://localhost:8080/ws");
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
  stompClient.subscribe("/topic/public", (message) => {
    console.log(JSON.parse(message.body));
  });

  stompClient.send(
    "/app/chat.sendMessage",
    {},
    JSON.stringify({
      sender: "User",
      content: "Hello, World!",
      type: "CHAT",
    })
  );
});
