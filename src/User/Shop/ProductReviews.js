import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductReviews = () => {
  const { no } = useParams(); // URL에서 product 번호 가져오기
  const [reviews, setReviews] = useState([]); // 리뷰 데이터를 저장할 state
  const [averageRating, setAverageRating] = useState(0); // 평균 평점
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호
  const [pageSize] = useState(2); // 한 페이지당 리뷰 수
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

  // 리뷰 데이터를 불러오는 함수
  const reviewData = (page) => {
    axios
      .get(`/list/review/${no}`, {
        params: {
          page: page,
          size: pageSize,
        },
      })
      .then((res) => {
        console.log(res.data); // API 응답 데이터 로그 출력
        const reviewsData = res.data.reviews.content || []; // 페이징된 리뷰 데이터
        setReviews(reviewsData); // 리뷰 데이터 state에 저장
        setTotalPages(res.data.reviews.totalPages); // 전체 페이지 수 설정

        // 평균 평점 계산
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce(
            (acc, review) => acc + (parseFloat(review.score) || 0),
            0
          );
          setAverageRating((totalRating / reviewsData.length).toFixed(1));
        } else {
          setAverageRating(0);
        }
      })
      .catch((error) => {
        console.log(error); // 에러 발생 시 콘솔에 출력
      });
  };

  // 컴포넌트가 처음 렌더링될 때와 페이지가 변경될 때 리뷰 데이터 호출
  useEffect(() => {
    reviewData(currentPage); // 페이지가 변경될 때마다 리뷰 데이터를 다시 로드
  }, [no, currentPage]);

  // 페이지 이동 함수: 다음 페이지로 이동
  const goToNextPage = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 페이지 이동 함수: 이전 페이지로 이동
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} style={{ color: "#ffcc00" }} />);
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<FaStarHalfAlt key={i} style={{ color: "#ffcc00" }} />);
      } else {
        stars.push(<FaRegStar key={i} style={{ color: "#cccccc" }} />);
      }
    }
    return stars;
  };

  return (
    <>
      <div>
        {/* 평균 평점 및 별 렌더링 */}
        평균 평점: {renderStars(averageRating)} {averageRating}
      </div>

      {/* 리뷰가 있는지 확인 후 출력 */}
      {reviews.length === 0 ? (
        <div>리뷰가 없습니다.</div> // **리뷰가 없는 경우 표시할 내용**
      ) : (
        reviews.map((review) => (
          <div key={review.no} style={{ marginBottom: "20px" }}>
            <div>리뷰 번호: {review.no}</div>
            <div>사용자: {review.userNickname}</div>
            <div>제품: {review.productName}</div>
            <div>사진:</div>
            {/* 이미지가 없는 경우 기본 이미지로 대체 */}
            <img
              src={review.pic ? review.pic : "/path/to/default-image.jpg"} // **이미지가 없는 경우 기본 이미지 표시**
              alt={review.productName}
              style={{ width: "100px", height: "100px" }}
            />
            <div>내용: {review.contents}</div>
            <div>
              점수: {renderStars(review.score)} {review.score}
            </div>
          </div>
        ))
      )}

      {/* 페이지네이션 버튼 */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={goToPreviousPage} disabled={currentPage === 0}>
          이전
        </button>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage + 1 >= totalPages}>
          다음
        </button>
      </div>
    </>
  );
};

export default ProductReviews;
