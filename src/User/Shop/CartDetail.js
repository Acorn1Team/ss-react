import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from 'axios';

export default function CartDetail() {
  const { orderNo } = useParams(); // 경로에서 orderNo를 받아옴
  const orderItems = orderNo.split(','); // 콤마로 구분된 orderNo를 배열로 분할
  const cartItems = useSelector((state) => state.cart.cartItems); // Redux 스토어에서 장바구니 항목 가져오기

  const [coupons, setCoupons] = useState([]); // 쿠폰 데이터 상태
  const [selectedCoupon, setSelectedCoupon] = useState(null); // 선택된 쿠폰 상태

  // 쿠폰 정보 받기
  useEffect(() => {
    axios.get('/coupon')
      .then((response) => {
        setCoupons(response.data);
      })
      .catch((error) => {
        console.error('쿠폰 데이터를 불러오는 데 실패했습니다.', error);
      });
  }, []);

  // 선택된 제품들에 대한 정보를 가져오기
  const selectedItems = cartItems.filter((item) =>
    orderItems.includes(item.product.no.toString())
  );

  // 총 가격 계산 (할인 전)
  const totalPrice = selectedItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // 할인된 가격 계산
  const discountedPrice = selectedCoupon
    ? totalPrice - (totalPrice * selectedCoupon.discount_rate / 100)
    : totalPrice;

  return (
    <div>
      <h2>주문 상세 페이지</h2>
      <p>주문 번호: {orderNo}</p>
      <div>
        {selectedItems.map((item) => (
          <div key={item.product.no}>
            <p>{item.product.name}</p> {/* 제품명 */}
            <p>수량: {item.quantity}</p> {/* 수량 */}
            <p>{item.product.price * item.quantity}원</p>&nbsp;&nbsp; {/* 상품 가격 * 수량 계산 후 표시 */}
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="coupon">쿠폰 선택: </label>
        <select
          id="coupon"
          onChange={(e) =>
            setSelectedCoupon(coupons.find(coupon => coupon.no === parseInt(e.target.value)))
          }
        >
          <option value="">쿠폰을 선택하세요</option>
          {coupons.map((coupon) => (
            <option key={coupon.no} value={coupon.no}>
              {coupon.name} - {coupon.discount_rate}% 할인
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>총 가격: {totalPrice}원</h3> {/* 원래 총 가격 */}
        {selectedCoupon && (
          <h3>할인된 가격: {discountedPrice}원</h3> 
        )};
      </div>
      {/* 추가적인 주문 처리 로직을 여기에 구현 */}
    </div>
  );
}
