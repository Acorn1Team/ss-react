import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LiaBellSolid } from "react-icons/lia";
import { GoPerson } from "react-icons/go";
import styles from "../Style/HeaderForm.module.css";
import AutoSearch from "./AutoSearch";
import { IoCartOutline } from "react-icons/io5";

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
        <AutoSearch />
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
        {showAlertPopup && (
          <div className={styles.alertPopupContainer}>
            <h4>알림 목록</h4>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.alertNo}
                  className={`${styles.alertItem} ${
                    alert.isRead ? styles.readAlert : ""
                  }`}
                  onClick={() => markAsRead(alert.alertNo)}
                >
                  <span>{alert.message}</span>
                  <span
                    className={styles.alertButton}
                    onClick={() => deleteAlert(alert.alertNo)}
                  >
                    삭제
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.noAlerts}>알림이 없습니다.</div>
            )}
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
              >
                이전
              </button>
              <span>
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {isLoggedIn ? (
          <>
            <GoPerson
              className={styles.icon}
              onClick={handleProfileClick}
              style={{ marginBottom: "5px", marginLeft: "-2px" }}
            />
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
            <GoPerson size={"30"} />
          </span>
        )}
      </div>
    </header>
  );
}
export default HeaderForm;
