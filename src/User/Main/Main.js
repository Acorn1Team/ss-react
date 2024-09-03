import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Style/Main.css";

export default function UserHome() {
  const [show, setShow] = useState([]);
  const [review, setReview] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectReviewIndex, setSelectReviewIndex] = useState(0);
  const [mainPopup, setMainPopup] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const userNo = sessionStorage.getItem("id");
  const cookies = document.cookie;

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

    const popupCookieCheck = getCookie(`${userNo}_popup`);

    if (popupCookieCheck === null) {
      axios
      .get(`/main/popup`)
      .then((res) => {
        const popupData = res.data.map((p) => ({
          ...p,
          popupOpen: getCookie(`${userNo}_popup_${p.no}`) === null,
        }));
        setMainPopup(popupData);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }, [userNo]);

  function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const closePopup = (day, popupNo) => {
    if (day) {
      document.cookie = `${userNo}_popup_${popupNo}=true; path=/; max-age=${60 * 60 * 24}`;
      // 하루(24시간) 동안 유효한 쿠키 설정
    }
    setMainPopup((prev) =>
      prev.map((p) =>
        p.no === popupNo ? { ...p, popupOpen: false } : p
      )
    );
  };

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
      {mainPopup.map((p) =>
        p.popupOpen && (
          <div key={p.no} className="popup-modal">
            <div className="popup-content">
              <Link to={p.path}><img src={p.pic} alt={p.no} width={"500px"} /></Link><br />
                <button className="popup-close" onClick={() => closePopup(true, p.no)}>오늘 하루 보지 않기</button>
                <button className="popup-close" onClick={() => closePopup(false, p.no)}>닫기</button>
            </div>
          </div>
        )
      )}
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
        <Link to="/user/main/show">작품 더보기</Link>
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
