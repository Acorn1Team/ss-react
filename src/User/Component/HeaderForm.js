import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LiaBellSolid } from "react-icons/lia";
import { GoPerson } from "react-icons/go";
import styles from "../Style/HeaderForm.module.css";
import AutoSearch from "./AutoSearch";
import "../Style/All.css";
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
  const [filteredItems, setFilteredItems] = useState([]); // AutoSearch의 결과
  const navigate = useNavigate();
  const location = useLocation(); // useLocation을 추가하여 페이지 경로를 추적

  // 페이지 이동 시 드롭다운 닫기
  useEffect(() => {
    setActiveDropdown(null); // 페이지 이동 시 드롭다운과 알림 팝업 닫기
  }, [location]); // location이 변경될 때마다 실행

  const checkFor = async () => {
    const userId = sessionStorage.getItem("id");
    if (userId) {
      setIsLoggedIn(true);
      // 알림 데이터 로드
      try {
        const response = await axios.get(`/notifications/${userId}`);
        setAlerts(response.data);
        // 알림이 있으면 빨간 점 표시
        setAlertCheckForDot(response.data.length > 0);
      } catch (error) {
        console.error("알림 데이터 로드 오류:", error);
      }
    } else {
      setIsLoggedIn(false);
      navigate("/user/auth/login");
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

  useEffect(() => {
    checkFor(); // 컴포넌트가 처음 렌더링될 때 알림 데이터 확인
  }, []);

  const forAlert = () => {
    axios
      .get(`/alert/Readcheck/${userNo}`)
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

  const filteredAlerts = alerts.filter(
    (alert) =>
      selectedCategory === "전체" || alert.category === selectedCategory
  );

  const fetchAlerts = async () => {
    const userNo = sessionStorage.getItem("id");
    if (userNo) {
      try {
        const response = await axios.get(`/alert/${userNo}`, {
          params: { page: currentPage, size: pageSize },
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
      await axios.put(`/alert/${alertNo}`);
      fetchAlerts();
    } catch (err) {
      console.log(err);
    }
    checkFor();
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
      const response = await axios.delete(`/alert/${alertNo}`);
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
        {" "}
        <FiSearch size={25} className={styles.icon} onClick={handleSearch} />
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          className={styles.modalContent} // 모달 콘텐츠 스타일
          overlayClassName={styles.modalOverlay} // 오버레이 배경 스타일
        >
          <div>
            <h2>당신에게 어울리는 스타일, 배우와 작품에서 발견하세요</h2>
            <AutoSearch
              setFilteredItems={setFilteredItems}
              onSearch={handleCloseModal}
            />
            <button onClick={handleCloseModal} className={styles.closeButton}>
              X
            </button>
          </div>
        </Modal>
        <Link to="/user/shop/cart">
          <IoCartOutline className={styles.icon} />
        </Link>
        {sessionStorage.getItem("id") && (
          <div className={styles.notificationWrapper}>
            <LiaBellSolid onClick={handleAlarmClick} className={styles.icon} />
            {alertCheckForDot && <span className={styles.redDot}></span>}
          </div>
        )}
        {activeDropdown === "alert" && (
          <div className={styles.alertPopupContainer}>
            <div>
              <button
                onClick={() => setSelectedCategory("전체")}
                className="btn1Small"
              >
                전체
              </button>
              <button
                onClick={() => setSelectedCategory("주문")}
                className="btn1Small"
              >
                주문
              </button>
              <button
                onClick={() => setSelectedCategory("커뮤니티")}
                className="btn1Small"
              >
                커뮤니티
              </button>
              <button
                onClick={() => setSelectedCategory("프로모션")}
                className="btn1Small"
              >
                프로모션
              </button>
            </div>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
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
              <div id={styles.pagination}>
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
                <button className="btn2Small" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            )}
          </>
        ) : (
          <span onClick={() => checkFor()}>
            <GoPerson size={"30"} />
          </span>
        )}
      </div>
    </header>
  );
}
export default HeaderForm;
