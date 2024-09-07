import { Link } from "react-router-dom";
import NoticeManage from "./NoticeManage";

export default function HelpManage() {
  return (
    <>
      <h2>
        <Link to="/admin/help/chat">채팅 상담하러 가기 🚀</Link>
        <hr/>
        <NoticeManage />
      </h2>
    </>
  );
}
