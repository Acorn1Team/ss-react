import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Style/PromotionManage.module.css";
import Modal from "react-modal";

export default function PromotionMain() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [popups, setPopups] = useState([]);

  const [hideExpired, setHideExpired] = useState(false); // 만료된 쿠폰 숨기기 상태 추가

  // 현재 페이지
  const [currentCouponPage, setCurrentCouponPage] = useState(0);
  const [currentPopupPage, setCurrentPopupPage] = useState(0);

  // 페이지 크기
  const [couponPageSize, setCouponPageSize] = useState(8);
  const [popupPageSize, setPopupPageSize] = useState(3);

  // 전체 페이지 수
  const [totalCouponPages, setTotalCouponPages] = useState(1);
  const [totalPopupPages, setTotalPopupPages] = useState(1);

  // 팝업 삭제 및 상태 변경 모달 관련
  const [popupToDelete, setPopupToDelete] = useState(null);
  const [isDeletePopupModal, setIsDeletePopupModalOpen] = useState(false);
  const [popupToChange, setPopupToChange] = useState(null);
  const [isChangeStatusModal, setIsChangeStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(null);

  const fetchCoupons = () => {
    axios
      .get("/api/admin/coupons", {
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
      .get("/api/admin/popups", {
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

  const openChangeStatusModal = (popup, status) => {
    setPopupToChange(popup);
    setNewStatus(status);
    setIsChangeStatusModalOpen(true);
  };

  const handleStatusChange = async () => {
    const booleanStatus = newStatus === "true";
    try {
      await axios.put(`/admin/popup/${popupToChange.no}/status`, {
        status: booleanStatus,
      });
      fetchPopups();
      setIsChangeStatusModalOpen(false);
    } catch (error) {
      console.error("팝업 상태를 업데이트하는 중 오류가 발생했습니다!", error);
    }
  };

  const openDeletePopupModal = (popupData) => {
    setPopupToDelete(popupData);
    setIsDeletePopupModalOpen(true);
  };

  const deletePopup = async (no) => {
    try {
      await axios.delete(`/admin/popup/${no}`);
      fetchPopups();
      setIsDeletePopupModalOpen(false);
    } catch (error) {
      console.error("팝업 삭제 중 오류 발생:", error);
    }
  };

  // 만료된 쿠폰을 필터링하는 함수 (만료기간이 없는 쿠폰은 제외하지 않음)
  const filterCoupons = (coupons) => {
    if (hideExpired) {
      const today = new Date().setHours(0, 0, 0, 0);
      return coupons.filter((coupon) => {
        if (!coupon.expiryDate) return true; // 만료기간이 없으면 제외하지 않음
        const expiryDate = new Date(coupon.expiryDate).setHours(0, 0, 0, 0);
        return expiryDate >= today; // 만료되지 않은 쿠폰만 표시
      });
    }
    return coupons;
  };

  // 만료된 쿠폰 숨기기 체크박스 상태 변경 함수
  const handleHideExpiredChange = (e) => {
    setHideExpired(e.target.checked);
  };

  return (
    <>
      <div id="admin-body">
        <div className={styles.container}>
          <div className={styles.card}>
            <div style={{ textAlign: "center" }}>
              <h3>🩶 쿠폰 🩶</h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  className="search-button"
                  onClick={() => {
                    navigate("/admin/promotion/coupon");
                  }}
                >
                  쿠폰 발급하기
                </button>
                {/* 만료된 쿠폰 제외 체크박스 추가 */}
                <label style={{ marginLeft: "10px" }}>
                  <input
                    type="checkbox"
                    checked={hideExpired}
                    onChange={handleHideExpiredChange}
                  />
                  만료된 쿠폰 제외
                </label>
              </div>
              <h4>발급한 쿠폰 목록</h4>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>쿠폰명</th>
                  <th>할인율</th>
                  <th>만료일</th>
                </tr>
              </thead>
              <tbody>
                {filterCoupons(coupons).map((coupon) => (
                  <tr key={coupon.no}>
                    <td>{coupon.name}</td>
                    <td>{coupon.discountRate}%</td>
                    <td>
                      {coupon.expiryDate ? `${coupon.expiryDate}까지` : "없음"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalCouponPages > 1 && (
              <div id="pagination">
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

          {/* 팝업 관리 */}
          <div className={styles.card}>
            <div style={{ textAlign: "center" }}>
              <h3>🩶 광고 🩶</h3>
              <button
                className="search-button"
                onClick={() => {
                  navigate("/admin/promotion/advertise");
                }}
              >
                광고 알림 보내기
              </button>
              <button
                className="search-button"
                onClick={() => navigate("/admin/promotion/popup")}
              >
                팝업 등록하기
              </button>
              <h4>팝업 목록</h4>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>내용 (클릭 시 설정 경로 이동)</th>
                  <th>상태 변경</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {popups.map((popup) => (
                  <tr key={popup.no}>
                    <td>
                      <img
                        onClick={() => navigate(`${popup.path}`)}
                        className={styles.image}
                        style={{
                          cursor: "pointer",
                          maxHeight: "120px",
                          maxWidth: "120px",
                        }}
                        src={popup.pic}
                        alt={`${popup.no} 이미지`}
                      />
                    </td>
                    <td>
                      <select
                        value={popup.isShow.toString()}
                        onChange={(e) =>
                          openChangeStatusModal(popup, e.target.value)
                        }
                      >
                        <option value="true">보이기</option>
                        <option value="false">숨기기</option>
                      </select>
                    </td>
                    <td>
                      <i
                        onClick={() => openDeletePopupModal(popup)}
                        className="delete-button"
                      >
                        삭제
                      </i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPopupPages > 1 && (
              <div id="pagination">
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

      {/* 모달들 */}
      <Modal
        isOpen={isDeletePopupModal}
        onRequestClose={() => setIsDeletePopupModalOpen(false)}
        contentLabel="팝업 삭제 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "400px",
            height: "300px",
            margin: "auto",
          },
        }}
      >
        {popupToDelete && (
          <>
            <h3>해당 팝업을 삭제할까요?</h3>
            <br />
            <img
              src={popupToDelete.pic}
              alt={`${popupToDelete.no} 이미지`}
              style={{ maxWidth: "70%", maxHeight: "30%" }}
            />
            <br />
            <br />
            <button
              className="delete-button"
              onClick={() => deletePopup(popupToDelete.no)}
            >
              삭제
            </button>
            <button
              className="cancel-button"
              onClick={() => setIsDeletePopupModalOpen(false)}
            >
              취소
            </button>
          </>
        )}
      </Modal>

      <Modal
        isOpen={isChangeStatusModal}
        onRequestClose={() => setIsChangeStatusModalOpen(false)}
        contentLabel="팝업 상태 변경 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "400px",
            height: "300px",
            margin: "auto",
          },
        }}
      >
        {popupToChange && (
          <>
            <h3>
              팝업 상태를 "{newStatus === "true" ? "보이기" : "숨기기"}"로
              변경할까요?
            </h3>
            <br />
            <img
              src={popupToChange.pic}
              alt={`${popupToChange.no} 이미지`}
              style={{ maxWidth: "70%", maxHeight: "30%" }}
            />
            <br />
            <br />
            <button
              className="cancel-button"
              onClick={() => setIsChangeStatusModalOpen(false)}
            >
              취소
            </button>
            <button className="confirm-button" onClick={handleStatusChange}>
              변경
            </button>
          </>
        )}
      </Modal>
    </>
  );
}
