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
      const existingItems = state.cartItems[userNo] || [];

      const existingItem = existingItems.find(
        (i) => i.product.no === product.no
      );

      let updatedItems;
      if (existingItem) {
        updatedItems = existingItems.map((i) =>
          i.product.no === product.no
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        updatedItems = [...existingItems, { product, quantity }];
      }

      const updatedCartItems = {
        ...state.cartItems,
        [userNo]: updatedItems,
      };

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

      const updatedItems =
        state.cartItems[userNo]?.filter((i) => i.product.no !== productNo) ||
        [];

      const updatedCartItems = {
        ...state.cartItems,
        [userNo]: updatedItems,
      };

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
