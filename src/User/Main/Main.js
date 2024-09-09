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

  // 이미지 전환을 위한 상태 추가
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false); // 전환 상태 관리
  const images = ["../images/newmain-text.png", "../images/newmain.png"]; // 두 개의 이미지 경로

  const userNo = sessionStorage.getItem("id");
  const cookies = document.cookie;

  const imageRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectReviewIndex((prevIndex) => (prevIndex + 1) % review.length); // 다음 슬라이드로 이동, 마지막 인덱스에서 처음으로 돌아옴
    }, 5000); // 5초마다 슬라이드 변경

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 인터벌 정리
  }, [review]);

  // 슬라이드 이동 스타일을 계산하는 함수
  const getTransformStyle = () => {
    return {
      transform: `translateX(-${selectReviewIndex * 100}%)`, // 현재 인덱스에 따라 슬라이드 이동
      transition: "transform 0.5s ease-in-out", // 자연스러운 이동
    };
  };

  // 이미지 전환을 위한 상태 추가
  const handleImageMouseOver = () => {
    if (!isTransitioning) {
      // 전환 중일 때는 전환을 막음
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

  useEffect(() => {
    console.log(mainPopup); // 팝업 데이터 확인
  }, [mainPopup]);

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
    }
    setMainPopup((prev) =>
      prev.map((p) => (p.no === popupNo ? { ...p, popupOpen: false } : p))
    );
  };

  return (
    <div className="page-container">
      <div className="image-wrapper" onMouseOver={handleImageMouseOver}>
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
        <div id="mainReviewsContainer">
          <div id="mainReviews" style={getTransformStyle()}>
            {Array.isArray(review) &&
              review.map((r, index) => (
                <div className="mainReviewsBox" key={r.no}>
                  <Link to={`/user/shop/review/${r.no}`}>
                    <img src={r.pic} alt={r.no} />
                  </Link>
                </div>
              ))}
          </div>
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
