import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrderManage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // 필터링된 주문 목록
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [error, setError] = useState(null); // 에러 메시지 상태 추가

  useEffect(() => {
    // 주문 목록을 가져오는 API 호출
    axios.get('/admin/orders')
      .then(response => {
        setOrders(response.data);  // 받은 주문 데이터를 상태로 설정
        setFilteredOrders(response.data); // 필터링된 주문 목록 초기화
      })
      .catch(error => {
        console.error('주문 목록을 가져오는 중 오류가 발생했습니다!', error);
        setError('주문 목록을 가져오는 중 오류가 발생했습니다.'); // 에러 메시지 설정
      });
  }, []);

  const handleStatusChange = (orderNo, status) => {
    // 상태 변경 전에 확인 메시지를 표시
    const confirmation = window.confirm(`주문 상태를 '${status}'로 변경하시겠습니까?`);
    if (!confirmation) return;

    // 주문 상태를 업데이트하는 API 호출
    axios.put(`/admin/orders/${orderNo}/status`, { status: status })
      .then(response => {
        setError(null); // 에러 메시지 초기화
        // 주문 목록을 갱신
        const updatedOrders = orders.map(order =>
          order.no === orderNo ? { ...order, state: status } : order
        );
        setOrders(updatedOrders);
        filterOrders(searchTerm, updatedOrders); // 필터링된 목록 갱신
      })
      .catch(error => {
        console.error('주문 상태를 업데이트하는 중 오류가 발생했습니다!', error);
        setError('주문 상태 업데이트에 실패했습니다.'); // 에러 메시지 설정
      });
  };

  const filterOrders = (term, ordersList) => {
    // 검색어에 따라 주문 목록을 필터링
    const filtered = ordersList.filter(order =>
      order.userId.includes(term) || order.state.includes(term)
    );
    setFilteredOrders(filtered);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterOrders(term, orders); // 검색어 변경 시 필터링 수행
  };

  return (
    <div>
      <h2>주문 관리</h2>
      <input
        type="text"
        placeholder="검색어를 입력하세요 (유저 ID, 상태)"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '10px', padding: '5px', width: '300px' }}
      />
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} {/* 에러 메시지 표시 */}
      <table border="1">
        <thead>
          <tr>
            <th>번호</th>
            <th>유저 ID</th>
            <th>상태</th>
            <th>주문일</th>
            <th>총액</th>
            <th>변경</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.no}>
              <td>{order.no}</td>
              <td>{order.userId}</td>
              <td>{order.state}</td>
              <td>{new Date(order.date).toLocaleString()}</td>
              <td>{order.price}</td>
              <td>
                <select
                  value={order.state}
                  onChange={(e) => handleStatusChange(order.no, e.target.value)}
                >
                  <option value="주문접수">주문접수</option>
                  <option value="배송중">배송중</option>
                  <option value="배송완료">배송완료</option>
                  <option value="주문취소">주문취소</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
