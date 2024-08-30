// // src/store.js
// import { createStore } from "redux";

// // 초기 상태
// const initialState = {
//   loading: false,
// };

// // 리듀서 정의
// const rootReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case "SET_LOADING":
//       return {
//         ...state,
//         loading: action.payload,
//       };
//     default:
//       return state;
//   }
// };

// // 스토어 생성
// const store = createStore(rootReducer);

// export default store;

// src/store.js
import { createStore, combineReducers } from "redux";
import CartReducer from "./reducers/CartReducer";
import LoadingReducer from "./reducers/LoadingReducer";

const rootReducer = combineReducers({
  loading: LoadingReducer,
  cart: CartReducer,
});

const store = createStore(rootReducer);

export default store;
