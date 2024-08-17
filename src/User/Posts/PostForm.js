import { Route, Routes } from "react-router-dom";
import Posts from "./Posts";
import UserProfile from "./UserProfile";
import Follow from "./Follow";
import PostList from "./PostList";

export default function PostForm() {
  return (
    <div>
      <UserProfile></UserProfile>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/detail/:postNo" element={<Posts />} />
        <Route path="/:userNo/followList/:followInfo" element={<Follow />} />
      </Routes>
    </div>
  );
}
