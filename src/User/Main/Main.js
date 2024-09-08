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

  // 이미지 전환을 위한 상태 추가
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false); // 전환 상태 관리
  const images = ["../images/newmain-text.png", "../images/newmain.png"]; // 두 개의 이미지 경로

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

  // 클릭 시 이미지 전환
  const handleImageClick = () => {
    if (!isTransitioning) {
      // 전환 중일 때는 클릭을 막음
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsTransitioning(false); // 전환 완료 후 다시 전환 가능하게 함
      }, 500); // 이미지 전환 시간 (500ms)
    }
  };

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
      document.cookie = `${userNo}_popup_${popupNo}=true; path=/; max-age=${
        60 * 60 * 24
      }`;
      // 하루(24시간) 동안 유효한 쿠키 설정
    }
    setMainPopup((prev) =>
      prev.map((p) => (p.no === popupNo ? { ...p, popupOpen: false } : p))
    );
  };

  return (
    <div className="page-container">
      <div className="image-wrapper" onClick={handleImageClick}>
        <img
          className={`scrollable-image ${
            isTransitioning ? "fade-out" : "fade-in"
          }`}
          src={images[currentImageIndex]} // 전환된 이미지 표시
          alt="main"
          loading="eager"
        />
      </div>
      {mainPopup.map(
        (p) =>
          p.popupOpen && (
            <div key={p.no} className="popup-modal">
              <div className="popup-content">
                <Link to={p.path}>
                  <img src={p.pic} alt={p.no} width={"500px"} />
                </Link>
                <br />
                <button
                  className="popup-close"
                  onClick={() => closePopup(true, p.no)}
                >
                  오늘 하루 보지 않기
                </button>
                <button
                  className="popup-close"
                  onClick={() => closePopup(false, p.no)}
                >
                  닫기
                </button>
              </div>
            </div>
          )
      )}
      <div className="content">
        <b>SceneStealer</b>
        <b className="mainTextTitle">Choose Your Scene</b>
        당신의 장면을 골라 보세요!
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
        <b className="mainTextTitle">최신 리뷰</b>
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
        <br />
        <b className="mainTextTitle">인기 스타일</b>
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
