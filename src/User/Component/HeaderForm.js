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

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // useLocation을 추가하여 페이지 경로를 추적

  // 페이지 이동 시 드롭다운 닫기
  useEffect(() => {
    setActiveDropdown(null); // 페이지 이동 시 드롭다운과 알림 팝업 닫기
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

  const handleAlarmClick = () => {
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
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
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
      <div className={styles.leftContainer}>
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
        <FiSearch size={30} onClick={handleSearch} />
        <Modal
          isOpen={isModalOpen} // 모달을 열기 위한 조건
          onRequestClose={handleCloseModal} // 모달 바깥 클릭 시 닫히도록 설정
          // contentLabel="Search Modal"
          className={styles.modalContent} // 모달 콘텐츠에 대한 스타일 적용
          // overlayClassName={styles.modalOverlay} // 모달 오버레이에 대한 스타일 적용
        >
          <AutoSearch />
          <button onClick={handleCloseModal}>Close</button>
        </Modal>
        <Link to="/user/shop/cart">
          <IoCartOutline className={styles.icon} />
        </Link>
        {sessionStorage.getItem("id") && (
          <div className={styles.notificationWrapper}>
            <LiaBellSolid onClick={handleAlarmClick} className={styles.icon} />
            {alerts.some((alert) => !alert.isRead) && (
              <div className={styles.redDot}></div>
            )}
          </div>
        )}
        {activeDropdown === "alert" && (
          <div className={styles.alertPopupContainer}>
            <div>
              <button
                onClick={() => setSelectedCategory("전체")}
                className={styles.alertCategoryButton}
              >
                전체
              </button>
              <button
                onClick={() => setSelectedCategory("주문")}
                className={styles.alertCategoryButton}
              >
                주문
              </button>
              <button
                onClick={() => setSelectedCategory("커뮤니티")}
                className={styles.alertCategoryButton}
              >
                커뮤니티
              </button>
              <button
                onClick={() => setSelectedCategory("프로모션")}
                className={styles.alertCategoryButton}
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
                  }`} // 읽음 상태에 따라 클래스 추가
                  onClick={() => markAsRead(alert.no)}
                >
                  <div>
                    <Link to={alert.path}>
                      <i>{alert.category}</i>
                      <br />
                      {alert.content}
                      <br />
                      <i>{formatDate(alert.date)}</i>
                    </Link>
                    <span
                      onClick={() => deleteAlert(alert.no)}
                      className={styles.alertButton}
                    >
                      {" "}
                      ×
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noAlerts}>알림 내역이 없습니다.</div>
            )}

            {totalPages > 1 && (
              <div className={styles.pagination}>
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
                <button onClick={handleLogout}>로그아웃</button>
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
