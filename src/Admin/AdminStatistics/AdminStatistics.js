import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";

export default function AdminStatistics() {

  const [myCouponList, setMyCouponList] = useState([]);
  
  const getMyCouponList = async () => {
    try {
      const response = await axios.get(`/coupon/5`); // 일단 유저 번호 5라고 가정하고 해볼게요
      setMyCouponList(response.data);
    } catch (error) {
      console.error("쿠폰함 정보 못 갖고 오겠어!:", error);
    }
  };

  useEffect(() => {
    getMyCouponList(); // 여기 파라미터랑
  }, []); // 여기에 유저 번호 넣으시면 돼요

  return (
    <>
      <h2>쿠폰함</h2>
    </>
  );
}