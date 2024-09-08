import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "../Style/MyOrderDetail.module.css";

export default function MyOrderDetail() {
  const { orderNo } = useParams();
  const navigate = useNavigate(); // useNavigate 훅 사용

  const [orderInfo, setOrderInfo] = useState({});
  const [userInfo, setUserInfo] = useState({});

  const [productList, setProductList] = useState([]);
  const [orderProductList, setOrderProductList] = useState([]);

  // 로그인 정보라고 가정
  //const userNo = 31;
  const userNo = sessionStorage.getItem("id");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };


  const getOrderList = () => {
    axios
      .get(`/order/orderdetail/${orderNo}`, {
        params: {
          userNo: userNo,
        },
      })
      .then((res) => {
        setOrderInfo(res.data.order.orderInfo);
        setProductList(res.data.order.productList);
        setOrderProductList(res.data.order.orderProductList);
        setUserInfo(res.data.user);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getOrderList();
  }, [orderNo]);

  const goToReviewPage = (orderProductNo) => { // 리뷰 갈 때 주문상품번호를 가져감
    // 리뷰 데이터를 서버로 전송
    navigate(`/user/mypage/review/write/${orderProductNo}`, {
      state: { orderNo: orderNo, userNo: userNo },
    });
  };

 

  return (
    <div className={styles.container}>
      <div className={styles.orderInfo}>
        {/* <span>주문 번호:</span> {orderInfo.no} */}
        <br />
        {/* <span>주문 상태:</span> {orderInfo.state} */}
        <span>주문 상세 페이지</span>
        <br />
        <span>주문 날짜:</span> {formatDate(orderInfo.date)}
        <br />
        <span>총 금액:</span> {orderInfo.price?.toLocaleString()}원
       
      </div>

      <div className={styles.productList}>
      {productList.map((pl) => {
        const orderProduct = orderProductList.find((op) => op.productNo === pl.no);

        return (
          <div key={pl.no} className={styles.productItem}>
            <Link to={`/user/shop/productlist/detail/${pl.no}`}>
            <div>
              <span className={styles.productName}>{pl.name}</span>
              <br />
              <span className={styles.productQuantity}>
                {orderProduct?.quantity}개
              </span>
            </div>
            </Link>
            {/* <span className={styles.productPrice}>
            {(pl.price * (orderProduct?.quantity || 1)).toLocaleString()}원
            </span> */}
            <sapn className={styles.productPrice}>{orderProduct?.price}원</sapn>
            <button
              className={styles.reviewButton}
              onClick={() => orderProduct && goToReviewPage(orderProduct.no)}
              disabled={orderInfo.state === "주문취소"} // 주문 상태가 '주문취소'이면 비활성화
            >
            리뷰 쓰기
            </button>
          </div>
        );
      })}
      </div>

      <div className={styles.userInfo}>
        <h3>주문자 정보</h3>
        <p>
          <span>이름:</span> {userInfo.name}
        </p>
        <p>
          <span>주소:</span> {userInfo.zipcode} {userInfo.address}
        </p>
        <p>
          <span>전화번호:</span> {userInfo.tel}
        </p>
      </div>
    </div>
  );
}
