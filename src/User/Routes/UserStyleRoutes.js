import React from "react";
import { Route, Routes } from "react-router-dom";
import Posts from "../Posts/Posts";
import UserProfile from "../Posts/UserProfile";
import Follow from "../Posts/Follow";
import PostList from "../Posts/PostList";
import PostListByUser from "../Posts/PostListByUser";
import css from "../Style/UserStyle.module.css";
import PostWrite from "../Posts/PostWrite";

export default function UserStyleRoutes() {
  return (
    <div className={css["user-style-container"]}>
      <div className={css["user-profile"]}>
        <UserProfile />
      </div>
      <div className={css["user-routes"]}>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/list/:no" element={<PostListByUser />} />
          <Route path="/write/*" element={<PostWrite />} />
          <Route path="/write/:productNo" element={<PostWrite />} />
          <Route path="/write/edit/:postNo" element={<PostWrite />} />
          <Route path="/detail/:postNo" element={<Posts />} />
          <Route path="/:userNo/followList/:followInfo" element={<Follow />} />
        </Routes>
      </div>
    </div>
  );
}
