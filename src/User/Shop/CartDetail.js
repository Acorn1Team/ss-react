import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../Style/CartDetail.module.css";
//import "../Style/All.css";

export default function CartDetail() {
  const orderItems = useSelector((state) => state.order.orderItems); // Redux에서 주문 항목 가져오기
  const orderTotal = useSelector((state) => state.order.orderTotal); // Redux에서 총 가격 가져오기

  const nv = useNavigate();
  const [coupons, setCoupons] = useState([]); // 쿠폰 데이터 상태
  const [selectedCoupon, setSelectedCoupon] = useState(null); // 선택된 쿠폰 상태
  const [user, setUser] = useState(null); // 유저 정보 상태
  const dispatch = useDispatch();

  const userNo = sessionStorage.getItem("id");

  // 유저 정보 받기
  useEffect(() => {
    axios
      .get(`/posts/user/${userNo}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("유저 정보를 불러오는 데 실패했습니다.", error);
      });
  }, [userNo]);

  // 쿠폰 정보 받기
  useEffect(() => {
    getCouponData(); // 쿠폰 목록 가져오는 함수 호출
  }, [userNo]);

  // 쿠폰데이터
  const getCouponData = () => {
    axios
      .get(`/coupon/order/${userNo}`)
      .then((response) => {
        const couponData = response.data;
        // 사용되지 않은 쿠폰만 필터링
        const unusedCoupons = couponData.filter(
          (c) => !c.couponUser.isUsed // isUsed가 false인 쿠폰만 필터링
        );
        setCoupons(unusedCoupons); // 사용되지 않은 쿠폰만 상태로 설정
      })
      .catch((error) => {
        console.error("쿠폰 데이터를 불러오는 데 실패했습니다.", error);
      });
  };

  const orderProc = () => {
    axios
      .post(`/order`, {
        userNo: userNo, // 유저 번호
        totalAmount: discountedPrice, // 할인 적용된 총 금액
        couponNo: selectedCoupon ? selectedCoupon.coupon.no : 0,
        items: orderItems.map((item) => ({
          productNo: item.productNo,
          quantity: item.quantity,
          resultPrice: item.resultPrice,
        })),
      })
      .then((res) => {
        if (res.data.success) {
          dispatch({
            type: "CLEAR_ORDER",
          });

          // 장바구니 비우기
          dispatch({
            type: "CLEAR_CART",
            payload: { userNo }, // userNo를 포함시킵니다.
          });

          // 선택한 쿠폰을 사용 후 쿠폰 목록에서 제거
          if (selectedCoupon) {
            setCoupons((prevCoupons) =>
              prevCoupons.filter(
                (coupon) => coupon.coupon.no !== selectedCoupon.coupon.no
              )
            );
            setSelectedCoupon(null); // 쿠폰 선택 초기화
          }

          // 쿠폰 목록 다시 불러오기 (서버에서 사용된 쿠폰을 업데이트한 경우)
          getCouponData();

          nv(`../../mypage/order`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 할인된 가격 계산
  const discountedPrice = selectedCoupon
    ? orderTotal - (orderTotal * selectedCoupon.coupon.discountRate) / 100
    : orderTotal;

  return (
    <div className={styles.orderContainer}>
      <h1 style={{ textAlign: "center" }}>주문 확인</h1>
      <h2 className={styles.orderTitle}>배송지</h2>
      {user && (
        <div className={styles.userInfo}>
          <p>
            <strong>{user.name}</strong>
          </p>
          <p>{user.tel}</p>
          <p>{user.address}</p>
        </div>
      )}
      <h2 className={styles.orderTitle}>주문상품</h2>
      <div className={styles.orderItems}>
        {orderItems.map((item) => (
          <div key={item.productNo} className={styles.orderItem}>
            <p>{item.name}</p>
            <div className={styles.quantityWrapper}>
              <span className={styles.quantityLabel}>수량</span>
              &nbsp;&nbsp;<p>{item.quantity} 개</p>
            </div>
            <p className={styles.orderItemPrice}>
              {item.resultPrice.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>
      <h2 className={styles.orderTitle}>쿠폰</h2>
      <div className={styles.couponSection}>
        <select
          id="coupon"
          onChange={(e) => {
            const selected = coupons.find(
              (coupon) => coupon.coupon.no === parseInt(e.target.value)
            );
            setSelectedCoupon(selected);
          }}
        >
          <option value="">사용하실 쿠폰을 선택하세요</option>
          {/* 사용되지 않은 쿠폰만 렌더링 */}
          {coupons.length > 0 ? (
            coupons.map((c) => (
              <option key={c.coupon.no} value={c.coupon.no}>
                {c.coupon.name} - {c.coupon.discountRate}% 할인
              </option>
            ))
          ) : (
            <option disabled>사용 가능한 쿠폰이 없습니다.</option>
          )}
        </select>
      </div>
      <h2 className={styles.orderTitle}>결제 상세</h2>
      <div className={styles.totalPrice}>
        {selectedCoupon ? (
          <>
            <h3>쿠폰 적용 전 : {orderTotal.toLocaleString()}원</h3>
            <h3>
              쿠폰 할인 금액 : -{(orderTotal - discountedPrice).toLocaleString()}원
            </h3>
            <h3>최종 결제 금액 : {discountedPrice.toLocaleString()}원</h3>
          </>
        ) : (
            <h3>최종 결제 금액 : {orderTotal.toLocaleString()}원</h3>
        )}
      </div>
      <button
        className={`btn2Long ${styles.payButton}`}
        onClick={() => orderProc()}
      >
        결제하기
      </button>
    </div>
  );
}
