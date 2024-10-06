import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LiaBellSolid } from "react-icons/lia";
import { GoPerson } from "react-icons/go";
import styles from "../Style/HeaderForm.module.css";
import AutoSearch from "./AutoSearch";
import { IoCartOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import Modal from "react-modal";

function HeaderForm() {
  const [activeDropdown, setActiveDropdown] = useState(null); // 드롭다운 상태 통합
  const [alerts, setAlerts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [totalPages, setTotalPages] = useState(1);
  const [alertCheckForDot, setAlertCheckForDot] = useState();

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // useLocation을 추가하여 페이지 경로를 추적

  const [isSearchOpen, setIsSearchOpen] = useState(false); // 검색창 열림/닫힘 상태
  const [searchInput, setSearchInput] = useState(""); // 검색 입력 값 상태

  // 페이지 이동 시 드롭다운 닫기
  useEffect(() => {
    setActiveDropdown(null); // 페이지 이동 시 드롭다운과 알림 팝업 닫기
    setIsModalOpen(false);
    setIsSearchOpen(false);
  }, [location]); // location이 변경될 때마다 실행

  const checkFor = () => {
    const userId = sessionStorage.getItem("id");
    if (userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/user/auth/login");
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen); // 클릭 시 검색창 상태를 토글
  };

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(); // 엔터키 입력 시 검색 실행
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 페이지 이동 또는 다른 아이콘 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleNavigation = () => {
      setActiveDropdown(null); // 페이지 이동 시 드롭다운 닫기
    };

    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [navigate]);

  const handleProfileClick = () => {
    checkFor();
    if (isLoggedIn) {
      setActiveDropdown(activeDropdown === "profile" ? null : "profile"); // 프로필 드롭다운 토글
    }
  };

  useEffect(() => {
    forAlert();
  }, []);

  const forAlert = () => {
    if (userNo) {
      axios
        .get(`/api/alert/Readcheck/${userNo}`)
        .then((res) => {
          if (res.data.result) {
            setAlertCheckForDot(true);
          } else {
            setAlertCheckForDot(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleAlarmClick = () => {
    forAlert();
    setActiveDropdown(activeDropdown === "alert" ? null : "alert"); // 알림 드롭다운 토글
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/user");
    setActiveDropdown(null);
    setIsLoggedIn(false);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category); // 카테고리 상태 업데이트
    setCurrentPage(0); // 페이지를 0으로 초기화
  };

  useEffect(() => {
    fetchAlerts(); // 카테고리나 페이지가 변경될 때마다 알림 목록을 가져옴
  }, [selectedCategory, currentPage]); // selectedCategory와 currentPage 변경 시 실행

  const fetchAlerts = async () => {
    const userNo = sessionStorage.getItem("id");
    if (userNo) {
      try {
        const response = await axios.get(`/api/alert/${userNo}`, {
          params: {
            page: currentPage,
            size: pageSize,
            category: selectedCategory, // 선택된 카테고리를 서버로 전송
          },
        });
        setAlerts(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.log(err);
        setAlerts([]);
      }
    }
  };

  useEffect(() => {
    if (activeDropdown === "alert") {
      fetchAlerts(); // 알림창 열릴 때 알림 가져오기
    }
  }, [activeDropdown, currentPage]);

  const markAsRead = async (alertNo) => {
    try {
      await axios.put(`/api/alert/${alertNo}`);
      fetchAlerts();
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date; // 현재 시간과의 차이를 밀리초로 계산
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); // 분 단위로 변환
    const diffInHours = Math.floor(diffInMinutes / 60); // 시간 단위로 변환
    const diffInDays = Math.floor(diffInHours / 24); // 일 단위로 변환

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`; // 1시간 이내면 분으로 표시
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`; // 24시간 이내면 시간으로 표시
    } else if (diffInDays < 4) {
      return `${diffInDays}일 전`; // 3일 이내면 일로 표시
    } else {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`; // 4일 이상이면 월/일로 표시
    }
  };

  const deleteAlert = async (alertNo) => {
    try {
      const response = await axios.delete(`/api/alert/${alertNo}`);
      if (response.data.result) {
        fetchAlerts();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const userNo = sessionStorage.getItem("id");

  return (
    <header className={styles.header}>
      <div className={styles.leftContainer} onClick={forAlert()}>
        <Link to="/user/main" className={styles.styledLink}>
          HOME
        </Link>
        <Link to="/user/shop/productlist" className={styles.styledLink}>
          SHOP
        </Link>
        <Link to="/user/style" className={styles.styledLink}>
          STYLE
        </Link>
      </div>
      <div className={styles.centerContainer}>
        <Link to="/user/main">
          <img src={`/images/logo-02.png`} alt="Logo" className={styles.logo} />
        </Link>
      </div>

      <div className={styles.rightContainer}>
        <div className={styles.searchContainer}>
          {/* 검색 아이콘 클릭 시 검색창이 열림 */}
          <FiSearch
            size={26}
            className={styles.searchIcon}
            onClick={handleSearchClick}
          />
          {isSearchOpen && (
            <div className={styles.searchBox}>
              <AutoSearch />
            </div>
          )}
        </div>

        <Link to="/user/shop/cart">
          <IoCartOutline className={styles.icon} />
        </Link>
        {sessionStorage.getItem("id") && (
          <div className={styles.notificationWrapper}>
            <LiaBellSolid onClick={handleAlarmClick} className={styles.icon} />
            {alertCheckForDot && <div className={styles.redDot}></div>}
          </div>
        )}
        {activeDropdown === "alert" && (
          <div className={styles.alertPopupContainer}>
            <div>
              <button
                onClick={() => handleCategoryChange("전체")}
                className={`alertCategoryButton ${
                  selectedCategory === "전체" ? "btn2Small" : "btn1Small"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => handleCategoryChange("주문")}
                className={`alertCategoryButton ${
                  selectedCategory === "주문" ? "btn2Small" : "btn1Small"
                }`}
              >
                주문
              </button>
              <button
                onClick={() => handleCategoryChange("커뮤니티")}
                className={`alertCategoryButton ${
                  selectedCategory === "커뮤니티" ? "btn2Small" : "btn1Small"
                }`}
              >
                커뮤니티
              </button>
              <button
                onClick={() => handleCategoryChange("프로모션")}
                className={`alertCategoryButton ${
                  selectedCategory === "프로모션" ? "btn2Small" : "btn1Small"
                }`}
              >
                프로모션
              </button>
            </div>

            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div
                  key={alert.no || index}
                  className={`${styles.alertItem} ${
                    alert.isRead ? styles.readAlert : styles.unreadAlert
                  }`}
                  onClick={() => markAsRead(alert.no)}
                >
                  <div>
                    <Link to={alert.path}>
                      <strong>{alert.category}</strong>&emsp;&emsp;{" "}
                      <i style={{ opacity: "80%" }}>{formatDate(alert.date)}</i>
                      <br />
                      {alert.content}&emsp;
                      <span
                        onClick={() => deleteAlert(alert.no)}
                        className={styles.alertButton}
                      >
                        ×
                      </span>
                      <br />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noAlerts}>알림 내역이 없습니다.</div>
            )}

            {totalPages > 1 && (
              <div className={styles.alertPaging}>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  이전
                </button>
                <span>
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
        {isLoggedIn ? (
          <>
            <GoPerson
              className={styles.icon}
              onClick={handleProfileClick}
              style={{ marginBottom: "5px", marginLeft: "-2px" }}
            />
            {activeDropdown === "profile" && (
              <div className={styles.popupContainer}>
                <Link
                  to={`/user/mypage/update/${userNo}`}
                  onClick={() => setActiveDropdown(null)}
                >
                  회원정보수정
                </Link>
                <br />
                <Link
                  to="/user/mypage/scrap"
                  onClick={() => setActiveDropdown(null)}
                >
                  마이스크랩
                </Link>
                <br />
                <Link
                  to="/user/mypage/order"
                  onClick={() => setActiveDropdown(null)}
                >
                  주문내역
                </Link>
                <br />
                <Link
                  to={`/user/mypage/review`}
                  onClick={() => setActiveDropdown(null)}
                >
                  마이리뷰
                </Link>
                <br />
                <Link
                  to="/user/mypage/coupon"
                  onClick={() => setActiveDropdown(null)}
                >
                  마이쿠폰
                </Link>
                <br />
                <button className="btn1Small" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            )}
          </>
        ) : (
          <span onClick={() => checkFor()}>
            <GoPerson className={styles.icon} size={"30"} />
          </span>
        )}
      </div>
    </header>
  );
}
export default HeaderForm;
