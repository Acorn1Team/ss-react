import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function OrderManage() {
  const [orders, setOrders] = useState([]); // 모든 주문 목록 상태
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [searchField, setSearchField] = useState("userId"); // 검색 필드 상태 (기본값: userId)
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태
  const [pageSize, setPageSize] = useState(10); // 페이지 크기 상태
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수 상태
  const [error, setError] = useState(null); // 에러 메시지 상태
  const [startDate, setStartDate] = useState(""); // 시작 날짜 상태
  const [endDate, setEndDate] = useState(""); // 종료 날짜 상태
  const [status, setStatus] = useState(""); // 상태 필터 상태

  const fetchOrders = async (
    page = 0,
    size = 10,
    searchTerm = "",
    searchField = "",
    startDate = "",
    endDate = "",
    status = ""
  ) => {
    try {
      const response = await axios.get("/admin/orders", {
        params: {
          page,
          size,
          searchTerm: searchField === "state" ? status : searchTerm, // 상태 검색 반영
          searchField,
          startDate,
          endDate,
        },
      });
      setOrders(response.data.content); // 주문 목록을 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수를 상태에 저장
      setCurrentPage(response.data.number); // 현재 페이지를 상태에 저장
    } catch (error) {
      console.error("주문 목록을 가져오는 중 오류가 발생했습니다!", error);
      setError("주문 목록을 가져오는 중 오류가 발생했습니다."); // 에러 메시지 설정
    }
  };

  useEffect(() => {
    fetchOrders(
      currentPage,
      pageSize,
      searchTerm,
      searchField,
      startDate,
      endDate,
      status
    ); // 컴포넌트가 처음 마운트될 때 주문 목록을 가져옴
  }, [currentPage, pageSize]);

  const handleStatusChange = async (orderNo, status) => {
    const confirmation = window.confirm(
      `주문 상태를 '${status}'로 변경하시겠습니까?`
    );
    if (!confirmation) return;

    try {
      await axios.put(`/admin/orders/${orderNo}/status`, { status });
      setError(null);
      fetchOrders(
        currentPage,
        pageSize,
        searchTerm,
        searchField,
        startDate,
        endDate,
        status
      ); // 상태 변경 후 목록을 새로고침
    } catch (error) {
      console.error("주문 상태를 업데이트하는 중 오류가 발생했습니다!", error);
      setError("주문 상태 업데이트에 실패했습니다."); // 에러 메시지 설정
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchTerm(""); // 검색어 초기화
    setStatus(""); // 상태 초기화
  };

  const handleStatusFilterChange = (e) => {
    setStatus(e.target.value); // 상태 필터 변경
  };

  const handleSearch = () => {
    setCurrentPage(0); // 검색 후 페이지를 첫 페이지로 초기화
    fetchOrders(
      0,
      pageSize,
      searchTerm,
      searchField,
      startDate,
      endDate,
      status
    ); // 검색 버튼 클릭 시 필터링 수행
  };

  const handleReset = () => {
    setSearchTerm(""); // 검색어 초기화
    setStartDate(""); // 시작 날짜 초기화
    setEndDate(""); // 종료 날짜 초기화
    setSearchField("userId"); // 검색 필드 초기화
    setStatus(""); // 상태 필터 초기화
    fetchOrders(0, pageSize); // 전체 목록을 다시 가져오기
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // 페이지 상태 업데이트
    }
  };

  return (
    <div>
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
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.no}>
                <td>{order.no}</td>
                <td>{order.userId}</td>
                <td>{order.state}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>
                  {order.orderProducts.reduce(
                    (total, product) =>
                      total + product.price * product.quantity,
                    0
                  )}
                </td>
                <td>
                  <select
                    value={order.state}
                    onChange={(e) =>
                      handleStatusChange(order.no, e.target.value)
                    }
                  >
                    <option value="주문접수">주문접수</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                    <option value="주문취소">주문취소</option>
                  </select>
                </td>
                <td>
                  <Link to={`/admin/orders/detail/${order.no}`}>상세보기</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span style={{ margin: "0 10px" }}>
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage + 1 === totalPages}
        >
          다음
        </button>
      </div>
      )}<br/>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "inline-block", marginRight: "10px" }}>
          검색 :
          <select
            value={searchField}
            onChange={handleSearchFieldChange}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="userId">유저 ID</option>
            <option value="state">상태</option>
            <option value="date">날짜</option>
          </select>
        </label>

        {searchField === "date" ? (
          <div>
            <input
              type="date"
              placeholder="시작 날짜"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: "5px", marginRight: "10px" }}
            />
            <input
              type="date"
              placeholder="종료 날짜"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: "5px" }}
            />
          </div>
        ) : searchField === "state" ? (
          <select
            value={status}
            onChange={handleStatusFilterChange}
            style={{ padding: "5px", marginRight: "10px" }}
          >
            <option value="">상태 선택</option>
            <option value="배송중">배송중</option>
            <option value="배송완료">배송완료</option>
            <option value="주문취소">주문취소</option>
          </select>
        ) : (
          <input
            type="text"
            placeholder={`검색어를 입력하세요 (${
              searchField === "userId"
                ? "유저 ID"
                : searchField === "state"
                ? "상태"
                : "날짜"
            })`}
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ padding: "5px", width: "300px", marginRight: "10px" }}
          />
        )}

        <button
          onClick={handleSearch}
          style={{ padding: "5px 10px", marginRight: "10px" }}
        >
          검색
        </button>
        <button onClick={handleReset} style={{ padding: "5px 10px" }}>
          전체보기
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}
    </div>
  );
}
