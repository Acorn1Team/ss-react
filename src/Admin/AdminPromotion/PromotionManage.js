import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PromotionManage() {
  const [coupons, setCoupons] = useState([]);
  const [popups, setPopups] = useState([]);

  // 현재 페이지
  const [currentCouponPage, setCurrentCouponPage] = useState(0);
  const [currentPopupPage, setCurrentPopupPage] = useState(0);

  // 페이지 크기
  const [couponPageSize, setCouponPageSize] = useState(8);
  const [popupPageSize, setPopupPageSize] = useState(8);

  // 전체 페이지 수
  const [totalCouponPages, setTotalCouponPages] = useState(1);
  const [totalPopupPages, setTotalPopupPages] = useState(1);

  useEffect(() => {
    axios
      .get("/admin/coupons", {params: {page: currentCouponPage,size: couponPageSize,},})
      .then((response) => {setCoupons(response.data.content); setTotalCouponPages(response.data.totalPages);})
      .catch((error) => {console.log("쿠폰 목록 조회 오류", error);});

    axios
      .get("/admin/popups")
      .then((response) => {setPopups(response.data);})
      .catch((error) => {console.log("팝업 목록 조회 오류", error);});
  }, [currentCouponPage]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalCouponPages) {
      setCurrentCouponPage(newPage);
    }
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h2>Promotion</h2>

        <div style={{ display: "flex", gap: "20px", justifyContent: "space-between" }}>
          <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: "8px", padding: "20px" }}>
            <h3>
              🩶 쿠폰 🩶<br/><br/>
              <Link to="/admin/promotion/coupon">
                <button style={{ padding: "10px", marginLeft: "10px" }}>쿠폰 발급하기</button>
              </Link>
            </h3>
            <h4>발급한 쿠폰 목록</h4>
            <table>
              <thead>
                <tr><th>쿠폰명</th><th>할인율</th><th>만료일</th></tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.no}><td>{coupon.name}</td><td>{coupon.discountRate}%</td><td>{coupon.expiryDate}까지</td></tr>
                ))}
              </tbody>
            </table>
            {totalCouponPages > 1 && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handlePageChange(currentCouponPage - 1)} disabled={currentCouponPage === 0}>이전</button>
                <span style={{ margin: "0 10px" }}>{currentCouponPage + 1} / {totalCouponPages}</span>
                <button onClick={() => handlePageChange(currentCouponPage + 1)} disabled={currentCouponPage + 1 >= totalCouponPages}>다음</button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: "8px", padding: "20px" }}>
            <h3>
            🩶 광고 🩶<br/><br/>
              <Link to="/admin/promotion/advertise">
                <button style={{ padding: "10px", marginLeft: "10px" }}>광고 알림 보내기</button>
              </Link>
            </h3>
          </div>

          <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: "8px", padding: "20px" }}>
            <h3>
            🩶 팝업 🩶<br/><br/>
              <Link to="/admin/promotion/popup">
                <button style={{ padding: "10px", marginLeft: "10px" }}>팝업 등록하기</button>
              </Link>
            </h3>
            <h4>팝업 목록</h4>
            <table>
              <thead>
                <tr><th>사진</th><th>경로</th><th>등록</th></tr>
              </thead>
              <tbody>
              {popups.map((popup) => (
                  <tr key={popup.no}>
                    <td><img style={{height:'150px'}} src={popup.pic} alt={`${popup.no} 이미지`} /></td>
                    <td>{popup.path}</td>
                    <td>{ popup.isShow ? "O" : "숨김"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
