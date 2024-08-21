import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function OrderManage() {
  const [orders, setOrders] = useState([]); // 모든 주문 목록 상태
  const [filteredOrders, setFilteredOrders] = useState([]); // 필터링된 주문 목록 상태
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [searchField, setSearchField] = useState('userId'); // 검색 필드 상태 (기본값: userId)
  const [error, setError] = useState(null); // 에러 메시지 상태

  const refresh = () => {
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
  };

  useEffect(() => {
    refresh(); // 컴포넌트가 처음 마운트될 때 주문 목록을 가져옴
  }, []);

  const handleStatusChange = (orderNo, status) => {
    // 상태 변경 전에 확인 메시지를 표시
    const confirmation = window.confirm(`주문 상태를 '${status}'로 변경하시겠습니까?`);
    if (!confirmation) return;

    // 주문 상태를 업데이트하는 API 호출
    axios.put(`/admin/orders/${orderNo}/status`, { status: status })
      .then(response => {
        setError(null); // 에러 메시지 초기화
        refresh(); // 상태 변경 후 목록을 새로고침
      })
      .catch(error => {
        console.error('주문 상태를 업데이트하는 중 오류가 발생했습니다!', error);
        setError('주문 상태 업데이트에 실패했습니다.'); // 에러 메시지 설정
      });
  };

  // 상품을 삭제하는 함수
  const handleDelete = (no) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) { // 삭제 전 사용자에게 확인
        axios.delete("/admin/orders/" + no)
            .then(res => {
                alert("상품이 삭제되었습니다.");
                refresh(); // 삭제 후 목록을 새로고침
            })
            .catch(error => {
                console.log(error);
                alert("삭제 중 오류가 발생했습니다."); // 오류 발생 시 사용자에게 알림
            });
    }
  };

  const filterOrders = () => {
    // 검색어에 따라 주문 목록을 필터링
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date).toLocaleDateString(); // 주문 날짜를 로컬 날짜 문자열로 변환
      if (searchField === 'userId') {
        return order.userId.includes(searchTerm);
      } else if (searchField === 'state') {
        return order.state.includes(searchTerm);
      } else if (searchField === 'date') {
        return orderDate.includes(searchTerm);
      }
      return false;
    });
    setFilteredOrders(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchTerm(''); // 검색어 초기화
    setFilteredOrders(orders); // 필터링된 목록 초기화
  };

  const handleSearch = () => {
    filterOrders(); // 검색 버튼 클릭 시 필터링 수행
  };

  const handleReset = () => {
    setSearchTerm(''); // 검색어 초기화
    setFilteredOrders(orders); // 필터링된 목록을 전체 주문으로 초기화
  };

  return (
    <div>
      <h2>주문 관리</h2>

   
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'inline-block', marginRight: '10px' }}>
          검색 :
          <select value={searchField} onChange={handleSearchFieldChange} style={{ marginLeft: '10px', padding: '5px' }}>
            <option value="userId">유저 ID</option>
            <option value="state">상태</option>
            <option value="date">날짜</option>
          </select>
        </label>

        {/* 검색어 입력*/}
        <input
          type="text"
          placeholder={`검색어를 입력하세요 (${searchField === 'userId' ? '유저 ID' : searchField === 'state' ? '상태' : '날짜'})`}
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ padding: '5px', width: '300px', marginRight: '10px' }}
        />

        {/* 확인 버튼 */}
        <button onClick={handleSearch} style={{ padding: '5px 10px', marginRight: '10px' }}>검색</button>

        {/* 전체보기 버튼 */}
        <button onClick={handleReset} style={{ padding: '5px 10px' }}>전체보기</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} {/* 에러 메시지 표시 */}
      
      <table border="1">
        <thead>
          <tr>
            <th>번호</th>
            <th>유저 ID</th>
            <th>상태</th>
            <th>주문일</th>
            <th>총액</th>
            <th>상태 변경</th>
            <th>상세보기</th>
            <th>삭제</th> 
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
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
                <td>
                  <Link to={`/admin/orders/detail/${order.no}`}>
                    상세보기
                  </Link>
                </td>
                <td>
                 <button onClick={() => handleDelete(order.no)}>
                   삭제
                 </button>
              </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
