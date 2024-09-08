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
  const [orderDetails, setOrderDetails] = useState({}); // 여러 주문의 상세 정보를 관리
  const [userInfo, setUserInfo] = useState({});
  const [productInfo, setProductInfo] = useState({}); // 제품 정보를 저장할 상태
  const navigate = useNavigate();

  // 주문 목록 가져오기
  const fetchOrders = async (page = 0, size = 10, searchTerm = "", searchField = "") => {
    try {
      const response = await axios.get("/admin/orders", {
        params: {
          page,
          size,
          searchTerm,
          searchField,
          sort: "date,DESC", // 최신순으로 정렬
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

  const formatPrice = (price) => `${price.toLocaleString("ko-KR")}원`;

  useEffect(() => {
    fetchOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

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
                  <td>{order.state}</td>
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
                      {orderDetails[order.no] && userInfo[order.no] && productInfo[order.no] ? (
                        <table>
                          <thead>
                            <tr>
                              <td colSpan={4}><h4>
                              주문자명: {userInfo[order.no].name}<br/>
                              전화번호: {userInfo[order.no].tel}<br/>
                              주소: {userInfo[order.no].address}
                              </h4></td>
                            </tr>
                            <tr>
                                <th>품번</th><th>상품명</th><th>수량</th><th>구매가</th>
                            </tr>
                          </thead>
                          <tbody>
                          {orderDetails[order.no].orderProducts.map((p) => (
                            <tr key={p.productNo}>
                              <td>{p.productNo}</td>
                              <td style={{ cursor: "pointer", color: "blue" }} onClick={() => navigate(`/admin/product/update/${p.productNo}`)}>{productInfo[order.no][p.productNo]}</td>
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
            onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </button>
          <span style={{ margin: "0 10px" }}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
            disabled={currentPage + 1 === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
    </div>
  );
}
