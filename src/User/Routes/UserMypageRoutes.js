import { Route, Routes } from "react-router-dom";
import Scrap from "../MyPage/Scrap";

export default function UserMypageRoutes() {
  return (
    <Routes>
      <Route path="/scrap/:no" element={<Scrap />} />
    </Routes>
  );
}
