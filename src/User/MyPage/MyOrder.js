import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Style/MyOrder.module.css";

export default function MyOrder() {
  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(5);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  const [orderList, setOrderList] = useState([]);
  const [productList, setProductList] = useState([]);

  // 팝업 상태 관리
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 로그인 정보라고 가정함
  const userNo = sessionStorage.getItem("id");

  const getOrderList = () => {
    axios
      .get(`/order/orderlist/${userNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setOrderList(res.data.orderList);
        setProductList(res.data.productList);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    getOrderList();
  }, [userNo, currentPage]);

  // 팝업 열기 함수
  const handlePopupOpen = (order, message) => {
    setPopupMessage(message);
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const orderStateChange = () => {};

  // 팝업 닫기 함수
  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

  return (
    <div className={styles.container}>
      <h2>주문 내역</h2>
      {orderList.map((ol) => (
        <div key={ol.no} className={styles.orderItem}>
          <div className={styles.orderHeader}>
            {ol.no} ) &emsp;{formatDate(ol.date)} 주문
          </div>

          <div className={styles.orderDetails}>
            <Link
              to={`/user/mypage/order/${ol.no}`}
              className={styles.orderProductLink}
            >
              {productList.find((pl) => pl.no === ol.productNoList[0])?.name}
              {ol.productNoList.length > 1 && (
                <span> 외 {ol.productNoList.length - 1}건</span>
              )}
              &emsp;&emsp;
              <span className={styles.orderPrice}>
                {ol.price.toLocaleString()}원
              </span>
            </Link>
            <span className={styles.orderState}>{ol.state}</span>
            {/* 상태에 따른 버튼 표시 */}
            {ol.state === "주문접수" && (
              <button
                onClick={() => handlePopupOpen(ol, "주문을 취소하시겠습니까?")}
              >
                주문 취소하기
              </button>
            )}
            {["배송중", "배송완료"].includes(ol.state) && (
              <button
                onClick={() =>
                  handlePopupOpen(ol, "교환/환불을 신청하시겠습니까?")
                }
              >
                교환/환불하기
              </button>
            )}
          </div>

          <hr />
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

      {/* 팝업 */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>{popupMessage}</h3>
            <div className={styles.popupButtons}>
              <button onClick={handlePopupClose}>취소</button>
              <button
                onClick={() => {
                  orderStateChange();
                  console.log(`${popupMessage} 처리 중...`);
                  handlePopupClose();
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
