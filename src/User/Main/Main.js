import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Style/Main.css";

export default function UserHome() {
  const [show, setShow] = useState([]);
  const [review, setReview] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectReviewIndex, setSelectReviewIndex] = useState(0);
  const userNo = sessionStorage.getItem("id");

  const imageRef = useRef(null);

  // 리뷰 슬라이드 기능 구현
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectReviewIndex((prevIndex) =>
        review.length > 0
          ? prevIndex === review.length - 1
            ? 0
            : prevIndex + 1
          : 0
      );
    }, 5000); // 5초마다 슬라이드 변경
    return () => clearInterval(interval);
  }, [review]);

  // 스크롤에 따른 이미지 이동
  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        const scrollPosition = window.scrollY;
        imageRef.current.style.transform = `translateY(${scrollPosition}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 데이터 가져오기
  const fetchData = () => {
    axios
      .get("/main/showData")
      .then((res) => setShow(Array.isArray(res.data) ? res.data : []))
      .catch(() => setShow([]));

    axios
      .get("/main/showNewReview")
      .then((res) => setReview(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReview([]));

    axios
      .get("/main/showStyleBest")
      .then((res) => setPosts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPosts([]));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page-container">
      <div className="image-wrapper">
        <img
          ref={imageRef}
          className="scrollable-image"
          src="../images/mainFinal-01.png"
          alt="main"
        />
      </div>
      <div className="content">
        <b>SceneStealer</b>
        <b className="mainTextTitle">Choose Your Scene!</b>
        <div id="mainPosts">
          {Array.isArray(show) &&
            show.map((s) => (
              <Link to={`/user/main/sub/${s.no}`} key={s.no}>
                <div className="mainPostsBox">
                  <img src={s.pic} alt={s.title} />
                  <br />
                  {s.title}
                </div>
              </Link>
            ))}
        </div>
        <b className="mainTextTitle">New Review</b>
        <div id="mainReviews">
          {Array.isArray(review) && review.length > 0 && (
            <div className="mainReviewsBox active">
              <Link to={`/user/shop/review/${review[selectReviewIndex].no}`}>
                <img
                  src={review[selectReviewIndex].pic}
                  alt={review[selectReviewIndex].no}
                />
                <br />
                {review[selectReviewIndex].userNickname} &emsp;{" "}
                {review[selectReviewIndex].productName}
              </Link>
            </div>
          )}
        </div>
        <b className="mainTextTitle">Style Best</b>
        <div id="mainPosts">
          {Array.isArray(posts) &&
            posts.map((p) => (
              <Link to={`/user/style/detail/${p.no}`} key={p.no}>
                <div className="mainPostsBox">
                  <img src={p.pic} alt={p.no} />
                  {p.userNickname}
                </div>
              </Link>
            ))}
        </div>
      </div>
      {userNo === "1" && <Link to="/admin">관리자</Link>}
    </div>
  );
}
