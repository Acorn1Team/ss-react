import { Route, Routes } from "react-router-dom";
import UserMainRoutes from "./UserMainRoutes";
import UserMypageRoutes from "./UserMypageRoutes";
import UserShopRoutes from "./UserShopRoutes";
import UserStyleRoutes from "./UserStyleRoutes";
import Main from "../Main/Main";
import SearchRoutes from "./SearchRoutes";
import AuthRoutes from "./AuthRoutes";
import SocialKakao from "../Component/SocialKakao";
import SocailNaver from "../Component/SocialNaver";
import { PrivateRoute, AdminRoute } from "../Component/PrivateRoute";
import SupportButton from "../Component/SupportButton"; // 고객지원 버튼 컴포넌트 import

export default function UserRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/shop/*" element={<UserShopRoutes />} />
        <Route
          path="/style/*"
          element={<PrivateRoute element={<UserStyleRoutes />} />}
        />
        <Route
          path="/mypage/*"
          element={<PrivateRoute element={<UserMypageRoutes />} />}
        />
        <Route path="/main/*" element={<UserMainRoutes />} />
        <Route path="/search/*" element={<SearchRoutes />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/callback" element={<SocialKakao />} />
        <Route path="/callback/naver" element={<SocailNaver />} />
      </Routes>
      <SupportButton />
    </>
  );
}
