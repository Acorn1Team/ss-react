import React, { useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

export default function ReviewWritePage() {
  const { orderProductNo } = useParams(); // URL에서 orderProductNo 추출

  // 디버깅: orderProductNo 확인
// console.log("orderProductNo:", orderProductNo); // 이 값을 확인하여 제대로 추출되는지 확인

  
  const location = useLocation(); // location.state에서 다른 데이터를 추출
  const { userNo } = location.state; // orderNo 제거
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  const [contents, setContents] = useState(""); // 리뷰 내용 상태 관리
  const [score, setScore] = useState(0); // 평점 상태 관리
  const [pic, setPic] = useState(null); // 이미지 파일 상태 관리

  // 리뷰 작성 시 서버에 데이터를 전송하는 함수
  const handleSubmit = () => {
    const formData = new FormData();

    // 리뷰 데이터를 객체로 생성
    const reviewDto = {
      orderProductNo,
      userNo,
      contents,
      score,
    };

    // reviewDto를 JSON 문자열로 변환하여 FormData에 추가
    formData.append("reviewDto", JSON.stringify(reviewDto));

    // 이미지 파일이 선택된 경우에만 추가
    if (pic) {
      formData.append("pic", pic); // 이미지 파일 추가
    }

    axios
      .post(`/list/review/${orderProductNo}`, formData, { // 서버에서 주문상품번호를 가져와야함
        headers: {
          "Content-Type": "multipart/form-data", // FormData로 전송하기 위한 헤더 설정
        },
      })
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
      <h2>리뷰 작성하기</h2>
      <div>
        상품 번호: {orderProductNo}
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
        type="file"
        accept="image/*"
        onChange={(e) => setPic(e.target.files[0])} // 파일 선택 시 상태 업데이트
      />
      <br />
      <button onClick={handleSubmit}>리뷰 제출</button>
    </div>
  );
}
