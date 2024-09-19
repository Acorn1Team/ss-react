import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "./Review.css"; // CSS 파일 추가



export default function Review() {
  const { no } = useParams();
  const [reviewData, setReviewData] = useState([]);
  const [reviewImage, setReviewImage] = useState(""); // 리뷰 이미지 상태 추가

  const getReviewData = () => {
    axios
      .get(`/mypage/review/detail/${no}`)
      .then((res) => {
        setReviewData(res.data);

        // 리뷰 이미지가 있는 경우 이미지 데이터를 받아오기
        if (res.data.pic) {
          setReviewImage(res.data.pic);
        } else {
          // 리뷰 이미지가 없으면 상품 이미지 가져오기
          fetchProductImage(res.data.productNo);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

    // 상품 이미지를 가져오는 함수 (리뷰 이미지가 없을 때 대체)
    const fetchProductImage = (productNo) => {
      axios
        .get(`/list/product/${productNo}`)
        .then((res) => {
          setReviewImage(res.data.pic); // 상품 이미지 설정
          
        })
        .catch((error) => {
          console.log(error);
        });
    };


  useEffect(() => {
    getReviewData();
  }, [no]);

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
    <div className="review-container">
      <div className="review-card">
           {/* 리뷰 이미지가 없으면 상품 이미지를 대신 사용 */}
           <img
          src={reviewImage} // reviewImage 상태에서 가져온 이미지 사용
          alt={`${reviewData.productName} 사진`}
          className="review-image"
        />
        {/* <img src={reviewData.pic} alt={`${reviewData.productName} 사진`} className="review-image" /> */}
        <div className="review-content">
          <div className="review-header">
            <span className="user-nickname">@{reviewData.userNickname}</span>
            <div className="stars">{renderStars(reviewData.score)}</div>
          </div>
          <div className="review-text">{reviewData.contents}</div>
        </div>
        {/* 하단 상품 정보 섹션에 링크 추가 */}
        <Link to={`/user/shop/productlist/detail/${reviewData.productNo}`} className="product-info-link">
          <div className="product-info">
            {/* <img src={reviewData.productImage} alt={`${reviewData.productName}`} className="product-thumbnail" /> */}
            <div className="product-details">
              <span>제품정보</span>
              <span className="product-name">{reviewData.productName}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
