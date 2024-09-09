import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ProductReviews from "./ProductReviews";
import { FiShoppingCart } from "react-icons/fi";

import styles from "../Style/ProductDetail.module.css";

import Modal from "react-modal";

Modal.setAppElement("#root");

export default function ProductDetail() {
  const { no, productNo } = useParams();
  const [product, setProduct] = useState({});
  const [count, setCount] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [modalIsOpen, setModalIsOpen] = useState(false);

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

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const continueShopping = () => {
    closeModal();
    navigate("/user/shop/productlist"); // 상품 목록 페이지로 이동
  };

  const goToCart = () => {
    closeModal();
    navigate("/user/shop/cart");
  };

  // 장바구니에 제품 추가
  const handleAddToCart = () => {
    const userNo = sessionStorage.getItem("id");
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity: count, userNo },
    });
    openModal();
  };

  // 주문 완료 후 장바구니 비우기
  const handleOrder = () => {
    const userNo = sessionStorage.getItem("id");
    const total = getTotalPrice();
    const selectedCartItems = [
      {
        productNo: product.no,
        name: product.name,
        quantity: count,
        price: product.price,
        discountRate: product.discountRate,
        resultPrice: getDiscountedPrice() * count,
      },
    ];

    // 주문 생성 액션 디스패치
    dispatch({
      type: "CREATE_ORDER",
      payload: { items: selectedCartItems, total: total, userNo },
    });

    // 주문 후 장바구니 비우기
    dispatch({
      type: "CLEAR_CART",
      payload: { userNo },
    });

    // 로컬 스토리지에서도 해당 장바구니 비우기
    localStorage.removeItem("cart");

    navigate(`/user/shop/order/detail`);
  };

  return (
    <div className={styles.container}>
      <h2>상품 상세 정보</h2>
      <div>
        <span className={styles.label}>이름:</span>
        <span className={styles.value}>{product.name}</span>
      </div>
      <div>
        <span className={styles.label}>가격:</span>
        <span className={styles.price}>
          {getTotalPrice().toLocaleString()} 원
        </span>
        {product.discountRate > 0 && (
          <span className={styles.discountRate}>
            할인율: {product.discountRate}%
          </span>
        )}
      </div>
      <div className={styles.quantityControls}>
        <span className={styles.label}>수량:</span>
        <button onClick={decrementQuantity}>-</button>
        <span>{count}</span>
        <button onClick={incrementQuantity}>+</button>&nbsp;
        {product.stock > 0 ? (
          <button className={styles.addToCartButton} onClick={handleAddToCart}>
            장바구니에 담기
          </button>
        ) : (
          <button className={styles.addToCartButton}>품절된 상품입니다</button>
        )}
      </div>

      <div className={styles.productDescription}>
        <span className={styles.label}>상품 설명:</span>
        <span>{product.contents}</span>
      </div>
      <div className={styles.productCategory}>
        <span className={styles.label}>카테고리:</span>
        <span>{product.category}</span>
      </div>
      <div>
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
        <div>
          <FiShoppingCart size={100} color="#007bff" />
        </div>
        <h3>선택한 상품이 장바구니에 담겼습니다.</h3>
        <button onClick={continueShopping}>계속 쇼핑하기</button>
        <button onClick={goToCart}>장바구니 보기</button>
      </Modal>
    </div>
  );
}
