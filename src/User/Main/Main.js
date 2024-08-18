import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function UserHome() {
  const [show, setShow] = useState([]);
  const [review, setReview] = useState([]);
  const [posts, setPosts] = useState([]);

  // 메인에 보여 줄 작품 목록 가져오기
  const showData = () => {
    axios
      .get("/main/showData")
      .then((res) => {
        setShow(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 메인에 보여 줄 최신 리뷰 가져오기
  const showNewReview = () => {
    axios
      .get("/main/showNewReview")
      .then((res) => {
        setReview(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 메인에 보여 줄 피드 베스트 가져오기
  const showStyleBest = () => {
    axios
      .get("/main/showStyleBest")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 최초 접속시 1회 로딩
  useEffect(() => {
    showData();
    showNewReview();
    showStyleBest();
  }, []);

  return (
    <div>
      <img width="100%" src="../images/mainphoto-01.png" alt="main"></img>
      <b>SceneStealer</b>
      <div id="mainPosts">
        <b className="mainTextTitle">Choose Your Scene!</b>
        {show.map((s) => (
          <Link to={`/user/main/sub/${s.no}`}>
            <div className="mainPostsBox" key={s.no}>
              {s.pic}
              <br />
              {s.title}
            </div>
          </Link>
        ))}
      </div>
      <div id="mainReviews">
        <b className="mainTextTitle">New Review</b>
        {review.map((r) => (
          <Link to={`/user/shop/review/${r.no}`}>
            <div className="mainReviewsBox" key={r.no}>
              {r.pic}
              <br />
              {r.userNickname}&emsp;{r.productName}
            </div>
          </Link>
        ))}
      </div>
      <div id="mainPosts">
        <b className="mainTextTitle">Style Best</b>
        <b className="mainTextTitle">New Review</b>
        {posts.map((p) => (
          <Link to={`/user/style/detail/${p.no}`}>
            <div className="mainPostsBox" key={p.no}>
              {p.pic}&emsp;{p.userNickname}
            </div>
          </Link>
        ))}
      </div>
      <Link to="/admin">관리자</Link>
    </div>
  );
}
