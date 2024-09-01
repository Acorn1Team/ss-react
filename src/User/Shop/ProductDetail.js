import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ProductReviews from "./ProductReviews";
import styles from "../Style/ProductDetail.module.css";

export default function ProductDetail() {
  // 제품상세보기
  const { no, productNo } = useParams();
  const [product, setProduct] = useState({});
  const [count, setCount] = useState(1); // 수량을 상태로 관리
  const [averageRating, setAverageRating] = useState(0); // 평균 평점 상태 추가
  const dispatch = useDispatch(); // Redux의 dispatch 함수 사용
  const navigate = useNavigate(); // useNavigate 훅 사용

  //const userNo = 11;

  const refresh = (no) => {
    // Ajax 요청으로 선택된 카테고리에 해당하는 제품 상세 정보를 가져옴
    axios
      .get(`/list/product/${no}`)
      .then((res) => {
        console.log(res.data);
        setProduct(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    refresh(no); // 컴포넌트가 마운트될 때, 그리고 no가 변경될 때마다 요청을 보냄
  }, [no]);

  // 할인율에 따른 가격 계산
  const getDiscountedPrice = () => {
    if (product.discountRate > 0) {
      return product.price - product.price * (product.discountRate / 100);
    } else {
      return product.price;
    }
  };

  // 총 가격 계산 (수량에 따른 가격)
  const getTotalPrice = () => {
    return getDiscountedPrice() * count;
  };

  // 수량 증가
  const incrementQuantity = () => {
    setCount((prevQuantity) => prevQuantity + 1);
  };

  // 수량 감소 (최소 1로 제한)
  const decrementQuantity = () => {
    setCount((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  // 장바구니에 제품 추가
  const handleAddToCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity: count },
    });
    alert("장바구니에 추가되었습니다.");
    navigate(`/user/shop/cart`); // 장바구니 페이지로 이동
  };

  return (
    <div className={styles.container}>
      <h2>상품 상세 정보</h2>
      <div>
        <span className={styles.label}>이름:</span>
        <span className={styles.value}>{product.name}</span>
      </div>
      <div className={styles.quantityControls}>
        <span className={styles.label}>수량:</span>
        <button onClick={decrementQuantity}>-</button>
        <span>{count}</span>
        <button onClick={incrementQuantity}>+</button>
      </div>
      <div>
        <span className={styles.label}>가격:</span>
        <span className={styles.price}>{getTotalPrice()} 원</span>
        {product.discountRate > 0 && (
          <span className={styles.discountRate}>
            할인율: {product.discountRate}%
          </span>
        )}
      </div>
      <button className={styles.addToCartButton} onClick={handleAddToCart}>
        장바구니에 담기
      </button>
      <div className={styles.productDescription}>
        <span className={styles.label}>상품 설명:</span>
        <span>{product.contents}</span>
      </div>
      <div className={styles.productCategory}>
        <span className={styles.label}>카테고리:</span>
        <span>{product.category}</span>
      </div>
      <div>
        <span className={styles.label}>이미지:</span>
        <img
          src={product.pic}
          alt={product.name}
          className={styles.productImage}
        />
      </div>
      <Link to={`/user/style/write/${no}`} className={styles.communityLink}>
        커뮤니티 공유하기
      </Link>
      <div className={styles.reviewSection}>
        <h3>리뷰 보기</h3>
        <ProductReviews setAverageRating={setAverageRating} />
      </div>
    </div>
  );
}
