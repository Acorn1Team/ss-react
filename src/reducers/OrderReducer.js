// src/reducers/orderReducer.js
const initialOrderState = {
  orderItems: [], // 주문 항목 저장
  orderTotal: 0, // 주문 총 가격
};

const OrderReducer = (state = initialOrderState, action) => {
  switch (action.type) {
    // 주문 생성 액션 처리
    case "CREATE_ORDER": {
      return {
        ...state,
        orderItems: action.payload.items, // 상품번호, 수량, 할인 적용된 가격 저장
        orderTotal: action.payload.total, // 총 가격 저장
      };
    }

    // 주문 초기화 액션 처리
    case "CLEAR_ORDER": {
      return {
        ...state,
        orderItems: [],
        orderTotal: 0,
      };
    }

    default:
      return state;
  }
};

export default OrderReducer;
