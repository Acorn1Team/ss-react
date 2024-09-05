import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../Style/Myreview.module.css";

function Myreview() {
  const [reviews, setReviews] = useState([]);
  const userNo = sessionStorage.getItem("id");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const myreviewOnly = (page = 0) => {
    axios
      .get(`/mypage/review/${userNo}`, {
        params: { page: page, size: 5 },
      })
      .then((res) => {
        if (res.data.reviews) {
          setReviews(res.data.reviews.content);
          setTotalPages(res.data.reviews.totalPages);
        } else {
          setReviews([]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    myreviewOnly(currentPage);
  }, [currentPage]);

  const deleteReview = (reviewNo) => {
    const confirmed = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");
    if (confirmed) {
      axios
        .delete(`/review/delete/${reviewNo}`)
        .then(() => {
          setReviews(reviews.filter((review) => review.no !== reviewNo));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const goToNextPage = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      {Array.isArray(reviews) && reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.no} className={styles.reviewCard}>
            <img src={review.pic} alt={review.name} />
            <div className={styles.reviewInfo}>
              <div className={styles.reviewTitle}>상품 번호: {review.productNo}</div>
              <div>사용자: {review.userNickname}</div>
              <div>제품: {review.productName}</div>
              <div>리뷰 평점: {review.score}</div>
              <div className={styles.reviewContent}>리뷰 내용: {review.contents}</div>
              <div className={styles.buttonContainer}>
                <button
                  className={styles.editButton}
                  onClick={() => navigate(`../review/edit/${review.no}`, { state: { review } })}
                >
                  수정
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => deleteReview(review.no)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>리뷰가 없습니다.</div>
      )}

      <div className={styles.paginationContainer}>
        <button
          onClick={goToPreviousPage}
          className={styles.paginationButton}
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          className={styles.paginationButton}
          disabled={currentPage + 1 >= totalPages}
        >
          다음
        </button>
      </div>
    </>
  );
}

export default Myreview;
