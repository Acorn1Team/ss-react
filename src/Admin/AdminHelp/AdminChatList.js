import React, { useState, useEffect } from "react";
import AdminChat from "./AdminChat";
import axios from "axios";

function AdminChatList() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [chatNo, setChatNo] = useState();

  const [chatData, setChatData] = useState([]);

  useEffect(() => {
    axios
      .get(`/chat/admin`)
      .then((res) => {
        setChatRooms(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleUserSelect = (userId, chatNo) => {
    setSelectedUserId(userId);
    axios
      .get(`/chat/admin/${chatNo}`)
      .then((res) => {
        setChatData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    setChatNo(chatNo);
  };

  return (
    <div>
      <ul>
        {chatRooms.map((room) => (
          <li
            key={room.no}
            onClick={() => handleUserSelect(room.userNo, room.no)}
            style={room.closeChat ? { color: "gray" } : { color: "black" }}
          >
            {room.userNo} 번 회원 &emsp; {room.userName} ({room.category})
          </li>
        ))}
      </ul>
      {selectedUserId && (
        <AdminChat
          selectedUserId={selectedUserId}
          chatNo={chatNo}
          chatData={chatData}
        />
      )}
    </div>
  );
}

export default AdminChatList;
