import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../Style/CartList.module.css";
import "../Style/All.css"; // button styles

export default function CartList() {
  const userNo = sessionStorage.getItem("id");
  const cartItems = useSelector((state) => state.cart.cartItems[userNo] || []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 선택된 장바구니 아이템과 장바구니에 표시할 상품 정보를 관리하는 상태
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartProductInfo, setCartProductInfo] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false); // 전체 선택 상태 관리

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

      // 판매 가능하고 재고가 있는 상품만 필터링
      const filteredProducts = cartItems
        .map((ci) => {
          // 각 상품에 대한 재고 및 판매 가능 정보 찾기
          const stockInfo = stockData.find(
            (stock) => stock.productNo === ci.product.no
          );

          // 재고와 판매 가능 여부를 설정
          const availableStock = stockInfo ? stockInfo.stock : 0;
          const available = stockInfo ? stockInfo.available : false;

          // 고정된 할인된 가격 계산
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
            fixedDiscountPrice, // 고정된 할인된 가격
            resultPrice:
              ci.product.discountRate > 0
                ? ci.product.price *
                  (1 - ci.product.discountRate / 100) *
                  ci.quantity
                : ci.product.price * ci.quantity,
            stock: availableStock, // 상품의 재고
            available, // 판매 가능 여부
            purchaseCheck: ci.quantity <= availableStock && available, // 재고와 판매 가능 여부 체크
          };
        })
        .filter((item) => item.available); // 판매 종료된 상품을 필터링

      setCartProductInfo(filteredProducts);
    } catch (error) {
      console.error("Error fetching stock info:", error);
    }
  };

  // 재고 정보 체크
  useEffect(() => {
    if (userNo) {
      fetchStockInfo();
    }
  }, [cartItems, userNo]);

  // 전체 선택 및 해제 기능
  const toggleSelectAll = () => {
    if (isAllSelected) {
      // 전체 선택 해제
      setSelectedItems([]);
    } else {
      // 전체 선택
      const selectableItems = cartProductInfo
        .filter((item) => item.purchaseCheck)
        .map((item) => item.no);
      setSelectedItems(selectableItems);
    }
    setIsAllSelected(!isAllSelected);
  };

  useEffect(() => {
    const selectableItems = cartProductInfo.filter(
      (item) => item.purchaseCheck
    ).length;
    if (selectedItems.length === selectableItems && selectableItems > 0) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedItems, cartProductInfo]);

  // 총 가격을 계산하는 함수
  const getTotalCartPrice = () => {
    return selectedItems.reduce((total, productNo) => {
      const selectedItem = cartProductInfo.find(
        (item) => item.no === productNo
      );
      return total + (selectedItem ? parseInt(selectedItem.resultPrice) : 0);
    }, 0);
  };

  // 체크박스 변경 시 호출, 선택한 아이템을 관리하는 함수
  const handleCheckboxChange = (productNo) => {
    const selectedItem = cartProductInfo.find((item) => item.no === productNo);

    // 재고가 있고 구매 가능한 상품만 선택할 수 있음
    if (selectedItem && selectedItem.purchaseCheck) {
      if (selectedItems.includes(productNo)) {
        setSelectedItems(selectedItems.filter((no) => no !== productNo));
      } else {
        setSelectedItems([...selectedItems, productNo]);
      }
    }
  };

  // 선택된 상품을 장바구니에서 제거하는 함수
  const handleRemoveSelected = () => {
    selectedItems.forEach((productNo) =>
      dispatch({
        type: "REMOVE_FROM_CART",
        payload: { productNo, userNo },
      })
    );
    // 선택된 아이템 목록 초기화
    setSelectedItems([]);
  };

  // **개별 상품을 삭제하는 함수**
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

  // 상품 클릭 시 상세 페이지로 이동
  const handleProductClick = (productNo) => {
    navigate(`/user/shop/productlist/detail/${productNo}`);
  };

  // 선택된 상품을 주문하는 함수
  const handleOrder = () => {
    const total = getTotalCartPrice();

    // 선택된 상품들을 주문 항목으로 변환
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

    // 주문 생성
    dispatch({
      type: "CREATE_ORDER",
      payload: { items: selectedCartItems, total: total, userNo },
    });

    // 주문 완료 후 주문 상세 페이지로 이동
    navigate(`/user/shop/order/detail`);
  };

  return (
    <>
      <h2 className={styles.cartTitle}>장바구니</h2>
      {cartItems.length === 0 ? (
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
                <img src={item.pic} alt={item.name} />
                <div className={styles.cartItemDetails}>
                  <span
                    onClick={() => handleProductClick(item.no)} // 클릭 시 상품 상세 페이지로 이동
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    {item.name}
                  </span>
                  <div className={styles.cartItemPriceOriginal}>
                    {item.price.toLocaleString()}
                  </div>
                  <div className={styles.cartItemPriceDiscounted}>
                    {item.fixedDiscountPrice.toLocaleString()}
                  </div>
                </div>
                {/* {item.stock === 0 && (
                  <div className={styles.stockWarning}>품절</div> // 재고가 0일 경우 품절 표시
                )}
                {item.stock > 0 && item.quantity >= item.stock && (
                  <div className={styles.stockWarning}>
                    재고가 {item.stock}개 남았습니다
                  </div> // 재고가 한정적일 때 재고량 표시
                )} */}
                <div className={styles.cartQuantityWrapper}>
                  <div className={styles.cartQuantity}>
                    <button onClick={() => decrementQuantity(item.no)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
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
              <span className={styles.totalPrice}>
                총 가격: {getTotalCartPrice().toLocaleString()}원
              </span>
              <button
                className="btn4"
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
