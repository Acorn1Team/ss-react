import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../Style/CartList.module.css";

export default function CartList() {
  const cartItems = useSelector((state) => state.cart.cartItems); // Redux 스토어의 장바구니 항목 가져오기
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);
  // 사용자가 선택한 장바구니 항목을 저장
  const [cartProductInfo, setCartProductInfo] = useState([]);
  // 장바구니에 담긴 제품 정보 및 재고 상태를 저장

  const fetchStockInfo = async () => {
    try {
      const productNos = cartItems.map((ci) => ci.product.no);
      const response = await axios.post("/cart/stock", productNos, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const stockData = response.data;
      // console.log(stockData);
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
            stock: availableStock, // 서버에서 받은 재고 정보를 사용
            purchaseCheck: ci.quantity <= availableStock,
          };
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStockInfo(); // 컴포넌트가 로드될 때 재고 정보 불러오기
  }, [cartItems]);

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

    // 재고보다 많은 수량이 선택됐을 때 선택을 해제하거나, 재고가 0이면 체크 안되도록 함
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
      dispatch({ type: "REMOVE_FROM_CART", payload: productNo })
    );
    setSelectedItems([]); // 선택 목록 초기화
  };

  const incrementQuantity = (productNo) => {
    const selectedItem = cartProductInfo.find((item) => item.no === productNo);

    // 재고 초과 시 더 이상 수량을 추가하지 않음
    if (selectedItem && selectedItem.quantity < selectedItem.stock) {
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          product: cartItems.find((item) => item.product.no === productNo)
            .product,
          quantity: 1,
        },
      });
    }
  };

  const decrementQuantity = (productNo) => {
    const item = cartItems.find((item) => item.product.no === productNo);
    if (item.quantity > 1) {
      dispatch({
        type: "ADD_TO_CART",
        payload: { product: item.product, quantity: -1 },
      });
    }
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
        resultPrice: item.resultPrice, // 할인 적용된 가격
      }));

    // 주문 생성 액션 디스패치
    dispatch({
      type: "CREATE_ORDER",
      payload: { items: selectedCartItems, total: total }, // 필요한 정보들을 저장
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
                <span>{item.name}</span>&nbsp;&nbsp;
                <div className={styles.cartQuantity}>
                  <button onClick={() => decrementQuantity(item.no)}>-</button>
                  <span>{item.quantity}</span>
                  <button
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
                  총 {item.resultPrice.toLocaleString()}원
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
          <div className={styles.cartActions}>
            <button
              className={styles.removeButton}
              onClick={handleRemoveSelected}
              disabled={selectedItems.length === 0}
            >
              선택 삭제
            </button>
            <div className={styles.cartTotalPrice}>
              <h3>총 가격: {getTotalCartPrice().toLocaleString()}원</h3>
              <button
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
