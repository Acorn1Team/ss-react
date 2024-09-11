import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../Style/CartList.module.css";
import "../Style/All.css"; //  button styles

export default function CartList() {
  const userNo = sessionStorage.getItem("id"); // 로그인한 사용자 ID를 세션에서 가져옴
  const cartItems = useSelector((state) => state.cart.cartItems[userNo] || []); // 사용자 ID별 장바구니 항목 가져오기
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);
  const [cartProductInfo, setCartProductInfo] = useState([]);

  const fetchStockInfo = async () => {
    try {
      const productNos = cartItems.map((ci) => ci.product.no);
      const response = await axios.post(
        "/cart/stock",
        { productNos, userNo },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const stockData = response.data;
      setCartProductInfo(
        cartItems.map((ci) => {
          const stockInfo = stockData.find(
            (stock) => stock.productNo === ci.product.no
          );
          const availableStock = stockInfo ? stockInfo.stock : 0;

          return {
            no: ci.product.no,
            pic: ci.product.pic,
            name: ci.product.name,
            quantity: ci.quantity,
            price: ci.product.price,
            discountRate: ci.product.discountRate,
            resultPrice:
              ci.product.discountRate > 0
                ? ci.product.price *
                  (1 - ci.product.discountRate / 100) *
                  ci.quantity
                : ci.product.price * ci.quantity,
            stock: availableStock,
            purchaseCheck: ci.quantity <= availableStock,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching stock info:", error);
    }
  };

  useEffect(() => {
    if (userNo) {
      fetchStockInfo(); // 컴포넌트가 로드될 때 재고 정보 불러오기
    }
  }, [cartItems, userNo]);

  const getTotalCartPrice = () => {
    return selectedItems.reduce((total, productNo) => {
      const selectedItem = cartProductInfo.find(
        (item) => item.no === productNo
      );
      return total + (selectedItem ? parseInt(selectedItem.resultPrice) : 0);
    }, 0);
  };

  const handleCheckboxChange = (productNo) => {
    const selectedItem = cartProductInfo.find((item) => item.no === productNo);

    if (selectedItem && selectedItem.purchaseCheck) {
      if (selectedItems.includes(productNo)) {
        setSelectedItems(selectedItems.filter((no) => no !== productNo));
      } else {
        setSelectedItems([...selectedItems, productNo]);
      }
    }
  };

  const handleRemoveSelected = () => {
    selectedItems.forEach((productNo) =>
      dispatch({
        type: "REMOVE_FROM_CART",
        payload: { productNo, userNo },
      })
    );
    setSelectedItems([]); // 선택 목록 초기화
  };

  const incrementQuantity = (productNo) => {
    const selectedItem = cartProductInfo.find((item) => item.no === productNo);

    if (selectedItem && selectedItem.quantity < selectedItem.stock) {
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          product: cartItems.find((item) => item.product.no === productNo)
            .product,
          quantity: 1,
          userNo, // userNo를 payload에 추가
        },
      });
    }
  };

  const decrementQuantity = (productNo) => {
    const item = cartItems.find((item) => item.product.no === productNo);
    if (item.quantity > 1) {
      dispatch({
        type: "ADD_TO_CART",
        payload: { product: item.product, quantity: -1, userNo },
      });
    }
  };

 // 상품 상세 페이지
 const handleProductClick = (productNo) => {
  navigate(`/user/shop/productlist/detail/${productNo}`); 
};

  const handleOrder = () => {
    const total = getTotalCartPrice();
    const selectedCartItems = cartProductInfo
      .filter((item) => selectedItems.includes(item.no))
      .map((item) => ({
        productNo: item.no,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discountRate: item.discountRate,
        resultPrice: item.resultPrice,
      }));

    dispatch({
      type: "CREATE_ORDER",
      payload: { items: selectedCartItems, total: total, userNo }, // 필요한 정보들을 저장
    });

    navigate(`/user/shop/order/detail`); // 주문 페이지로 이동
  };

  return (
    <>
      <h2 className={styles.cartTitle}>장바구니</h2>
      {cartItems.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <>
          <div className={styles.cartContainer}>
            {cartProductInfo.map((item) => (
              <div key={item.no} className={styles.cartItem}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.no)}
                  onChange={() => handleCheckboxChange(item.no)}
                  disabled={item.stock === 0 || !item.purchaseCheck}
                />
                &nbsp;&nbsp;
                <span>
                  <img src={item.pic} alt={item.name} />
                </span>
                &nbsp;&nbsp;
                <span
                  onClick={() => handleProductClick(item.no)} // 클릭 시 상세 페이지로 이동
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {item.name}
                </span>
                <div className={styles.cartQuantity}>
                  <button className={`btn1`} onClick={() => decrementQuantity(item.no)}>-</button>
                  <span>{item.quantity}</span>
                  <button
                    className={`btn1`}
                    onClick={() => incrementQuantity(item.no)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                &nbsp;&nbsp;
                <span className={styles.cartItemPrice}>
                  {item.price.toLocaleString()}원
                </span>
                &emsp;
                <span>
                  {item.discountRate < 1 ? "" : `${item.discountRate}% 할인`}
                </span>
                &emsp;
                <span className={styles.cartItemPrice}>
                  {item.resultPrice.toLocaleString()}원
                </span>
                {item.stock === 0 && (
                  <div className={styles.stockWarning}>품절</div>
                )}
                {item.stock > 0 && item.quantity >= item.stock && (
                  <div className={styles.stockWarning}>
                    재고가 {item.stock}개 남았습니다
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <button
              className={`btn2`}
              onClick={handleRemoveSelected}
              disabled={selectedItems.length === 0}
            >
              선택 삭제
            </button>
          </div>
          <div>
            <div className={styles.cartTotalPrice}>
              <h3>총 가격: {getTotalCartPrice().toLocaleString()}원</h3>
              <button
                className={`btn2`}
                onClick={handleOrder}
                disabled={selectedItems.length === 0}
              >
                주문하기
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
