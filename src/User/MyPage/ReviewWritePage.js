import React, { useState } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";

export default function ReviewWritePage() {
  const { productNo } = useParams();
  const location = useLocation();
  const { orderNo, userNo } = location.state;
  const {no} = useParams();

  const [contents, setContents] = useState("");
  const [score, setScore] = useState(0);
  const [pic, setPic] = useState("");

  const handleSubmit = () => {
    // 여기에 리뷰 제출 로직을 구현
    console.log("리뷰 작성 중:", { productNo, orderNo, userNo, contents, score, pic });

    // axios
    // .put(`/review/write/${no}`,{ productNo, orderNo, userNo, contents, score, pic })
    //   .then(response => {
    //     console.log("리뷰 제출 성공:", response.data);
    //   })
    //   .catch(error => {
    //     console.log("리뷰 제출 실패:", error);
    //   });
  };

  return (
    <div>
      <h2>리뷰 작성하기</h2>
      <div>
        상품 번호: {productNo}
        <br />
        주문 번호: {orderNo}
        <br />
        사용자 번호: {userNo}
      </div>
      <textarea 
        placeholder="리뷰 내용을 입력하세요" 
        value={contents} 
        onChange={(e) => setContents(e.target.value)}
      ></textarea>
      <br />
      <input 
        type="number" 
        placeholder="점수" 
        value={score} 
        onChange={(e) => setScore(e.target.value)} 
      />
      <br />
      <input 
        type="text" 
        placeholder="사진 URL" 
        value={pic} 
        onChange={(e) => setPic(e.target.value)} 
      />
      <br />
      <button onClick={handleSubmit}>리뷰 제출</button>
    </div>
  );
}
