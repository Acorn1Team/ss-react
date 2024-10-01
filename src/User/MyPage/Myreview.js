import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Style/Myreview.module.css";
import Modal from "react-modal";
import "../Style/All.css"; //  button styles
import { FaStar } from "react-icons/fa";

function Myreview() {
  const [reviews, setReviews] = useState([]);
  const [productImages, setProductImages] = useState({});
  const userNo = sessionStorage.getItem("id");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
  const [selectedReviewNo, setSelectedReviewNo] = useState(null);
  const navigate = useNavigate();

  const myreviewOnly = (page = 0) => {
    axios
      .get(`/api/mypage/review/${userNo}`, {
        params: { page: page, size: 5 },
      })
      .then((res) => {
        if (res.data.reviews) {
          setReviews(res.data.reviews.content);
          setTotalPages(res.data.reviews.totalPages);
          res.data.reviews.content.forEach((review) => {
            fetchProductImage(review.productNo);
          });
        } else {
          setReviews([]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchProductImage = (productNo) => {
    axios
      .get(`/api/list/product/${productNo}`)
      .then((res) => {
        setProductImages((prev) => ({
          ...prev,
          [productNo]: res.data.pic, // 각 productNo에 대한 상품 사진 저장
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    myreviewOnly(currentPage);
  }, [currentPage]);

  const deleteReview = () => {
    if (selectedReviewNo !== null) {
      axios
        .delete(`/api/review/delete/${selectedReviewNo}`)
        .then(() => {
          setReviews(
            reviews.filter((review) => review.no !== selectedReviewNo)
          );
          closeModal(); // 모달 닫기
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  // 모달 열기
  const openModal = (reviewNo) => {
    setSelectedReviewNo(reviewNo);
    setModalIsOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedReviewNo(null);
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
      <h2>나의 후기 목록</h2>
      {Array.isArray(reviews) && reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.no} className={styles.reviewCard}>
            <Link to={`/user/shop/review/${review.no}`}>
              <img
                src={
                  review.pic
                    ? review.pic
                    : productImages[review.productNo] || "" // 리뷰 사진이 없을 경우 상품 사진 사용
                }
                alt={review.productName}
              />
              <br />
            </Link>
            <div className={styles.reviewInfo}>
              <div className={styles.productName}>{review.productName}</div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="rating"
                    value={review.score}
                    style={{ display: "none" }}
                  />
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <FaStar
                        key={index}
                        size={30}
                        color={
                          ratingValue <= review.score ? "#ffc107" : "#e4e5e9"
                        } // score에 따라 색상 변경
                        style={{ cursor: "pointer" }}
                      />
                    );
                  })}
                </label>
              </div>
              <div className={styles.reviewContent}>{review.contents}</div>
              <div className={styles.buttonContainer}>
                <button
                  className={`btn1`}
                  onClick={() =>
                    navigate(`../review/edit/${review.no}`, {
                      state: { review },
                    })
                  }
                >
                  수정
                </button>
                <button className={`btn3`} onClick={() => openModal(review.no)}>
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center" }}>작성한 리뷰가 없습니다.</div>
      )}

      {totalPages > 1 && (
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
      )}
      {/* 리뷰 삭제 모달 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="리뷰 삭제 확인 모달"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          },
        }}
      >
        <h3>정말로 이 리뷰를 삭제하시겠습니까?</h3>
        <div className={styles.modalButtons}>
          <button onClick={deleteReview}>예</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button onClick={closeModal}>아니요</button>
        </div>
      </Modal>
    </>
  );
}

export default Myreview;
