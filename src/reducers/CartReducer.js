// src/reducers/cartReducer.js

const initialCartState = {
  cartItems: JSON.parse(localStorage.getItem("cart")) || [],
};

const CartReducer = (state = initialCartState, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const item = action.payload;
      const existingItem = state.cartItems.find(
        (i) => i.product.no === item.product.no
      );

      let updatedCartItems;
      if (existingItem) {
        updatedCartItems = state.cartItems.map((i) =>
          i.product.no === item.product.no
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        updatedCartItems = [...state.cartItems, item];
      }

      localStorage.setItem("cart", JSON.stringify(updatedCartItems));

      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }
    case "REMOVE_FROM_CART": {
      const productNo = action.payload;
      const updatedCartItems = state.cartItems.filter(
        (i) => i.product.no !== productNo
      );

      localStorage.setItem("cart", JSON.stringify(updatedCartItems));

      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }
    case "CLEAR_CART":
      localStorage.removeItem("cart");
      return {
        ...state,
        cartItems: [],
      };
    default:
      return state;
  }
};

export default CartReducer;
