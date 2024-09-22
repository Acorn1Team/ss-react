import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../Style/CartList.module.css";
import "../Style/All.css"; // 버튼 스타일

export default function CartList() {
  const userNo = sessionStorage.getItem("id");
  const cartItems = useSelector((state) => state.cart.cartItems[userNo] || []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);
  const [cartProductInfo, setCartProductInfo] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 추가

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

      const filteredProducts = cartItems
        .map((ci) => {
          const stockInfo = stockData.find(
            (stock) => stock.productNo === ci.product.no
          );

          const availableStock = stockInfo ? stockInfo.stock : 0;
          const available = stockInfo ? stockInfo.available : false;

          const fixedDiscountPrice =
            ci.product.discountRate > 0
              ? ci.product.price * (1 - ci.product.discountRate / 100)
              : ci.product.price;

          return {
            no: ci.product.no,
            pic: ci.product.pic,
            name: ci.product.name,
            quantity: ci.quantity,
            price: ci.product.price,
            discountRate: ci.product.discountRate,
            fixedDiscountPrice,
            resultPrice:
              ci.product.discountRate > 0
                ? ci.product.price *
                  (1 - ci.product.discountRate / 100) *
                  ci.quantity
                : ci.product.price * ci.quantity,
            stock: availableStock,
            available,
            purchaseCheck: ci.quantity <= availableStock && available,
          };
        })
        .filter((item) => item.available);

      setCartProductInfo(filteredProducts);
    } catch (error) {
      console.error("재고 정보를 가져오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (userNo) {
      fetchStockInfo();
    }
  }, [cartItems, userNo]);

  const toggleSelectAll = () => {
    setErrorMessage(""); // 에러 메시지 초기화
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      const selectableItems = cartProductInfo
        .filter((item) => item.purchaseCheck)
        .map((item) => item.no);
      setSelectedItems(selectableItems);
    }
    setIsAllSelected(!isAllSelected);
  };

  const getTotalCartPriceBefore = () => {
    return selectedItems.reduce((total, productNo) => {
      const selectedItem = cartProductInfo.find(
        (item) => item.no === productNo
      );
      return (
        total +
        (selectedItem
          ? parseInt(selectedItem.price * selectedItem.quantity)
          : 0)
      );
    }, 0);
  };

  const getTotalCartPrice = () => {
    return selectedItems.reduce((total, productNo) => {
      const selectedItem = cartProductInfo.find(
        (item) => item.no === productNo
      );
      return total + (selectedItem ? parseInt(selectedItem.resultPrice) : 0);
    }, 0);
  };

  const handleCheckboxChange = (productNo) => {
    setErrorMessage(""); // 에러 메시지 초기화
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
    setSelectedItems([]);
  };

  const handleRemoveItem = (productNo) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: { productNo, userNo },
    });
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
          userNo,
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

  const handleProductClick = (productNo) => {
    navigate(`/user/shop/productlist/detail/${productNo}`);
  };

  const handleOrder = () => {
    if (selectedItems.length === 0) {
      setErrorMessage("선택한 상품이 없습니다."); // 에러 메시지 설정
      return;
    }

    // 주문 처리 로직...
    // 주문 성공 시 에러 메시지 초기화
    setErrorMessage("");

    const total = getTotalCartPrice();

    const purchasedItems = selectedItems;

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
      payload: { items: selectedCartItems, total: total, userNo },
    });

    dispatch({
      type: "CLEAR_CART",
      payload: { userNo, purchasedItems },
    });

    navigate(`/user/shop/order/detail`);
  };

  return (
    <>
      <h2 className={styles.cartTitle}>장바구니</h2>
      {cartItems.length === 0 || cartItems[userNo]?.length === 0 ? (
        <p className={styles.cartContainer}>장바구니가 비어 있습니다.</p>
      ) : (
        <>
          <div className={styles.cartContainer}>
            <div className={styles.cartHeader}>
              <label>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
                전체 선택
              </label>
              <input
                type="button"
                value="선택 삭제"
                onClick={handleRemoveSelected}
                disabled={selectedItems.length === 0}
              />
            </div>

            {cartProductInfo.map((item) => (
              <div key={item.no} className={styles.cartItem}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.no)}
                  onChange={() => handleCheckboxChange(item.no)}
                />
                <div
                  onClick={() => handleProductClick(item.no)}
                  className={styles.cartItemContainer}
                  style={{ cursor: "pointer", display: "flex" }}
                >
                  <img src={item.pic} alt={item.name} />
                  <div className={styles.cartItemDetails}>
                    {item.name}
                    {item.discountRate === 0 ? (
                      <div className={styles.cartItemPriceDiscounted}>
                        {item.price.toLocaleString()}원
                      </div>
                    ) : (
                      <>
                        <div className={styles.cartItemPriceOriginal}>
                          {item.price.toLocaleString()}원
                        </div>
                        <div className={styles.cartItemPriceDiscounted}>
                          {item.fixedDiscountPrice.toLocaleString()}원
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.cartQuantityWrapper}>
                  <div className={styles.cartQuantity}>
                    <button
                      style={{ color: "#c7727e" }}
                      onClick={() => decrementQuantity(item.no)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      style={{ color: "#c7727e" }}
                      onClick={() => incrementQuantity(item.no)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  {item.stock > 0 && item.quantity >= item.stock && (
                    <div className={styles.stockWarning}>
                      재고가 {item.stock}개 남았습니다
                    </div>
                  )}
                </div>
                <span className={styles.cartItemPrice}>
                  {item.resultPrice.toLocaleString()}원
                </span>
                <input
                  type="button"
                  value="X"
                  className={styles.rmButton}
                  onClick={() => handleRemoveItem(item.no)}
                />
              </div>
            ))}

            <div className={styles.cartFooter}>
              <div className={styles.totalPrice}>
                <div id={styles.originalPrice}>
                  {getTotalCartPriceBefore().toLocaleString()}원
                </div>
                <div id={styles.discountAmount}>
                  -{" "}
                  {(
                    getTotalCartPriceBefore() - getTotalCartPrice()
                  ).toLocaleString()}
                  원
                </div>
                <div id={styles.finalPrice}>
                  총 {getTotalCartPrice().toLocaleString()}원
                </div>
              </div>
              <button
                className="btn2"
                onClick={handleOrder}
                // 주문하기 버튼은 항상 활성화된 상태로 유지합니다.
                // disabled={selectedItems.length === 0}
              >
                주문하기
              </button>

              {/* 에러 메시지 출력 */}
              {errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
