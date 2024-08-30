import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

export default function CartList() {
  const cartItems = useSelector((state) => state.cart.cartItems); // Redux 스토어의 장바구니 항목 가져오기
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);

  const getTotalCartPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckboxChange = (productNo) => {
    if (selectedItems.includes(productNo)) {
      setSelectedItems(selectedItems.filter((no) => no !== productNo));
    } else {
      setSelectedItems([...selectedItems, productNo]);
    }
  };

  const handleRemoveSelected = () => {
    selectedItems.forEach((productNo) =>
      dispatch({ type: "REMOVE_FROM_CART", payload: productNo })
    );
    setSelectedItems([]); // 선택 목록 초기화
  };

  const incrementQuantity = (productNo) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { product: cartItems.find((item) => item.product.no === productNo).product, quantity: 1 },
    });
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
     // orderNo를 각 장바구니 항목의 ID들을 기반으로 생성 (예: 콤마로 연결)
     const orderNo = selectedItems.join(',');
    navigate(`/user/shop/order/detail/${orderNo}`); // 주문 페이지로 이동
  };

  return (
    <>
      <h2>장바구니</h2>
      {cartItems.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <>
          <div>
            {cartItems.map((item) => (
              <div key={item.product.no}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.product.no)}
                  onChange={() => handleCheckboxChange(item.product.no)}
                />
                &nbsp;&nbsp;
                <span>
                  <img 
                    src={item.product.pic} 
                    alt={item.product.name} 
            
                  />
                </span>&nbsp;&nbsp;
                <span>{item.product.name}</span>&nbsp;&nbsp;
                <button onClick={() => decrementQuantity(item.product.no)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => incrementQuantity(item.product.no)}>+</button>&nbsp;&nbsp;
                <span>{item.product.price * item.quantity}원</span>&nbsp;&nbsp; {/* 상품 가격 * 수량 계산 후 표시 */}
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_FROM_CART", payload: item.product.no })
                  }
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          <div>
            <button onClick={handleRemoveSelected} disabled={selectedItems.length === 0}>
              선택 삭제
            </button>
          </div>
          <div>
            <h3>총 가격: {getTotalCartPrice()}원</h3>
             <button onClick={handleOrder} disabled={selectedItems.length === 0}>
              주문하기
            </button>
          </div>
        </>
      )}
    </>
  );
}
