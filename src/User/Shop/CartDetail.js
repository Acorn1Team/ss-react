import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from 'axios';

export default function CartDetail() {
  const { orderNo } = useParams(); // 경로에서 orderNo를 받아옴
  const orderItems = orderNo.split(','); // 콤마로 구분된 orderNo를 배열로 분할
  const cartItems = useSelector((state) => state.cart.cartItems); // Redux 스토어에서 장바구니 항목 가져오기
  const navigate = useNavigate(); // 페이지 이동


  const [coupons, setCoupons] = useState([]); // 쿠폰 데이터 상태
  const [selectedCoupon, setSelectedCoupon] = useState(null); // 선택된 쿠폰 상태
  const [user, setUser] = useState(null); // 유저 정보 상태

    // 로그인 정보라고 가정
    const userNo = sessionStorage.getItem("id");
    
    //console.log(userNo); 

      // 유저 정보 받기
  useEffect(() => {
    axios.get(`/posts/user/${userNo}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error('유저 정보를 불러오는 데 실패했습니다.', error);
      });
  }, [userNo]);

  // 쿠폰 정보 받기
  useEffect(() => {
    axios.get(`/coupon/order/${userNo}`)
      .then((response) => {
        setCoupons(response.data);
      })
      .catch((error) => {
        console.error('쿠폰 데이터를 불러오는 데 실패했습니다.', error);
      });
  }, [userNo]);

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
  ? totalPrice - (totalPrice * selectedCoupon.coupon.discountRate / 100)
  : totalPrice;

    // 구매하기 버튼 클릭 핸들러
    const handlePurchase = () => {
      // 구매하기 페이지로 이동 (예: /purchase)
      navigate("/user/shop/purchase", { state: { items: selectedItems, total: discountedPrice, user, selectedCoupon } });
    };



  return (
    <div>
      <h2>주문 상세 페이지</h2>
      <p>주문 번호: {orderNo}</p>
       {/* 유저 정보 표시 */}
       {user && (
        <div>
          <h3>유저 정보</h3>
          <p>이름: {user.name}</p>
          <p>이메일: {user.email}</p>
          <p>주소: {user.address}</p>
        </div>
      )}
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
           onChange={(e) => {
           const selected = coupons.find(coupon => coupon.coupon.no === parseInt(e.target.value));
            console.log("Selected Coupon:", selected); // 선택된 쿠폰을 콘솔에 출력
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
      <div>
        <h3>총 가격: {totalPrice}원</h3> {/* 원래 총 가격 */}
        {selectedCoupon && (
          <h3>할인된 가격: {discountedPrice}원</h3> 
        )}
      </div>
  
      <div>
        <button onClick={handlePurchase}>구매하기</button> 
      </div>
    </div>
  );
}
