import { useParams } from "react-router-dom";

export default function NoticeDetail() {
  const { noticeNo } = useParams();
  return <div>공지 상세보기.. ${noticeNo}번 공지</div>;
}
