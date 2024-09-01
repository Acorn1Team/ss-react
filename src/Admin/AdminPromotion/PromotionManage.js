import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PromotionManage() {
  const [coupons, setCoupons] = useState([]);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(10);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios
      .get("/admin/coupons", {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((response) => {
        setCoupons(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.log("쿠폰 목록 조회 오류", error);
      });
  }, [currentPage]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
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
            {totalPages > 1 && (
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  이전
                </button>
                <span style={{ margin: "0 10px" }}>
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  다음
                </button>
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
          </div>
        </div>
      </div>
    </>
  );
}
