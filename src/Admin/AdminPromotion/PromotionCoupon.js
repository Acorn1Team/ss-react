import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PromotionCoupon() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    name: "",
    discountRate: "",
    expiryDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 할인율이 음수로 입력되는 것을 방지
    if (name === "discountRate") {
      if (value < 0) {
        alert("할인율은 0 이상이어야 합니다.");
        return;
      }
      // 할인율을 1~100 사이로 제한
      if (value > 100) {
        alert("할인율은 100 이하이어야 합니다.");
        return;
      }
    }

    setState({
      ...state,
      [name]: value,
    });
  };

  const addCoupon = () => {
    const { name, discountRate } = state;

    // 할인율이 비어 있는지 확인
    if (!discountRate) {
      alert("할인율을 입력해 주세요.");
      return;
    }

    // 유효기간이 비어 있으면 기본값으로 1주일 후 날짜를 설정
    const expiryDate = state.expiryDate || getFutureDate(7);

    const couponData = {
      ...state,
      expiryDate,
    };

    axios
      .post("/admin/coupon", couponData)
      .then((response) => {
        if (response.data.isSuccess) {
          alert("추가 성공");
          navigate("/admin/promotion");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 현재 날짜에 지정한 일수를 더하여 반환하는 함수
  const getFutureDate = (days) => {
    const today = new Date();
    today.setDate(today.getDate() + days);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div>
      <h2>쿠폰 등록</h2>
      <div>
        <label>쿠폰 이름</label>
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>할인율</label>
        <input
          type="number"
          name="discountRate"
          value={state.discountRate}
          onChange={handleChange}
          min="0" // HTML5에서 음수 입력 방지
        />
        <span>%</span>
      </div>
      <div>
        <label>유효기간</label>
        <input
          type="date"
          name="expiryDate"
          value={state.expiryDate}
          onChange={handleChange}
        />
      </div>
      <button onClick={addCoupon}>등록</button>
    </div>
  );
}
