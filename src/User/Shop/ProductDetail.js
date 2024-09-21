import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ProductReviews from "./ProductReviews";
import { FiShoppingCart } from "react-icons/fi";

import styles from "../Style/ProductDetail.module.css";
import "../Style/All.css"; //  button styles

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
 // const [stockInfo, setStockInfo] = useState(null);

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

  // 할인가격 계산 함수
  const calculateSellingPrice = (price, discountRate) => {
    return price - (price * discountRate) / 100;
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
      <h2>{product.name}</h2>
      <div className={styles.productDescription}>
        {/* <span className={styles.label}>상품 설명:</span> */}
        <span>{product.contents}</span>
      </div>
      <div>
        <img
          src={product.pic}
          alt={product.name}
          className={styles.productImage2}
        />
      </div>
      <br />
      <div>
        <span className={styles.label}>가격:</span>
        <span className={styles.productPrice}>
          {product.price !== undefined && product.discountRate !== undefined ? (
            product.discountRate > 0 ? (
              <>
                <span style={{ textDecoration: "line-through" }}>
                  {product.price.toLocaleString()}원
                </span>
                &nbsp;
                <span style={{ color: "#df919e", fontWeight: "bold" }}>
                  {calculateSellingPrice(
                    product.price,
                    product.discountRate
                  ).toLocaleString()}
                  원 ({product.discountRate}% 할인)
                </span>
              </>
            ) : (
              <>{product.price.toLocaleString()}원</>
            )
          ) : (
            <span>가격 정보 없음</span>
          )}
        </span>
      </div>
      <div className={styles.quantityControls}>
        {product.stock > 0 ? (
          <>
            <span className={styles.label}>수량:</span>
            <button className={`btn2Small`} onClick={decrementQuantity}>
              -
            </button>
            <span>{count}</span>
            <button
              className={`btn2Small`}
              onClick={incrementQuantity}
              disabled={product.stock <= count}
            >
              +
            </button>
            <span className={styles.price}>
              총 {getTotalPrice().toLocaleString()} 원
            </span>
            &nbsp;
            <button
              className={`btn2`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              장바구니에 담기
            </button>
          </>
        ) : (
          <h2>SOLD OUT</h2>
        )}
      </div>

      <div className={styles.reviewSection}>
        <h3>리뷰 보기</h3>
        <ProductReviews product={product} setAverageRating={setAverageRating} />
      </div>
      <br />
      <Link to={`/user/style/write/${no}`} className={`btn4`}>
        커뮤니티 공유하기
      </Link>

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
          <FiShoppingCart size={100} color="#c7727e" />
        </div>
        <h3>선택한 상품이 장바구니에 담겼습니다.</h3>
        <button className={`btn3`} onClick={continueShopping}>
          계속 쇼핑하기
        </button>
        &nbsp;&nbsp;
        <button className={`btn4`} onClick={goToCart}>
          장바구니 보기
        </button>
      </Modal>
    </div>
  );
}
