import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Style/MyOrder.module.css";

export default function MyOrder() {

  const navigate = useNavigate(); // useNavigate 사용 선언
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

   // 주문 상태 변경 함수 (주문 취소 처리)
   const orderStateChange = () => {
    if (selectedOrder && selectedOrder.state === "주문접수") {
      // 주문 취소 요청 (DELETE)
      axios
        .delete(`/cancel/${selectedOrder.no}`)
        .then((res) => {
          if (res.data.success) {
            // 성공적으로 취소된 경우 주문 상태 업데이트
            setOrderList((prevOrderList) =>
              prevOrderList.map((order) =>
                order.no === selectedOrder.no
                  ? { ...order, state: "주문취소" }
                  : order
              )
            );
          }
        })
        .catch((err) => {
          console.log("주문 취소 중 오류 발생:", err);
        });
    }
  };

  // 팝업 닫기 함수
  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

   // 팝업에서 확인 버튼을 클릭했을 때 실행되는 함수
   const handlePopupConfirm = () => {
    if (popupMessage === "교환/환불을 신청하시겠습니까?") {
      navigate("/user/chat"); // 교환/환불일 때 /user/chat으로 이동
    } else if (popupMessage === "주문을 취소하시겠습니까?") {
      orderStateChange(); // 주문 취소 처리
    }
    handlePopupClose(); // 팝업 닫기
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
                disabled={ol.state === "주문취소"} // 취소된 주문은 비활성화
              >
                {ol.state === "주문취소" ? "취소됨" : "주문 취소하기"}
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
              <button onClick={handlePopupConfirm}>확인</button> {/* 팝업 확인 버튼 하나로 통합 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}