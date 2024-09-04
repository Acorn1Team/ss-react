// src/reducers/cartReducer.js

const initialCartState = {
  // 초기 상태 정의 - 로컬 스토리지에서 장바구니 항목을 가져와 초기 상태로 설정
  cartItems: JSON.parse(localStorage.getItem("cart")) || [],
};

// 장바구니 리듀서 정의
const CartReducer = (state = initialCartState, action) => {
  switch (action.type) {
    // 장바구니에 항목 추가 액션 처리
    case "ADD_TO_CART": {
      const item = action.payload; // 액션 페이로드로 전달된 새 항목을 가져옴
      const existingItem = state.cartItems.find(
        (i) => i.product.no === item.product.no
      );

      // 장바구니에 동일한 제품이 있는지 확인
      let updatedCartItems;
      if (existingItem) {
        // 이미 장바구니에 동일한 제품이 있으면 수량을 증가
        updatedCartItems = state.cartItems.map((i) =>
          i.product.no === item.product.no
            ? { ...i, quantity: i.quantity + item.quantity } // 기존 항목의 수량 업데이트
            : i
        );
      } else {
        // 장바구니에 동일한 제품이 없으면 새 항목을 추가
        updatedCartItems = [...state.cartItems, item];
      }

      // 업데이트된 장바구니 항목을 로컬 스토리지에 저장
      localStorage.setItem("cart", JSON.stringify(updatedCartItems));

      // 상태를 업데이트하여 새로운 장바구니 항목을 반환
      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }

    // 장바구니에서 특정 항목을 제거하는 액션 처리
    case "REMOVE_FROM_CART": {
      const productNo = action.payload;
      const updatedCartItems = state.cartItems.filter(
        (i) => i.product.no !== productNo
      );

      // 업데이트된 장바구니 항목을 로컬 스토리지에 저장
      localStorage.setItem("cart", JSON.stringify(updatedCartItems));

      // 상태를 업데이트하여 새로운 장바구니 항목을 반환
      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }

    // 장바구니를 비우는 액션 처리
    case "CLEAR_CART":
      localStorage.removeItem("cart");

      // 장바구니 항목을 빈 배열로 설정
      return {
        ...state,
        cartItems: [],
      };

    // 위에서 처리되지 않은 액션 타입에 대해서는 기존 상태를 그대로 반환
    default:
      return state;
  }
};

export default CartReducer;
