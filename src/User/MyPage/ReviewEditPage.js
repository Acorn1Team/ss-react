import React, { useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

export default function ReviewEditPage() {
  const location = useLocation();
  const { no } = useParams();
  const { review } = location.state || {};
  const navigate = useNavigate();
  const productName = useState(review.productName);
  const [contents, setContents] = useState(review.contents); // 리뷰 내용 상태 관리
  const [score, setScore] = useState(review.score); // 평점 상태 관리
  const [pic, setPic] = useState(review.pic); // 이미지 파일 상태 관리

  const handleSubmit = () => {
    const formData = new FormData();

    // 리뷰 데이터를 객체로 생성
    const reviewDto = {no, contents, score, pic};

    // reviewDto를 JSON 문자열로 변환하여 FormData에 추가
    formData.append("reviewDto", JSON.stringify(reviewDto));

    if (pic) {formData.append("pic", pic); // 이미지 파일이 선택된 경우에만 추가

    axios
      .post(`/review/update/${no}`, formData, {
        headers: {"Content-Type": "multipart/form-data",},
      })
      .then(() => {
        navigate(`../review`); // 성공 시 페이지 이동
      })
      .catch((error) => {
        console.error("리뷰 수정 실패:", error.response?.data || error);
      });
  };

  return (
    <div>
      <h2>리뷰 수정하기</h2>
      <div>
        상품명: {productName}
      </div>
      <textarea value={contents} onChange={(e) => setContents(e.target.value)}
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
        type="file"
        accept="image/*"
        onChange={(e) => setPic(e.target.files[0])} // 파일 선택 시 상태 업데이트
      />
      <br />
      <button onClick={handleSubmit}>리뷰 수정</button>
    </div>
  )
}
}
