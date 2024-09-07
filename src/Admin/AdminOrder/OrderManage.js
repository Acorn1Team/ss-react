import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function OrderManage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("userId");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  // 서버에서 데이터를 가져오는 함수
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
          searchTerm: searchField === "state" ? status : searchTerm,
          searchField,
          startDate,
          endDate,
          sort: "date,DESC", // 최신순으로 정렬 요청
        },
      });

      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error("주문 목록을 가져오는 중 오류가 발생했습니다!", error);
      setError("주문 목록을 가져오는 중 오류가 발생했습니다.");
    }
  };

  // 컴포넌트가 처음 렌더링될 때 최신순으로 데이터를 로드
  useEffect(() => {
    fetchOrders(currentPage, pageSize);
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
      );
    } catch (error) {
      console.error("주문 상태를 업데이트하는 중 오류가 발생했습니다!", error);
      setError("주문 상태 업데이트에 실패했습니다.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value);
    setSearchTerm("");
    setStatus("");
  };

  const handleStatusFilterChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders(
      0,
      pageSize,
      searchTerm,
      searchField,
      startDate,
      endDate,
      status
    );
  };

  const handleReset = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSearchField("userId");
    setStatus("");
    fetchOrders(0, pageSize);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const isOptionDisabled = (currentStatus, option) => {
    const statusOrder = ["주문접수", "배송중", "배송완료", "주문취소"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const optionIndex = statusOrder.indexOf(option);
    return optionIndex < currentIndex;
  };

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            <th>번호</th>
            <th>유저 ID</th>
            <th>주문일</th>
            <th>총액</th>
            <th>상태</th>
            <th>상세보기</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.no}>
                <td>{order.no}</td>
                <td>{order.userId}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>
                  {order.orderProducts
                    .reduce(
                      (total, product) =>
                        total + product.price * product.quantity,
                      0
                    )
                    .toLocaleString("ko-KR")}
                  원
                </td>
                <td>
                  <select
                    value={order.state}
                    onChange={(e) =>
                      handleStatusChange(order.no, e.target.value)
                    }
                  >
                    <option
                      value="주문접수"
                      disabled={isOptionDisabled(order.state, "주문접수")}
                    >
                      주문접수
                    </option>
                    <option
                      value="배송중"
                      disabled={isOptionDisabled(order.state, "배송중")}
                    >
                      배송중
                    </option>
                    <option
                      value="배송완료"
                      disabled={isOptionDisabled(order.state, "배송완료")}
                    >
                      배송완료
                    </option>
                    <option
                      value="주문취소"
                      disabled={isOptionDisabled(order.state, "주문취소")}
                    >
                      주문취소
                    </option>
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
      )}
      <br />

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
