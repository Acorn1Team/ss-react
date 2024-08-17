import { Route, Routes } from "react-router-dom";
import Posts from "./Posts";
import UserProfile from "./UserProfile";
import Follow from "./Follow";

export default function PostForm() {
  return (
    <div>
      <UserProfile></UserProfile>
      <Routes>
        <Route path="/" element={<Posts />} />
        <Route path="/followList/:followInfo" element={<Follow />} />
      </Routes>
    </div>
  );
}
