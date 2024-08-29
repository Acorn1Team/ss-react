import React, { useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaStar} from 'react-icons/fa';

export default function ReviewWritePage() {
  const { productNo } = useParams();
  const location = useLocation();
  const { orderNo, userNo } = location.state;
  const {no} = useParams();
  const navigate = useNavigate(); // useNavigate 훅 사용
 

  const [contents, setContents] = useState("");
  const [score, setScore] = useState(0);
  const [pic, setPic] = useState("");

  const handleSubmit = () => {
    // 여기에 리뷰 제출 로직을 구현
    console.log("리뷰 작성 중:", { productNo, orderNo, userNo, contents, score, pic });
   
      // 작성된 리뷰 데이터를 서버로 전송
      
      const reviewData = {
        productNo,
        orderNo,
        userNo,
        contents,
        score,
        pic
      };
  
      axios
      .post(`/list/review/${productNo}`, reviewData)
      .then((response) => {
        console.log("리뷰 제출 성공:", response.data);
        // 리뷰 제출 후 다른 페이지로 이동
        navigate(`../review/${productNo}`);
      })
      .catch((error) => {
        console.error("리뷰 제출 실패:", error);
      });
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

      <div>
        <h3>평점:</h3>
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                style={{ display: "none" }}
                onClick={() => setScore(ratingValue)}
              />
              <FaStar
                size={30}
                color={ratingValue <= score ? "#ffc107" : "#e4e5e9"}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setScore(ratingValue)}
                onMouseLeave={() => setScore(ratingValue)}
              />
            </label>
          );
        })}
      </div>
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
