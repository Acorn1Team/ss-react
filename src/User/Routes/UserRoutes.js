import { Route, Routes } from "react-router-dom";
import UserMainRoutes from "./UserMainRoutes";
import UserMypageRoutes from "./UserMypageRoutes";
import UserShopRoutes from "./UserShopRoutes";
import UserStyleRoutes from "./UserStyleRoutes";
import Main from "../Main/Main";
import SearchRoutes from "./SearchRoutes";
import AuthRoutes from "./AuthRoutes";
import SocialKakao from "../Component/SocialKakao";

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/shop/*" element={<UserShopRoutes />} />
      <Route path="/style/*" element={<UserStyleRoutes />} />
      <Route path="/mypage/*" element={<UserMypageRoutes />} />
      <Route path="/main/*" element={<UserMainRoutes />} />
      <Route path="/search/*" element={<SearchRoutes />} />
      <Route path="/auth/*" element={<AuthRoutes />} />
      <Route path="/callback" element={<SocialKakao />} />
    </Routes>
  );
}
