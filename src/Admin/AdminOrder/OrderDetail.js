import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function OrderDetail() {
  const { orderNo } = useParams(); // URL에서 주문 번호 가져오기
  const [orderDetail, setOrderDetail] = useState(null); // 전체 주문 정보 상태
  const [productInfo, setProductInfo] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`/admin/orders/detail/${orderNo}`)
      .then((response) => {
        setOrderDetail(response.data.order);
        setProductInfo(response.data.product);
      })
      .catch((error) => {
        console.error(
          "주문 상세 정보를 가져오는 중 오류가 발생했습니다!",
          error
        );
        setError("주문 상세 정보를 가져오는 중 오류가 발생했습니다.");
      });
  }, [orderNo]);

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    return new Intl.NumberFormat().format(price);
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!orderDetail) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h2>주문 상세 정보</h2>

      {/* 주문 정보 */}
      <div>
        <h3>주문 정보</h3>
        <p>
          <strong>주문 번호:</strong> {orderDetail.no}
        </p>
        <p>
          <strong>유저 ID:</strong> {orderDetail.userId}
        </p>{" "}
        {/* userId 추가 */}
        <p>
          <strong>상태:</strong> {orderDetail.state}
        </p>
        <p>
          <strong>주문일:</strong> {new Date(orderDetail.date).toLocaleString()}
        </p>
        <p>
          <strong>총액:</strong> {formatPrice(orderDetail.price)}원
        </p>
        <p>
          <strong>총 수량:</strong> {orderDetail.totalQuantity}
        </p>
      </div>

      {/* 주문 상품 목록 */}
      <h3>주문한 상품들</h3>
      <table border="1" style={{ width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>상품 번호</th>
            <th>상품명</th>
            <th>수량</th>
            <th>가격</th>
          </tr>
        </thead>
        <tbody>
          {orderDetail.orderProducts.map((p) => (
            <tr key={p.productNo}>
              <td>{p.productNo}</td>
              <td>{productInfo[p.productNo]}</td>
              <td>{p.quantity}</td>
              <td>{formatPrice(p.price)}원</td> {/* 가격 포맷팅 적용 */}
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/admin/orders">뒤로가기</Link>
    </div>
  );
}
