import React, { useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./ReviewWritePage.css"; // CSS 파일 import
//import "../Style/All.css"; //  button styles

export default function ReviewWritePage() {
  const { orderProductNo } = useParams();
  const location = useLocation();
  const { userNo, review, productName } = location.state || {}; // review 받아오기
  const navigate = useNavigate();

  const [contents, setContents] = useState(review?.contents || "");
  const [score, setScore] = useState(review?.score || 0);
  const [pic, setPic] = useState(review?.pic || null);
  const [errorMessage, setErrorMessage] = useState("");

  // 입력 자료 검증 함수
  const validateInputs = () => {
    if (!contents.trim()) {
      setErrorMessage("리뷰 내용을 입력해주세요.");
      return false;
    }
    if (contents.length > 40) {
      setErrorMessage("리뷰 내용은 40자 이하로 작성해주세요.");
      return false;
    }
    if (score === 0) {
      setErrorMessage("평점을 선택해주세요.");
      return false;
    }
    setErrorMessage(""); // 오류 메시지가 없을 때는 초기화
    return true;
  };

  // 리뷰 작성 시 서버에 데이터를 전송하는 함수
  const handleSubmit = () => {
    if (!validateInputs()) return; // 입력 검증 통과하지 않으면 제출 중단

    const formData = new FormData();

    // 리뷰 데이터를 객체로 생성
    const reviewDto = {
      orderProductNo,
      userNo,
      contents,
      score,
      productName,
    };

    // reviewDto를 JSON 문자열로 변환하여 FormData에 추가
    formData.append("reviewDto", JSON.stringify(reviewDto));

    // 이미지 파일이 선택된 경우에만 추가
    if (pic) {
      formData.append("pic", pic); // 이미지 파일 추가
    }

    axios
      .post(`/list/review/${orderProductNo}`, formData, {
        // 서버에서 주문상품번호를 가져와야함
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

  // 리뷰 취소 시 이전 페이지로 이동하는 함수
  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <div className="reviews-container">
      <h2>리뷰 작성하기</h2>
      <div>
        {/* 주문상품 번호: {orderProductNo}
        <br />
        사용자 번호: {userNo} */}
        상품명 : {productName}
      </div>
      {/* 오류 메시지를 화면에 표시 */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <textarea
        className="textarea"
        placeholder="리뷰 내용을 입력하세요"
        value={contents}
        onChange={(e) => {
          const input = e.target.value;
          if (input.length <= 40) {
            // 글자 수를 40자로 제한
            setContents(input);
          }
        }}
      ></textarea>
      <div>{contents.length} / 40 글자</div>
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
      &nbsp;
      {/* 리뷰 취소 버튼 */}
      <button className="reviewcancle" onClick={handleCancel}>
        리뷰 취소
      </button>
    </div>
  );
}
