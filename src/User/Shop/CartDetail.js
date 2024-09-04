import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../Style/CartDetail.module.css";

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
    axios
      .get(`/coupon/order/${userNo}`)
      .then((response) => {
        setCoupons(response.data);
      })
      .catch((error) => {
        console.error("쿠폰 데이터를 불러오는 데 실패했습니다.", error);
      });
  }, [userNo]);

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
          });
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
      <h2 className={styles.orderTitle}>주문 상세 페이지</h2>

      {user && (
        <div className={styles.userInfo}>
          <h3>유저 정보</h3>
          <p>이름: {user.name}</p>
          <p>이메일: {user.email}</p>
          <p>주소: {user.address}</p>
        </div>
      )}

      <div className={styles.orderItems}>
        {orderItems.map((item) => (
          <div key={item.productNo} className={styles.orderItem}>
            <p>상품: {item.name}</p>
            <p>수량: {item.quantity}</p>
            <p>최종 가격: {item.resultPrice.toLocaleString()}원</p>
          </div>
        ))}
      </div>

      <div className={styles.couponSection}>
        <label htmlFor="coupon">쿠폰 선택: </label>
        <select
          id="coupon"
          onChange={(e) => {
            const selected = coupons.find(
              (coupon) => coupon.coupon.no === parseInt(e.target.value)
            );
            setSelectedCoupon(selected);
          }}
        >
          <option value="">쿠폰을 선택하세요</option>
          {coupons.map((c) => (
            <option key={c.coupon.no} value={c.coupon.no}>
              {c.coupon.name} - {c.coupon.discountRate}% 할인
            </option>
          ))}
        </select>
      </div>

      <div className={styles.totalPrice}>
        <h3>총 가격: {orderTotal.toLocaleString()}원</h3>
        {selectedCoupon && (
          <h3>할인된 가격: {discountedPrice.toLocaleString()}원</h3>
        )}
      </div>
      <button className={styles.payButton} onClick={() => orderProc()}>
        결제하기
      </button>
    </div>
  );
}
