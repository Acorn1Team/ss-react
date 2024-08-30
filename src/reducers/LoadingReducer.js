// src/reducers/loadingReducer.js

const initialLoadingState = {
  loading: false,
};

const LoadingReducer = (state = initialLoadingState, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export default LoadingReducer;
