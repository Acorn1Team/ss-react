import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Style/PromotionManage.module.css";

export default function PromotionManage() {
  const [coupons, setCoupons] = useState([]);
  const [popups, setPopups] = useState([]);

  // 현재 페이지
  const [currentCouponPage, setCurrentCouponPage] = useState(0);
  const [currentPopupPage, setCurrentPopupPage] = useState(0);

  // 페이지 크기
  const [couponPageSize, setCouponPageSize] = useState(8);
  const [popupPageSize, setPopupPageSize] = useState(3);

  // 전체 페이지 수
  const [totalCouponPages, setTotalCouponPages] = useState(1);
  const [totalPopupPages, setTotalPopupPages] = useState(1);

  const fetchCoupons = () => {
    axios
      .get("/admin/coupons", {
        params: { page: currentCouponPage, size: couponPageSize },
      })
      .then((response) => {
        setCoupons(response.data.content);
        setTotalCouponPages(response.data.totalPages);
      })
      .catch((error) => {
        console.log("쿠폰 목록 조회 오류", error);
      });
  };

  const fetchPopups = () => {
    axios
      .get("/admin/popups", {
        params: { page: currentPopupPage, size: popupPageSize },
      })
      .then((response) => {
        setPopups(response.data.content);
        setTotalPopupPages(response.data.totalPages);
      })
      .catch((error) => {
        console.log("팝업 목록 조회 오류", error);
      });
  };

  useEffect(() => {
    fetchCoupons();
    fetchPopups();
  }, [currentCouponPage, currentPopupPage]);

  // 페이지 변경 함수
  const handleCouponPageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalCouponPages) {
      setCurrentCouponPage(newPage);
    }
  };

  const handlePopupPageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPopupPages) {
      setCurrentPopupPage(newPage);
    }
  };

  const handleStatusChange = async (popupNo, status) => {
    const confirmation = window.confirm(
      `팝업 상태를 '${status}'로 변경하시겠습니까?`
    );
    if (!confirmation) return;
    const booleanStatus = status === "true";
    try {
      await axios.put(`/admin/popup/${popupNo}/status`, {
        status: booleanStatus,
      });
      fetchPopups();
    } catch (error) {
      console.error("팝업 상태를 업데이트하는 중 오류가 발생했습니다!", error);
    }
  };

  const deletePopup = async (no) => {
    try {
      await axios.delete(`/admin/popup/${no}`);
      fetchPopups();
    } catch (error) {
      console.error("팝업 삭제 중 오류 발생:", error);
    }
  };

  return (
    <>
      <h3 className={styles.header}>
        🩶 광고 🩶&nbsp;
        <Link to="/admin/promotion/advertise">
          <button className={styles.button}>광고 알림 보내기</button>
        </Link>
      </h3>
      <div className={styles.container}>
        <div className={styles.flexRow}>
          <div className={styles.card}>
            <h3>
              🩶 쿠폰 🩶&nbsp;
              <Link to="/admin/promotion/coupon">
                <button className={styles.button}>쿠폰 발급하기</button>
              </Link>
            </h3>
            <h4>발급한 쿠폰 목록</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>쿠폰명</th>
                  <th>할인율</th>
                  <th>만료일</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.no}>
                    <td>{coupon.name}</td>
                    <td>{coupon.discountRate}%</td>
                    <td>{coupon.expiryDate}까지</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalCouponPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handleCouponPageChange(currentCouponPage - 1)}
                  disabled={currentCouponPage === 0}
                >
                  이전
                </button>
                <span>
                  {currentCouponPage + 1} / {totalCouponPages}
                </span>
                <button
                  onClick={() => handleCouponPageChange(currentCouponPage + 1)}
                  disabled={currentCouponPage + 1 >= totalCouponPages}
                >
                  다음
                </button>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h3>
              🩶 팝업 🩶&nbsp;
              <Link to="/admin/promotion/popup">
                <button className={styles.button}>팝업 등록하기</button>
              </Link>
            </h3>
            <h4>팝업 목록</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>사진</th>
                  <th>경로</th>
                  <th colSpan={"2"}>관리</th>
                </tr>
              </thead>
              <tbody>
                {popups.map((popup) => (
                  <tr key={popup.no}>
                    <td>
                      <img
                        className={styles.image}
                        src={popup.pic}
                        alt={`${popup.no} 이미지`}
                      />
                    </td>
                    <td>{popup.path}</td>
                    <td>
                      <select
                        value={popup.isShow.toString()}
                        onChange={(e) =>
                          handleStatusChange(popup.no, e.target.value)
                        }
                      >
                        <option value="true">보이기</option>
                        <option value="false">숨기기</option>
                      </select>
                    </td>
                    <td>
                      <i
                        onClick={() => deletePopup(popup.no)}
                        className={styles.buttonDelete} // CSS 클래스 적용
                      >
                        삭제
                      </i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPopupPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePopupPageChange(currentPopupPage - 1)}
                  disabled={currentPopupPage === 0}
                >
                  이전
                </button>
                <span>
                  {currentPopupPage + 1} / {totalPopupPages}
                </span>
                <button
                  onClick={() => handlePopupPageChange(currentPopupPage + 1)}
                  disabled={currentPopupPage + 1 >= totalPopupPages}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
