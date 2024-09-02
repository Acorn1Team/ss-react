import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PurchasePage() {
  const navigate = useNavigate(); // 페이지 이동
  const location = useLocation();
  const { items, total, user, selectedCoupon } = location.state || {}; // 구매 완료 시 전달된 상태 받기

  const handleGoHome = () => {
    navigate('/'); // 홈 페이지로 이동
  };

  const handleViewOrders = () => {
    // 주문 내역 페이지로 이동하며 주문 관련 데이터를 함께 전달
    navigate('/user/mypage/order', {
      state: { items, total, user, selectedCoupon },
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>구매가 완료되었습니다</h2>
      <button 
        onClick={handleGoHome} 
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          marginTop: '20px',
          cursor: 'pointer',
          marginRight: '10px' // 두 버튼 사이에 약간의 간격 추가
        }}
      >
        홈으로 가기
      </button>
      <button 
        onClick={handleViewOrders} 
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        주문내역 보기
      </button>
    </div>
  );
}
