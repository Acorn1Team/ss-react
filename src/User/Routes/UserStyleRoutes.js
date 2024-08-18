import React from "react";
import { Route, Routes } from "react-router-dom";
import Posts from "../Posts/Posts";
import UserProfile from "../Posts/UserProfile";
import Follow from "../Posts/Follow";
import PostList from "../Posts/PostList";
import PostListByUser from "../Posts/PostListByUser";
export default function UserStyleRoutes() {
  return (
    <>
      <UserProfile></UserProfile>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/list/:no" element={<PostListByUser />} />
        <Route path="/detail/:postNo" element={<Posts />} />
        <Route path="/:userNo/followList/:followInfo" element={<Follow />} />
      </Routes>
    </>
  );
}
