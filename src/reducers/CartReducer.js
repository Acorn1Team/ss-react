const initialCartState = {
  cartItems: JSON.parse(localStorage.getItem("cart")) || {},
};

const CartReducer = (state = initialCartState, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      // action.payload가 없는 경우를 방지
      if (!action.payload || !action.payload.userNo) {
        console.error("ADD_TO_CART action is missing userNo or payload.");
        return state;
      }

      const { product, quantity, userNo } = action.payload;
      // userNo에 대한 기존 항목이 배열인지 확인
      const existingItems = Array.isArray(state.cartItems[userNo])
        ? state.cartItems[userNo]
        : []; // 배열이 아닐 경우 빈 배열로 초기화

      const existingItem = existingItems.find(
        (i) => i.product.no === product.no
      );

      let updatedItems;
      if (existingItem) {
        // 기존 항목이 있으면 수량을 업데이트
        updatedItems = existingItems.map((i) =>
          i.product.no === product.no
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        // 새로운 항목을 추가
        updatedItems = [...existingItems, { product, quantity }];
      }

      // 상태 업데이트
      const updatedCartItems = {
        ...state.cartItems,
        [userNo]: updatedItems,
      };

      // 로컬 스토리지 업데이트
      localStorage.setItem("cart", JSON.stringify(updatedCartItems));

      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }

    case "REMOVE_FROM_CART": {
      const { productNo, userNo } = action.payload || {};
      if (!userNo || !productNo) {
        console.error(
          "REMOVE_FROM_CART action is missing userNo or productNo."
        );
        return state;
      }

      // userNo에 대한 기존 항목이 배열인지 확인
      const updatedItems = Array.isArray(state.cartItems[userNo])
        ? state.cartItems[userNo].filter((i) => i.product.no !== productNo)
        : []; // 배열이 아닐 경우 빈 배열로 초기화

      // 상태 업데이트
      const updatedCartItems = {
        ...state.cartItems,
        [userNo]: updatedItems,
      };

      // 로컬 스토리지 업데이트
      localStorage.setItem("cart", JSON.stringify(updatedCartItems));

      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }

    case "CLEAR_CART": {
      const { userNo } = action.payload || {};
      if (!userNo) {
        console.error("CLEAR_CART action is missing userNo.");
        return state;
      }

      // 장바구니에서 사용자의 항목을 빈 배열로 설정
      const updatedCartItems = {
        ...state.cartItems,
        [userNo]: [],
      };

      // 로컬 스토리지에서 해당 사용자의 장바구니 항목을 삭제
      localStorage.setItem("cart", JSON.stringify(updatedCartItems));

      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }

    default:
      return state;
  }
};

export default CartReducer;
