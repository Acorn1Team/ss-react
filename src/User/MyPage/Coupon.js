import axios from "axios";
import { useEffect, useState } from "react";
import styles from "../Style/Coupon.module.css";

export default function Coupon() {
  const [couponData, setCouponData] = useState([]);

  // 현재 페이지를 저장할 상태
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기를 저장할 상태
  const [pageSize, setPageSize] = useState(10);

  // 전체 페이지 수를 저장할 상태
  const [totalPages, setTotalPages] = useState(1);

  // 로그인 정보라고 가정
  const userNo = sessionStorage.getItem("id");

  useEffect(() => {
    getCouponData();
  }, [userNo]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      getCouponData(); // 이 자리에 axios로 데이터를 불러오는 함수를 입력해 줍니다.
    }
  };

  const getCouponData = () => {
    axios
      .get(`/coupon/${userNo}`, {
        // 사용하지 않은 쿠폰만 불러옴!!
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setCouponData(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className={styles.container}>
      {couponData.map((cd) => (
        <div className={styles.couponItem} key={cd.id}>
          <div className={styles.couponName}>{cd.name}</div>
          <div className={styles.couponDiscount}>{cd.discountRate}% 할인</div>
          <div className={styles.couponExpiry}>~{cd.expiryDate}</div>
        </div>
      ))}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </button>
          <span>
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
  );
}
