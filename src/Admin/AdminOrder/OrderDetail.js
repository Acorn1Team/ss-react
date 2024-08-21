import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function OrderDetail() {
  const { orderNo } = useParams(); // URL에서 주문 번호 가져오기
  const [order, setOrder] = useState(null);
  const [productInfo, setProductInfo] = useState({});
  const [error, setError] = useState(null);

  

  useEffect(() => {
    axios.get(`/admin/orders/detail/${orderNo}`)
      .then(response => {
        setOrder(response.data.order.orderProducts);
        setProductInfo(response.data.product);
      })
      .catch(error => {
        console.error('주문 상세 정보를 가져오는 중 오류가 발생했습니다!', error);
        setError('주문 상세 정보를 가져오는 중 오류가 발생했습니다.');
      });
  }, [orderNo]);

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!order) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h2>주문 상세 정보</h2>
      
      
      
      {/* 주문 상품 목록 */}
      <h3>주문한 상품들</h3>
      <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>상품 번호</th>
            <th>상품명</th>
            <th>수량</th>
            <th>가격</th>
          </tr>
        </thead>
        <tbody>
          {order.map(p => (
            <tr key={p.no}>
              <td>{p.productNo}</td>
              <td>{productInfo[(p.productNo)]}</td>
              <td>{p.quantity}</td>
              <td>{p.price * p.quantity}원</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Link to="/admin/orders">뒤로가기</Link>
    </div>
  );
}
