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
  const [forMainRandom, setForMainRandom] = useState({});
  const [showCount, setShowCount] = useState(0);
  const [randomStyle, setRandomStyle] = useState(null); // 추가된 상태
  const [randomCharacter, setRandomCharacter] = useState(null); // 랜덤 캐릭터 상태 추가
  const [randomItems, setRandomItems] = useState([]); // 랜덤 아이템 상태 추가

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

    axios
      .get(`/main/forRandom`)
      .then((res) => setShowCount(res.data))
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const mainLoad = () => {
    if (showCount > 0) {
      const n = Math.floor(Math.random() * showCount) + 1;

      axios
        .get(`/main/sub/${n}`)
        .then((res) => {
          setForMainRandom(res.data);

          // 랜덤 캐릭터 선택
          if (res.data.characters && res.data.characters.length > 0) {
            const randomCharacter =
              res.data.characters[
                Math.floor(Math.random() * res.data.characters.length)
              ];
            setRandomCharacter(randomCharacter);

            // 랜덤 스타일 선택
            if (res.data.styles && res.data.styles.length > 0) {
              const characterStyles = res.data.styles.filter(
                (style) => style.characterNo === randomCharacter.no
              );
              if (characterStyles.length > 0) {
                const randomStyle =
                  characterStyles[
                    Math.floor(Math.random() * characterStyles.length)
                  ];
                setRandomStyle(randomStyle);

                // 랜덤 스타일과 연관된 아이템 설정
                const relatedItems = res.data.items.filter((item) =>
                  res.data.styleItems.some(
                    (styleItem) =>
                      styleItem.styleNo === randomStyle.no &&
                      styleItem.itemNo === item.no
                  )
                );
                setRandomItems(relatedItems); // 관련된 아이템 업데이트
              }
            } else {
              setRandomStyle(null); // 스타일이 없을 경우
              setRandomItems([]); // 아이템도 비움
            }
          } else {
            setRandomCharacter(null); // 캐릭터가 없을 경우
            setRandomStyle(null);
            setRandomItems([]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    mainLoad();
  }, [showCount]);

  useEffect(() => {
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
                <h2>CHOOSE YOUR SCENE!</h2>
                <span>어떤 장면을 당신의 것으로 만들까요?</span>

                <div className="horizontal-container">
                  <Link to={`/user/main/sub/${forMainRandom?.show?.no}`}>
                    <section id="card1" className="card">
                      <img src={forMainRandom.show?.pic} alt="mainpic"></img>
                      <div className="card__content">
                        <p className="card__title">
                          {forMainRandom.show?.title || "제목 없음"}
                        </p>

                        <p className="card__description">
                          {forMainRandom.characters &&
                          forMainRandom.characters.length > 0 ? (
                            forMainRandom.characters.map((c) => (
                              <div key={c.name}>{c.name.slice(0, -2)}</div>
                            ))
                          ) : (
                            <p>캐릭터 정보가 없습니다.</p>
                          )}
                          <p>
                            <Link to="/user/main/show">
                              <button className="moreButton">
                                작품 더보기
                              </button>
                            </Link>
                          </p>
                        </p>
                      </div>
                    </section>
                  </Link>
                  <div className="random-character">
                    <img
                      className="characterPic"
                      src={randomCharacter?.pic}
                      alt="characterPic"
                    ></img>
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
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"></path>
                        <path
                          fillRule="evenodd"
                          d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div className="random-style-container">
                    이 스타일 어때요?
                    {randomStyle ? (
                      <div>
                        <img
                          src={randomStyle.pic}
                          alt={`style-${randomStyle.no}`}
                        />
                        <div className="random-style-items">
                          {randomItems.length > 0 ? (
                            randomItems.map((item) => (
                              <div key={item.no}>
                                <Link
                                  to={`/user/shop/productlist/detail/${item.productNo}`}
                                >
                                  <img src={item.pic} alt={`item-${item.no}`} />
                                </Link>
                              </div>
                            ))
                          ) : (
                            <p>아이템 정보가 없습니다.</p>
                          )}

                          <div style={{ fontSize: "80%" }}>
                            SceneStealer에서 비슷한 상품을 <br />
                            구매할 수 있어요. <br />
                            마음에 드는 상품을 클릭해 보세요!
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>스타일 정보가 없습니다.</p>
                    )}
                  </div>
                  <div></div>
                </div>

                <h3>
                  FIND THE STYLE YOU LOVE!
                  <br />
                  BUY IT IF YOU WANT OR JUST SCRAP
                </h3>
                <span>마음에 드는 스타일을 찾으셨다면, 사거나 담거나!</span>
              </div>
            </div>
          </div>
        </div>

        {currentIndex > 0 && (
          <button className="slide-button prev" onClick={handlePrev}>
            🎧
          </button>
        )}

        {currentIndex < 1 && (
          <button className="slide-button next" onClick={handleNext}>
            📻
          </button>
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
                {p.userNickname}
              </div>
            </Link>
          ))
        ) : (
          <p>인기 스타일이 없습니다.</p>
        )}
      </div>
      {userNo === "1" && <Link to="/admin">관리자</Link>}
    </div>
  );
}
