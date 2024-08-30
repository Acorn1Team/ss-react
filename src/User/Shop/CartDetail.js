import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CartDetail() {
  const { orderNo } = useParams(); // 경로에서 orderNo를 받아옴
  const orderItems = orderNo.split(','); // 콤마로 구분된 orderNo를 배열로 분할
  const cartItems = useSelector((state) => state.cart.cartItems); // Redux 스토어에서 장바구니 항목 가져오기

  // 선택된 제품들에 대한 정보를 가져오기
  const selectedItems = cartItems.filter((item) =>
    orderItems.includes(item.product.no.toString())
  );

  return (
    <div>
      <h2>주문 상세 페이지</h2>
      <p>주문 번호: {orderNo}</p>
      <div>
        {selectedItems.map((item) => (
          <div key={item.product.no}>
            <p>{item.product.name}</p> {/* 제품명 */}
            <p>수량: {item.quantity}</p> {/* 수량 */}
            <p>가격: {item.product.price}원</p> {/* 가격 */}
          </div>
        ))}
      </div>
      {/* 추가적인 주문 처리 로직을 여기에 구현 */}
    </div>
  );
}
