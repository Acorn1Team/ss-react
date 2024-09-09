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

  const [reviewedProducts, setReviewedProducts] = useState([]); // 이미 리뷰를 작성한 상품 목록
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
 // 각 상품에 대해 리뷰 작성 여부 확인
 res.data.order.productList.forEach((product) => {
  axios
    .get(`/review/check/${userNo}/${product.no}`)
    .then((response) => {
      if (response.data) {
        setReviewedProducts((prevReviewedProducts) => [
          ...prevReviewedProducts,
          product.no,
        ]);
      }
    })
    .catch((err) => {
      console.log("리뷰 체크 오류:", err);
    });
});
})
.catch((err) => {
console.log(err);
});
};

  useEffect(() => {
    getOrderList();
  }, [orderNo]);

  const goToReviewPage = (orderProductNo, productName) => { // 리뷰 갈 때 주문상품번호를 가져감
    // 리뷰 데이터를 서버로 전송
    navigate(`/user/mypage/review/write/${orderProductNo}`, {
      state: { orderNo: orderNo, userNo: userNo, productName : productName },
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

        const hasReviewed = reviewedProducts.includes(pl.no); // 해당 상품에 리뷰가 있는지 확인

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
              onClick={() => orderProduct && goToReviewPage(orderProduct.no, pl.name)}
             disabled={
                  orderInfo.state === "주문취소" || orderInfo.state === "주문접수" || hasReviewed
                } // 주문 취소 또는 접수이거나 이미 리뷰를 작성한 경우 버튼 비활성화
              >
                {hasReviewed ? "리뷰 작성 완료" : "리뷰 쓰기"}
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
