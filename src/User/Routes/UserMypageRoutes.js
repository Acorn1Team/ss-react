import { Route, Routes } from "react-router-dom";
import Scrap from "../MyPage/Scrap";
import Notice from "../User/Notice";
import NoticeDetail from "../User/NoticeDetail";
import Myreview from "../MyPage/Myreview";
import Coupon from "../MyPage/Coupon";
import MyOrder from "../MyPage/MyOrder";
import MyOrderDetail from "../MyPage/MyOrderDetail";
import ReviewWritePage from "../MyPage/ReviewWritePage";
import UserUpdate from "../MyPage/UserUpdate";

export default function UserMypageRoutes() {
  return (
    <Routes>
      <Route path="/scrap" element={<Scrap />} />
      <Route path="/notice" element={<Notice />} />
      <Route path="/notice/:noticeNo" element={<NoticeDetail />} />
      <Route path="/review" element={<Myreview />} />
      <Route path="/coupon" element={<Coupon />} />
      <Route path="/order" element={<MyOrder />} />
      <Route path="/order/:orderNo" element={<MyOrderDetail />} />
      <Route path="/review/write/:productNo" element={<ReviewWritePage />} />
      <Route path="/update/:userNo/*" element={<UserUpdate />} />
    </Routes>
  );
}
