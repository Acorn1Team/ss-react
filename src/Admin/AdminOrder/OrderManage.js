import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

Modal.setAppElement("#root");

function StatusFilterSelect({ status, onStatusChange }) {
  return (
    <select
      value={status}
      onChange={onStatusChange}
      style={{ padding: "5px", marginRight: "10px", width: "180px" }}
    >
      <option value="">주문 상태 선택</option>
      <option value="주문접수">주문접수</option>
      <option value="배송중">배송중</option>
      <option value="배송완료">배송완료</option>
      <option value="주문취소">주문취소</option>
    </select>
  );
}

export default function OrderManage() {
  const [orders, setOrders] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("userName");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOrderNo, setModalOrderNo] = useState(null);
  const [modalStatus, setModalStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [productInfo, setProductInfo] = useState({});
  const navigate = useNavigate();

  const openModal = (orderNo, status) => {
    setModalOrderNo(orderNo);
    setModalStatus(status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalOrderNo(null);
    setModalStatus("");
  };

  // 주문 상태 변경
  const handleStatusChange = async () => {
    try {
      await axios.put(`/admin/orders/${modalOrderNo}/status`, {
        status: modalStatus,
      });
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
      closeModal();
    } catch (error) {
      console.error("주문 상태를 업데이트하는 중 오류가 발생했습니다!", error);
      setError("주문 상태 업데이트에 실패했습니다.");
      closeModal();
    }
  };

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
          searchTerm,
          searchField,
          startDate,
          endDate,
          status,
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

  // 상태 필터 변경 시 목록을 즉시 업데이트
  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    fetchOrders(
      0,
      pageSize,
      searchTerm,
      searchField,
      startDate,
      endDate,
      newStatus
    );
  };

  // 검색어 필터 변경 시 목록 업데이트
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    fetchOrders(
      0,
      pageSize,
      newSearchTerm,
      searchField,
      startDate,
      endDate,
      status
    );
  };

  // 날짜 필터 설정 시 목록 업데이트
  const handleDateFilter = () => {
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

  // 날짜 변경 시 필터링을 자동으로 처리
  useEffect(() => {
    if (startDate && endDate) {
      handleDateFilter();
    }
  }, [startDate, endDate]);

  const handleReset = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    fetchOrders(0, pageSize);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchOrders(
        newPage,
        pageSize,
        searchTerm,
        searchField,
        startDate,
        endDate,
        status
      );
    }
  };

  const makeOrderNo = (orderDate) => {
    return orderDate.substring(2, 10).replace(/-/g, '');
  }

  useEffect(() => {
    fetchOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

  return (
    <div id="admin-body">
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="주문 상태 변경 확인"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center"
          },
        }}
      >
        <h2>주문 상태 변경</h2>
        <p>주문 상태를 '{modalStatus}'로 변경하시겠습니까?</p>
        <button className="confirm-button" onClick={handleStatusChange}>
          확인
        </button>
        <button className="cancel-button" onClick={closeModal}>
          취소
        </button>
      </Modal>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center", // 가로 가운데 정렬
            alignItems: "center", // 수직 가운데 정렬
            marginBottom: "20px",
            gap: "30px", // 필터 사이의 간격 설정
          }}
        >
          {/* 상태 필터 */}
          <div style={{ marginTop:"9px", textAlign: "center" }}>
            <StatusFilterSelect
              status={status}
              onStatusChange={handleStatusFilterChange}
            />
          </div>

          {/* 검색 필터 */}
          <div style={{ textAlign: "center" }}>
            <input
              type="text"
              placeholder="주문자명 입력"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ marginTop:"10px", padding: "5px", width: "150px" }} // 크기 조정
            />
          </div>

          {/* 날짜 필터 */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              {/* 날짜와 버튼 간 간격 설정 */}
              <input
                type="date"
                placeholder="시작 날짜"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: "5px", width: "150px" }}
              />
              <input
                type="date"
                placeholder="종료 날짜"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: "5px", width: "150px" }}
              />
            </div>
          </div>

          {/* 전체보기 버튼을 같은 줄에 배치 */}
          <button
            className="view-all-button"
            onClick={handleReset}
            style={{ marginTop:"10px", padding: "5px 10px" }}
          >
            전체보기
          </button>
        </div>
      </div>

      <table className="adminTable">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>주문자명</th>
            <th>상태</th>
            <th>주문일</th>
            <th>주문총액</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <React.Fragment key={order.no}>
                <tr>
                  <td>{makeOrderNo(`${order.date}`)}{order.no}</td>
                  <td>{order.userName}</td>
                  <td>
                    <select style={{padding:"1px", height:"40px", width:"100px", fontSize:"15px"}}
                      value={order.state}
                      onChange={(e) => openModal(order.no, e.target.value)}
                      >
                      <option
                        value="주문접수"
                        disabled={
                          order.state === "배송중" || order.state === "배송완료"
                        }
                        >
                        주문접수
                      </option>
                      <option
                        value="배송중"
                        disabled={order.state === "배송완료"}
                      >
                        배송중
                      </option>
                      <option
                        value="배송완료"
                        disabled={order.state === "주문취소"}
                        >
                        배송완료
                      </option>
                      <option value="주문취소">주문취소</option>
                    </select>
                  </td>
                  <td>{new Date(order.date).toLocaleString()}</td>
                  <td>
                    {order.price.toLocaleString("ko-KR")}원&nbsp;
                    <button className="btn1Small" onClick={() => toggleRowExpansion(order.no)}>
                      {expandedRows.includes(order.no) ? "닫기" : "상세보기"}
                    </button>
                  </td>
                </tr>
                {expandedRows.includes(order.no) && (
                  <tr>
                    <td colSpan="5">
                      <div>
                        {orderDetails[order.no] &&
                        userInfo[order.no] &&
                        productInfo[order.no] ? (
                          <table>
                            <thead>
                              <tr>
                                <td colSpan={5}>
                                  <h4>주문자 정보<br/>
                                    연락처) {userInfo[order.no].tel}
                                    <br />
                                    주소) {userInfo[order.no].address}
                                  </h4>
                                </td>
                              </tr>
                              <tr>
                                <th>품번</th>
                                <th>상품명</th>
                                <th>수량</th>
                                <th>구매가</th>
                                <th>총액</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails[order.no].orderProducts.map((p) => (
                                <tr key={p.productNo}>
                                  <td>{p.productNo}</td>
                                  <td
                                    style={{ cursor: "pointer", color: "#C32E61" }}
                                    onClick={() =>
                                      navigate(
                                        `/admin/product/update/${p.productNo}`
                                      )
                                    }
                                  >
                                    {productInfo[order.no][p.productNo]}
                                  </td>
                                  <td>{p.quantity}</td>
                                  <td>
                                    {(p.price / p.quantity).toFixed(0).toLocaleString(
                                      "ko-KR"
                                    )}
                                    원
                                  </td>
                                  <td>{p.price.toLocaleString("ko-KR")}원</td>
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
        <div id="pagination" style={{ marginTop: "10px" }}>
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
