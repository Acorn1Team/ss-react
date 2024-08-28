import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Style/Main.css";

export default function UserHome() {
  const [show, setShow] = useState([]);
  const [review, setReview] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectReviewIndex, setSelectReviewIndex] = useState(0);

  // 리뷰 슬라이드 기능 구현
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectReviewIndex((prevIndex) =>
        prevIndex === review.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5초마다 슬라이드 변경
    return () => clearInterval(interval);
  }, [review]);

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

  // 리뷰 슬라이드 기능 구현
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectReviewIndex((prevIndex) =>
        prevIndex === review.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5초마다 슬라이드 변경
    return () => clearInterval(interval);
  }, [review]);

  return (
    <div>
      <img width="100%" src="../images/mainphoto-01.png" alt="main"></img>
      <b>SceneStealer</b>
      <b className="mainTextTitle">Choose Your Scene!</b>
      <div id="mainPosts">
        {show.map((s) => (
          <Link to={`/user/main/sub/${s.no}`} key={s.no}>
            <div className="mainPostsBox" key={s.no}>
              <img src={s.pic} alt={s.title}></img>
              <br />
              {s.title}
            </div>
          </Link>
        ))}
      </div>
      <b className="mainTextTitle">New Review</b>
      <div id="mainReviews">
        {review.length > 0 && (
          <div className="mainReviewsBox active">
            <Link to={`/user/shop/review/${review[selectReviewIndex].no}`}>
              {review[selectReviewIndex].pic}
              <br />
              {review[selectReviewIndex].userNickname}&emsp;
              {review[selectReviewIndex].productName}
            </Link>
          </div>
        )}
      </div>
      <b className="mainTextTitle">Style Best</b>
      <div id="mainPosts">
        {posts.map((p) => (
          <Link to={`/user/style/detail/${p.no}`} key={p.no}>
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
