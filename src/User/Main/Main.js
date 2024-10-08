import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Style/Main.css";
import { PiCaretCircleDoubleLeftFill } from "react-icons/pi";
import { PiCaretCircleDoubleRightFill } from "react-icons/pi";

export default function UserHome() {
  const [show, setShow] = useState([]);
  const [review, setReview] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectReviewIndex, setSelectReviewIndex] = useState(0);
  const [mainPopup, setMainPopup] = useState([]);
  const [styleItemCount, setStyleItemCount] = useState(0);
  const [randomStyle, setRandomStyle] = useState(null); // 추가된 상태
  const [randomShow, setRandomShow] = useState(null); // 랜덤 작품
  const [randomCharacterNames, setRandomCharacterNames] = useState(null); // 랜덤 작품의 모든 배역 이름
  const [randomCharacter, setRandomCharacter] = useState(null); // 랜덤 배역
  const [randomItems, setRandomItems] = useState([]); // 랜덤 아이템

  const images = ["../images/newmain-text.png", "../images/newmain.png"];

  const userNo = sessionStorage.getItem("id");

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectReviewIndex((prevIndex) => (prevIndex + 1) % review.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [review]);

  const getTransformStyle = () => {
    return {
      transform: `translateX(-${selectReviewIndex * 100}%)`,
      transition: "transform 0.5s ease-in-out",
    };
  };

  const fetchData = () => {
    axios
      .get("/api/main/showData") // /api 추가
      .then((res) => setShow(Array.isArray(res.data) ? res.data : []))
      .catch(() => setShow([]));

    axios
      .get("/api/main/showNewReview") // /api 추가
      .then((res) => setReview(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReview([]));

    axios
      .get("/api/main/showStyleBest") // /api 추가
      .then((res) => setPosts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPosts([]));
  };

  useEffect(() => {
    fetchData();

    axios
      .get(`/api/main/forRandom`) // /api 추가
      .then((res) => setStyleItemCount(res.data))
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const mainLoad = () => {
    if (styleItemCount > 0) {
      const n = Math.floor(Math.random() * styleItemCount) + 1;

      axios
        .get(`/api/main/random/${n}`) // /api 추가
        .then((res) => {
          setRandomShow(res.data.show);
          setRandomCharacterNames(res.data.names);
          setRandomCharacter(res.data.character);
          setRandomStyle(res.data.style);
          setRandomItems(res.data.items);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    mainLoad();
  }, [styleItemCount]);

  useEffect(() => {
    const cookieUserNo = userNo || "guest";
    console.log(`Checking popup cookie for: ${cookieUserNo}`);

    const popupCookieCheck = getCookie(`${cookieUserNo}_popup`);

    console.log("Popup cookie value:", popupCookieCheck); // 추가

    if (popupCookieCheck === null) {
      axios
        .get(`/api/main/popup`) // /api 추가
        .then((res) => {
          const popupData = res.data.map((p) => ({
            ...p,
            popupOpen: getCookie(`${cookieUserNo}_popup_${p.no}`) === null, // 쿠키 확인
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
    const cookieUserNo = userNo || "guest";

    if (day) {
      document.cookie = `${cookieUserNo}_popup_${popupNo}=true; path=/; max-age=${
        60 * 60 * 24
      }`;
    }
    setMainPopup((prev) =>
      prev.map((p) => (p.no === popupNo ? { ...p, popupOpen: false } : p))
    );
  };

  const [currentIndex, setCurrentIndex] = useState(0); // currentIndex 상태 추가

  // 슬라이드 이전 버튼 동작
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? 1 : prevIndex - 1));
  };

  // 슬라이드 다음 버튼 동작
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="page-container">
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
      <div className="mainPhotoSlide">
        <div
          className="slide-content"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <div className="slide">
            <img
              className="scrollable-image"
              src={images[1]}
              alt="slide-0"
              loading="eager"
            />
          </div>

          <div className="slide">
            <div className="content-wrapper">
              <div className="content">
                <h2 style={{ color: "#c7727e" }}>CHOOSE YOUR SCENE!</h2>
                <span style={{ color: "#555" }}>
                  어떤 장면을 당신의 것으로 만들까요?
                </span>

                <div className="horizontal-container">
                  <div style={{ textAlign: "center" }}>
                    <Link to={`/user/main/sub/${randomShow?.no}`}>
                      <section id="card1" className="card">
                        <img src={randomShow?.pic} alt="mainpic" />
                        <div className="card__content">
                          <p className="card__title">
                            {randomShow?.title || "제목 없음"}
                          </p>
                          <p className="card__description">
                            {randomCharacterNames &&
                            randomCharacterNames.length > 0 ? (
                              randomCharacterNames.map((c) => (
                                <div key={c}>{c.slice(0, -2)}</div>
                              ))
                            ) : (
                              <p>캐릭터 정보가 없습니다.</p>
                            )}
                          </p>
                          <br />
                          <p style={{ fontSize: "80%" }}>
                            클릭해 보세요!
                            <br /> '{randomShow?.title}'의
                            <br /> 더 많은 스타일을 <br />볼 수 있어요.
                          </p>
                        </div>
                      </section>
                    </Link>
                    <Link to="/user/main/show">
                      <button className="btn3Small">작품 목록 보러 가기</button>
                    </Link>
                  </div>

                  <div className="random-character">
                    <img
                      className="characterPic"
                      src={randomCharacter?.pic}
                      alt="characterPic"
                    />
                    {randomCharacter?.name.slice(0, -2)}
                    <br />
                    <button
                      onClick={() => {
                        mainLoad(); // 기존 새로고침 기능
                        const refreshIcon = document.querySelector(
                          ".refresh-button svg"
                        );
                        refreshIcon.style.animation = "none"; // 애니메이션 리셋
                        setTimeout(() => {
                          refreshIcon.style.animation = ""; // 애니메이션 재시작
                        }, 0); // 짧은 지연 후 애니메이션 재시작
                      }}
                      className="refresh-button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-arrow-repeat"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                        <path
                          fillRule="evenodd"
                          d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="random-layout">
                    <div className="random-style-container">
                      {randomStyle ? (
                        <div>
                          <img
                            src={randomStyle.pic}
                            alt={`style-${randomStyle.no}`}
                          />
                        </div>
                      ) : (
                        <p>스타일 정보가 없습니다.</p>
                      )}
                    </div>

                    <div className="random-style-items">
                      {randomItems.length > 0 ? (
                        randomItems.map((item) => (
                          <div key={item.no}>
                            <Link
                              to={`/user/shop/productlist/detail/${item.productNo}`}
                            >
                              <img
                                className="randomItemPic"
                                src={item.pic}
                                alt={`item-${item.no}`}
                              />
                            </Link>
                          </div>
                        ))
                      ) : (
                        <p>
                          아이템 정보가
                          <br /> 없습니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <h3 style={{ color: "#c7727e" }}>
                  FIND THE STYLE YOU LOVE!
                  <br />
                  BUY IT IF YOU WANT OR JUST SCRAP
                </h3>
                <span style={{ color: "#555" }}>
                  마음에 드는 스타일을 찾으셨다면, 사거나 담거나!
                </span>
              </div>
            </div>
          </div>
        </div>

        {currentIndex > 0 && (
          <span className="slide-button prev" onClick={handlePrev}>
            <PiCaretCircleDoubleLeftFill color="df919e" />
          </span>
        )}

        {currentIndex < 1 && (
          <span className="slide-button next" onClick={handleNext}>
            <PiCaretCircleDoubleRightFill color="df919e" />
          </span>
        )}
      </div>

      <b className="mainTextTitle">최신 리뷰</b>
      <div id="mainReviewsContainer">
        <div id="mainReviews" style={getTransformStyle()}>
          {Array.isArray(review) && review.length > 0 ? (
            review.map((r) => (
              <div className="mainReviewsBox" key={r.no}>
                <Link to={`/user/shop/review/${r.no}`}>
                  <img src={r.pic} alt={r.no} />
                </Link>
              </div>
            ))
          ) : (
            <p>리뷰가 없습니다.</p>
          )}
        </div>
      </div>
      <br />
      <b className="mainTextTitle">인기 스타일</b>
      <div id="mainPosts">
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((p) => (
            <Link to={`/user/style/detail/${p.no}`} key={p.no}>
              <div className="mainPostsBox">
                <img src={p.pic} alt={p.no} />
                <p>@{p.userNickname}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>인기 스타일이 없습니다.</p>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        {userNo === "1" && <Link to="/admin">관리자 페이지로 이동하기</Link>}
      </div>
    </div>
  );
}
