const initialCartState = {
  cartItems: JSON.parse(localStorage.getItem("cart")) || {},
};

const CartReducer = (state = initialCartState, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      if (!action.payload || !action.payload.userNo) {
        console.error("ADD_TO_CART action is missing userNo or payload.");
        return state;
      }

      const { product, quantity, userNo } = action.payload;
      const existingItems = Array.isArray(state.cartItems[userNo])
        ? state.cartItems[userNo]
        : [];

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
        console.error("REMOVE_FROM_CART action is missing userNo or productNo.");
        return state;
      }

      const updatedItems = Array.isArray(state.cartItems[userNo])
        ? state.cartItems[userNo].filter((i) => i.product.no !== productNo)
        : [];

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
      const { userNo, purchasedItems } = action.payload || {};
      if (!userNo || !purchasedItems) {
        console.error("CLEAR_CART action is missing userNo or purchasedItems.");
        return state;
      }

      // 구매되지 않은 항목만 남김
      const updatedItems = state.cartItems[userNo].filter(
        (cartItem) => !purchasedItems.includes(cartItem.product.no)
      );

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

    case "UPDATE_CART": {
      const { updatedCartItems, userNo } = action.payload;

      return {
        ...state,
        cartItems: {
          ...state.cartItems,
          [userNo]: updatedCartItems[userNo],
        },
      };
    }

    default:
      return state;
  }
};

export default CartReducer;
