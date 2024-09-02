import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ProductReviews from "./ProductReviews";

import styles from "../Style/ProductDetail.module.css";

import Modal from "react-modal";

Modal.setAppElement("#root"); // 모달의 root element를 설정합니다.


export default function ProductDetail() {
  const { no, productNo } = useParams();
  const [product, setProduct] = useState({});
  const [count, setCount] = useState(1); // 수량을 상태로 관리
  const [averageRating, setAverageRating] = useState(0); // 평균 평점 상태 추가
  const dispatch = useDispatch(); // Redux의 dispatch 함수 사용
  const navigate = useNavigate(); // useNavigate 훅 사용

  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태 추가

  const refresh = (no) => {
    axios
      .get(`/list/product/${no}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    refresh(no);
  }, [no]);

  const getDiscountedPrice = () => {
    if (product.discountRate > 0) {
      return product.price - product.price * (product.discountRate / 100);
    } else {
      return product.price;
    }
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * count;
  };

  const incrementQuantity = () => {
    setCount((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setCount((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  // 모달 열기
  const openModal = () => setModalIsOpen(true);
  // 모달 닫기
  const closeModal = () => setModalIsOpen(false);

  // 계속 쇼핑하기 버튼 동작
  const continueShopping = () => {
    closeModal();
  };

  // 장바구니 보기 버튼 동작
  const goToCart = () => {
    closeModal();
    navigate("/user/shop/cart");
  };

  // 장바구니에 제품 추가
  const handleAddToCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity: count },
    });
    openModal(); // 제품이 장바구니에 추가되면 모달을 엽니다.
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
      <br />

{/* 모달 구현 */}
<Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  contentLabel="장바구니 추가 모달"
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
  <h2>장바구니에 추가되었습니다!</h2>
  <div>
    <img src={product.pic} alt="Product" />
  </div>
  <button onClick={continueShopping}>계속 쇼핑하기</button>
  <button onClick={goToCart}>장바구니 보기</button>
</Modal>

    </div>
  );
}
