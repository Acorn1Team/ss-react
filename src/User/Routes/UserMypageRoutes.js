import { Route, Routes } from "react-router-dom";
import Scrap from "../MyPage/Scrap";
import Notice from "../User/Notice";
import NoticeDetail from "../User/NoticeDetail";

export default function UserMypageRoutes() {
  return (
    <Routes>
      <Route path="/scrap/:no" element={<Scrap />} />
      <Route path="/notice" element={<Notice />} />
      <Route path="/notice/:noticeNo" element={<NoticeDetail />} />
    </Routes>
  );
}
