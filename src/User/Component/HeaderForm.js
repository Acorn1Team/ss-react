import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import { HiBellAlert } from "react-icons/hi2";
import { CgProfile } from "react-icons/cg";
import styles from "../Style/HeaderForm.module.css";
import AutoSearch from "./AutoSearch";

function HeaderForm() {
  const [showPopup, setShowPopup] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();
  const nv = useNavigate();

  const checkFor = () => {
    const userId = sessionStorage.getItem("id");
    if (userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/user/auth/login");
    }
  };

  // 화면 이동 시 드롭다운 닫기
  useEffect(() => {
    const handleNavigation = () => {
      setShowPopup(false);
    };

    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [nv]);

  const handleProfileClick = () => {
    checkFor();
    if (isLoggedIn) {
      setShowPopup(!showPopup);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/user");
    setShowPopup(false);
    setIsLoggedIn(false);
  };

  const filteredAlerts = alerts.filter(
    (alert) =>
      selectedCategory === "전체" || alert.category === selectedCategory
  );

  const handleAlarmClick = () => {
    setShowAlertPopup(!showAlertPopup);
    setShowPopup(false);
  };

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
    fetchAlerts();
  }, [showAlertPopup, currentPage]);

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
        <Link to="/user/main">
          <img
            src={`${process.env.PUBLIC_URL}/images/side.png`}
            alt="Logo"
            className={styles.logo}
          />
        </Link>
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
      <div className={styles.rightContainer}>
        <AutoSearch />
        <Link to="/user/shop/cart">
          <FaShoppingCart className={styles.icon} />
        </Link>
        {sessionStorage.getItem("id") && (
          <div className={styles.notificationWrapper}>
            <HiBellAlert onClick={handleAlarmClick} className={styles.icon} />
            {alerts.some((alert) => !alert.isRead) && (
              <div className={styles.redDot}></div>
            )}
          </div>
        )}
        {showAlertPopup && (
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
                  <Link to={alert.path}>
                    <i>{alert.category}</i>
                    <br />
                    {alert.content}
                    <br />
                    <i>{formatDate(alert.date)}</i>
                  </Link>
                  <button
                    onClick={() => deleteAlert(alert.no)}
                    className={styles.alertButton}
                  >
                    ×
                  </button>
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
            <CgProfile className={styles.icon} onClick={handleProfileClick} />
            {showPopup && (
              <div className={styles.popupContainer}>
                <Link
                  to={`/user/mypage/update/${userNo}`}
                  onClick={() => setShowPopup(false)}
                >
                  회원정보수정
                </Link>
                <br />
                <Link
                  to="/user/mypage/scrap"
                  onClick={() => setShowPopup(false)}
                >
                  마이스크랩
                </Link>
                <br />
                <Link
                  to="/user/mypage/order"
                  onClick={() => setShowPopup(false)}
                >
                  주문내역
                </Link>
                <br />
                <Link
                  to={`/user/mypage/review`}
                  onClick={() => setShowPopup(false)}
                >
                  마이리뷰
                </Link>
                <br />
                <Link
                  to="/user/mypage/coupon"
                  onClick={() => setShowPopup(false)}
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
            <CgProfile size={"30"} />
          </span>
        )}
      </div>
    </header>
  );
}
export default HeaderForm;
