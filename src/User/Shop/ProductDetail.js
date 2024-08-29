import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import ProductReviews from "./ProductReviews";

export default function ProductDetail() {
  // 제품상세보기
  const { no, productNo } = useParams();
  const [product, setProduct] = useState({});
  const [count, setCount] = useState(1); // 수량을 상태로 관리
  //const [reviews, setReviews] = useState([]); // 리뷰 데이터 상태 추가
  const [averageRating, setAverageRating] = useState(0); // 평균 평점 상태 추가

  //const userNo = 11;

  const refresh = (no) => {
    // Ajax 요청으로 선택된 카테고리에 해당하는 제품 상세 정보를 가져옴
    axios
      .get(`/list/product/${no}`)
      .then((res) => {
        console.log(res.data);
        setProduct(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
};


  useEffect(() => {
    refresh(no); // 컴포넌트가 마운트될 때, 그리고 no가 변경될 때마다 요청을 보냄
  }, [no]);

  // 할인율에 따른 가격 계산
  const getDiscountedPrice = () => {
    if (product.discountRate > 0) {
      return product.price - product.price * (product.discountRate / 100);
    } else {
      return product.price;
    }
  };


  // 총 가격 계산 (수량에 따른 가격)
  const getTotalPrice = () => {
    return getDiscountedPrice() * count;
  };

  // 수량 증가
  const incrementQuantity = () => {
    setCount((prevQuantity) => prevQuantity + 1);
  };

  // 수량 감소 (최소 1로 제한)
  const decrementQuantity = () => {
    setCount((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };


 // 장바구니에 제품 추가
 const addToCart = () => {
  axios
    .post("/cart/add", {
      userNo: 11, // 사용자 ID
      productNo: productNo, // 제품 번호
      quantity: count // 수량
    })
    .then((response) => {
      alert("장바구니에 추가되었습니다.");
      console.log(response.data);
    })
    .catch((error) => {
      console.error("장바구니에 제품을 추가하는데 문제가 발생했습니다.", error);
      alert("장바구니 추가에 실패했습니다.");
    });
};


  return (
    <>
      <h2>상품 상세 정보</h2>
      <div>
        <label>이름: </label>
        <span>{product.name}</span>
      </div>
      <div>
        <label>수량: </label>
        <button onClick={decrementQuantity}>-</button>
        <span>{count}</span>
        <button onClick={incrementQuantity}>+</button>
      </div>
      <div>
        <label>가격: </label>
        <span>{getTotalPrice()}</span> {/* 수량에 따른 총 가격을 표시 */}
        {product.discountRate > 0 && <span>{/* {product.price} 원 */}</span>}
      </div>
      <div>
        <label>할인율: </label>
        <span>{product.discountRate}</span>
      </div>
      <div>
        <button onClick={addToCart}>장바구니에 담기</button>
      </div>
      <Link to={`/cart/list/${productNo}`}>장바구니</Link>
      <div>
        <label>상품 설명: </label>
        <span>{product.contents}</span>
      </div>
      <div>
        <label>카테고리: </label>
        <span>{product.category}</span>
      </div>
      <div>
        <label>이미지: </label>
        <img src={product.pic} alt={product.name} />
      </div>
      <div>
        {/* <label>평점: </label>
   
        {/* <div>상품 평점이랑 리뷰 평점이랑 같아야 되 (체크)</div> */}
      </div>
      <Link to={`/user/style/write/${no}`}>커뮤니티 공유하기</Link>
      <br />
      <div>
        <label>리뷰 보기: </label>
        {/* <ProductReviews /> */}
        <ProductReviews setAverageRating={setAverageRating} /> {/* 리뷰 컴포넌트에 리뷰 데이터 전달 */}
      </div>
      <br />
    </>
  );
}
