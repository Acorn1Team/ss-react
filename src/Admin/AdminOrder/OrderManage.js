import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OrderManage() {
  const [orders, setOrders] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]); // 확장된 행을 관리하는 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("userId");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [productInfo, setProductInfo] = useState({});
  const [status, setStatus] = useState(""); // 상태 필터링 상태 추가
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  // 주문 목록 가져오기
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

  // 주문 상세 정보 가져오기
  const fetchOrderDetail = async (orderNo) => {
    try {
      const response = await axios.get(`/admin/orders/detail/${orderNo}`);
      const { order, user, product } = response.data;
      setOrderDetails((prevDetails) => ({
        ...prevDetails,
        [orderNo]: order,
      }));
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        [orderNo]: user,
      }));
      setProductInfo((prevProductInfo) => ({
        ...prevProductInfo,
        [orderNo]: product,
      }));
    } catch (error) {
      console.error("주문 상세 정보를 가져오는 중 오류가 발생했습니다!", error);
      setError("주문 상세 정보를 가져오는 중 오류가 발생했습니다.");
    }
  };

  // 행 확장 토글
  const toggleRowExpansion = (orderNo) => {
    const isRowExpanded = expandedRows.includes(orderNo);
    if (isRowExpanded) {
      setExpandedRows(expandedRows.filter((id) => id !== orderNo)); // 행 축소
    } else {
      setExpandedRows([...expandedRows, orderNo]); // 행 확장
      if (!orderDetails[orderNo]) {
        fetchOrderDetail(orderNo); // 주문 상세 정보가 없으면 불러옴
      }
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

  const formatPrice = (price) => `${price.toLocaleString("ko-KR")}원`;

  useEffect(() => {
    fetchOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "inline-block", marginRight: "10px" }}>
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
              searchField === "userId" ? "유저 ID" : "날짜"
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
              <React.Fragment key={order.no}>
                <tr>
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
                    <span
                      style={{ cursor: "pointer", color: "blue" }}
                      onClick={() => toggleRowExpansion(order.no)}
                    >
                      {expandedRows.includes(order.no) ? "닫기" : "상세보기"}
                    </span>
                  </td>
                </tr>
                {expandedRows.includes(order.no) && (
                  <tr>
                    <td colSpan="6">
                      <div>
                        {orderDetails[order.no] &&
                        userInfo[order.no] &&
                        productInfo[order.no] ? (
                          <table>
                            <thead>
                              <tr>
                                <td colSpan={4}>
                                  <h4>
                                    주문자명: {userInfo[order.no].name}
                                    <br />
                                    전화번호: {userInfo[order.no].tel}
                                    <br />
                                    주소: {userInfo[order.no].address}
                                  </h4>
                                </td>
                              </tr>
                              <tr>
                                <th>품번</th>
                                <th>상품명</th>
                                <th>수량</th>
                                <th>구매가</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails[order.no].orderProducts.map((p) => (
                                <tr key={p.productNo}>
                                  <td>{p.productNo}</td>
                                  <td
                                    style={{ cursor: "pointer", color: "blue" }}
                                    onClick={() =>
                                      navigate(
                                        `/admin/product/update/${p.productNo}`
                                      )
                                    }
                                  >
                                    {productInfo[order.no][p.productNo]}
                                  </td>
                                  <td>{p.quantity}</td>
                                  <td>{formatPrice(p.price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>주문 상세 정보를 불러오는 중입니다...</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}
    </div>
  );
}
