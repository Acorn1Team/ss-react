import { Link } from "react-router-dom";

export default function HelpManage() {
  return (
    <>
      <h2>
        <Link to="/admin/help/notices">공지사항 편집</Link>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/admin/help/chat">채팅 상담</Link>
      </h2>
    </>
  );
}
