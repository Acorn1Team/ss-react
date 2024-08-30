import React, { useState, useEffect } from "react";
import AdminChat from "./AdminChat";

function AdminChatList() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    // 여기에 실제로 DB에서 채팅방 목록을 가져오는 API 호출 로직 추가
    // 예를 들어 setChatRooms([{ id: "1", name: "User 1" }, { id: "2", name: "User 2" }]);
    // 여기서는 예시 데이터로 대체
    setChatRooms([
      { id: "1", name: "User 1" },
      { id: "2", name: "User 2" },
      { id: "28", name: "User 28" },
    ]);
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {chatRooms.map((room) => (
          <li key={room.id} onClick={() => handleUserSelect(room.id)}>
            {room.name}
          </li>
        ))}
      </ul>
      {selectedUserId && <AdminChat selectedUserId={selectedUserId} />}
    </div>
  );
}

export default AdminChatList;
