import { Link } from "react-router-dom";

export default function HelpManage() {
  return (
    <>
      <span>
        <Link to="/admin/help/notices">공지사항 편집</Link>
      </span>&nbsp;&nbsp;
      <span>
        (여기는 라이브채팅)
      </span>
    </>
  );
}
