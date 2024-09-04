// src/store.js
import { createStore, combineReducers } from "redux";
import CartReducer from "./reducers/CartReducer";
import LoadingReducer from "./reducers/LoadingReducer";
import OrderReducer from "./reducers/OrderReducer";

const rootReducer = combineReducers({
  loading: LoadingReducer,
  cart: CartReducer,
  order: OrderReducer,
});

const store = createStore(rootReducer);

export default store;
