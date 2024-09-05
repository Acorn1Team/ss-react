import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Myreview() {
  const [reviews, setReviews] = useState([]); // 리뷰 리스트
  const userNo = sessionStorage.getItem("id"); // 세션에서 유저 ID 가져오기
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
  const navigate = useNavigate();

  // 리뷰 데이터 가져오기
  const myreviewOnly = (page = 0) => {
    axios
      .get(`/mypage/review/${userNo}`, {
        params: {
          page: page,
          size: 5, // 한 번에 5개의 리뷰를 가져옴
        },
      })
      .then((res) => {
        if (res.data.reviews) {
          setReviews(res.data.reviews.content); // 페이징된 데이터의 content 사용
          setTotalPages(res.data.reviews.totalPages); // 총 페이지 수 설정
        } else {
          setReviews([]); // 데이터가 없는 경우 빈 배열로 설정
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    myreviewOnly(currentPage); // 페이지가 변경될 때마다 리뷰를 가져옴
  }, [currentPage]);

  // 리뷰 삭제
  const deleteReview = (reviewNo) => {
    // 삭제를 확인하는 메시지
    const confirmed = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");

    if (confirmed) {
      axios
        .delete(`/review/delete/${reviewNo}`)
        .then(() => {
          setReviews(reviews.filter((review) => review.no !== reviewNo)); // 삭제 후 상태 업데이트
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // 페이지 이동
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
          <div key={review.no}>
            <div>상품 번호: {review.productNo}</div>
            <div>사용자: {review.userNickname}</div>
            <div>제품: {review.productName}</div>
            <img
              src={review.pic}
              alt={review.name}
              style={{ width: "100px", height: "100px" }}
            />
            <div>리뷰 평점: {review.score}</div>
            <div>리뷰 내용: {review.contents}</div>
            <button onClick={() => navigate(`user/mypage/review/edit/${review.no}`, { state: { review } })}>수정</button>
            <button onClick={() => deleteReview(review.no)}>삭제</button>
          </div>
        ))
      ) : (
        <div>리뷰가 없습니다.</div>
      )}
      {/* 페이지네이션 */}
      <div>
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
}

export default Myreview;
