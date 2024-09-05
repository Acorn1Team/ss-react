import React, { useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

export default function ReviewEditPage() {
  const location = useLocation();
  const { no } = useParams();
  const { review } = location.state || {};

  const [orderProductNo] = useState(review.orderProductNo);
  const [contents, setContents] = useState(review.contents);
  const [pic, setPic] = useState(review.pic);
  const [score, setScore] = useState(review.score);

  const navigate = useNavigate();

  const handleSubmit = () => {
    const reviewDto = { no, orderProductNo, contents, score }; // 리뷰 데이터를 객체로 생성
    const formData = new FormData();
    formData.append("reviewDto", JSON.stringify(reviewDto)); // reviewDto를 JSON 문자열로 변환하여 FormData에 추가
    if (pic) {
      formData.append("pic", pic); // 이미지 파일이 선택된 경우에만 추가
    }
  
    axios
      .put(`/review/update/${no}`, formData)
      .then((response) => {
        console.log("리뷰 제출 성공:", response.data);
        navigate(`../review`); // 성공 시 페이지 이동
      })
      .catch((error) => {
        console.error("리뷰 제출 실패:", error.response?.data || error);
      });
  };
  


  return (
    <div>
      <h2>리뷰 수정하기</h2>
      <div>
        상품명: {review.productName}
      </div>
      <textarea value={contents} onChange={(e) => setContents(e.target.value)} />

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
        type="file"
        accept="image/*"
        onChange={(e) => setPic(e.target.files[0])} // 파일 선택 시 상태 업데이트
      />
      <br />
      <button onClick={handleSubmit}>리뷰 수정</button>
    </div>
  )
}

