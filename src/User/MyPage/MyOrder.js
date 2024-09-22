import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Style/MyOrder.module.css";

export default function MyOrder() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [orderList, setOrderList] = useState([]);
  const [productList, setProductList] = useState([]);

  // 팝업 상태 관리
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 로그인 정보
  const userNo = sessionStorage.getItem("id");

  const getOrderList = () => {
    axios
      .get(`/order/orderlist/${userNo}`, {
        params: {
          page: currentPage,
          size: pageSize,
          sort: "no,desc",
        },
      })
      .then((res) => {
        console.log("주문 목록 응답:", res.data);
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
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (currentPage >= 0 && userNo) {
      getOrderList();
    }
  }, [userNo, currentPage]);

  // 팝업 열기 함수
  const handlePopupOpen = (order, message) => {
    setPopupMessage(message);
    setSelectedOrder(order);
    setShowPopup(true);
  };

  // 주문 취소 시 쿠폰 재사용
  const getCouponData = () => {
    axios
      .get(`/coupon/${userNo}`)
      .then((response) => {
        console.log("쿠폰 데이터 갱신:", response.data);
      })
      .catch((err) => {
        console.log("쿠폰 데이터를 불러오는 중 오류 발생:", err);
      });
  };

  // 주문 상태 변경 함수 (주문 취소 처리)
  const orderStateChange = () => {
    if (selectedOrder && selectedOrder.state === "주문접수") {
      axios
        .delete(`/cancel/${selectedOrder.no}`)
        .then((res) => {
          console.log("주문 취소 응답:", res.data);
          // 서버 응답이 문자열이므로 이에 따라 처리
          if (res.data === "주문이 성공적으로 취소되었습니다.") {
            // 주문 목록을 다시 가져와서 상태 업데이트
            getOrderList();
            getCouponData(); // 쿠폰 재사용
          } else {
            console.log("주문 취소 실패:", res.data);
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
    if (popupMessage === "교환/환불 신청을 위해 채팅 문의로 이동할까요?") {
      navigate("/user/chat");
    } else if (popupMessage === "주문을 취소하시겠습니까?") {
      orderStateChange();
    }
    handlePopupClose();
  };

  return (
    <div className={styles.container}>
      <h2>주문 내역</h2>
      <br />
      {orderList.length === 0 ? (
        <h2>주문하신 내역이 존재하지 않습니다.</h2>
      ) : (
        <>
          {orderList.map((ol) => (
            <div key={ol.no} className={styles.orderItem}>
              <div className={styles.orderHeader}>
                <span
                  style={{
                    color:
                      ol.state === "주문접수"
                        ? "black"
                        : ol.state === "배송중"
                        ? "black"
                        : ol.state === "배송완료"
                        ? "#f44336"
                        : ol.state === "주문취소"
                        ? "gray"
                        : "black",
                  }}
                >
                  {ol.state}
                </span>

                <strong>{ol.price.toLocaleString()}원</strong>
                <span className={styles.orderState}>{formatDate(ol.date)}</span>
                <Link
                  to={`/user/mypage/order/${ol.no}`}
                  className={styles.orderProductLink}
                >
                  상세보기
                </Link>
              </div>
              <hr />
              <div className={styles.orderDetails}>
                <span>
                  {
                    productList.find((pl) => pl.no === ol.productNoList[0])
                      ?.name
                  }
                  {ol.productNoList.length > 1 && (
                    <> 외 {ol.productNoList.length - 1}건</>
                  )}
                </span>
                <span>
                  {ol.state === "주문접수" && (
                    <button
                      onClick={() =>
                        handlePopupOpen(ol, "주문을 취소하시겠습니까?")
                      }
                    >
                      주문 취소하기
                    </button>
                  )}
                  {ol.state === "주문취소" && (
                    <span style={{ color: "gray" }}>
                      주문이 취소되었습니다.
                    </span>
                  )}
                  {["배송중", "배송완료"].includes(ol.state) && (
                    <button
                      onClick={() =>
                        handlePopupOpen(
                          ol,
                          "교환/환불 신청을 위해 채팅 문의로 이동할까요?"
                        )
                      }
                    >
                      교환/환불하기
                    </button>
                  )}
                </span>
              </div>
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
        </>
      )}
      {/* 팝업 */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>{popupMessage}</h3>
            <div className={styles.popupButtons}>
              <button className="btn1" onClick={handlePopupConfirm}>
                확인
              </button>
              <button className="btn3" onClick={handlePopupClose}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
