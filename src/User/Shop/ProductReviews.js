import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import './ProductReviews.css'; // 스타일을 위한 CSS 파일 추가

const ProductReviews = () => {
  const { no } = useParams(); // URL에서 product 번호 가져오기
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]); // 페이징된 리뷰 데이터를 저장할 state
  const [averageRating, setAverageRating] = useState(0); // 전체 리뷰에 대한 평균 평점
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호
  const [pageSize] = useState(3); // 한 페이지당 리뷰 수
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수

  // 전체 리뷰 데이터를 불러오고 평균 평점을 계산하는 함수
  const fetchReviews = async (productId, page = 0, size = pageSize) => {
    try {
      const response = await axios.get(`/admin/product/${productId}/reviews`, {
        params: {
          page,
          size,
        },
      });

      const reviewsData = response.data.content || [];
      setReviews(reviewsData); // 페이징된 리뷰 데이터 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수 설정

      // 전체 평균 평점 계산
      const allPages = response.data.totalPages;
      let totalRating = 0;
      let allReviews = [];

      // 모든 페이지에서 리뷰를 가져와 평균 평점 계산
      for (let i = 0; i < allPages; i++) {
        const pageResponse = await axios.get(`/admin/product/${productId}/reviews`, {
          params: {
            page: i,
            size,
          },
        });
        allReviews = allReviews.concat(pageResponse.data.content);
      }

      if (allReviews.length > 0) {
        totalRating = allReviews.reduce(
          (acc, review) => acc + (parseFloat(review.score) || 0),
          0
        );
        setAverageRating((totalRating / allReviews.length).toFixed(1)); // 전체 평균 평점 계산
      } else {
        setAverageRating(0);
      }

    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews(no, currentPage); // 컴포넌트가 처음 렌더링되거나 페이지가 변경될 때 호출
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
  // 리뷰 이미지를 클릭했을 때 상세 페이지로 이동하는 함수
  const goToReviewDetail = (no) => {
    navigate(`/user/shop/review/${no}`); // 해당 리뷰의 상세 페이지로 이동
  };

  return (
    <div className="reviews-container">
      {/* 전체 리뷰에 대한 평균 평점 및 별 렌더링 */}
      <div className="average-rating">
        평균 평점: {renderStars(averageRating)} {averageRating}
      </div>

      {/* 리뷰가 있는지 확인 후 출력 */}
      {reviews.length === 0 ? (
        <div className="no-reviews">리뷰가 없습니다.</div>
      ) : (
        reviews.map((review) => (
          <div key={review.no} className="review-list-item">
            <div className="review-left">
              <img
                src={review.pic ? review.pic : "/path/to/default-image.jpg"}
                alt={review.productName}
                className="review-image2"
                onClick={() => goToReviewDetail(review.no)} 
                style={{ cursor: 'pointer' }} 
              />
            </div>
            <div className="review-right">
              <div className="review-header">
                <div className="review-product-name">{review.productName}</div>
                <div className="review-user">@{review.userNickname}</div>
              </div>
              <div className="review-content">
                <div className="review-text">{review.contents}</div>
                <div className="review-rating">
                  점수: {renderStars(review.score)} {review.score}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* 페이지네이션 버튼 */}
      {totalPages > 1 && (
        <div className="pagination">
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
      )}
    </div>
  );
};

export default ProductReviews;
