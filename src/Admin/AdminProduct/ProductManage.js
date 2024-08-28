import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductManage() {
  const [products, setProducts] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]); // 확장된 행을 저장할 상태
  const [reviews, setReviews] = useState({}); // 각 상품의 리뷰를 저장할 상태
  const [reviewPages, setReviewPages] = useState({}); // 각 상품의 리뷰 페이지 상태
  const [currentReviewPage, setCurrentReviewPage] = useState({}); // 현재 리뷰 페이지 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async (
    page = 0,
    size = 10,
    searchTerm = "",
    searchField = "",
    startDate = "",
    endDate = ""
  ) => {
    try {
      const response = await axios.get(`/admin/product`, {
        params: {
          page,
          size,
          searchTerm,
          searchField,
          startDate,
          endDate,
        },
      });
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.number);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchReviews = async (productId, page = 0, size = 5) => {
    try {
      const response = await axios.get(`/admin/product/${productId}/reviews`, {
        params: {
          page,
          size,
        },
      });
      setReviews((prevReviews) => ({
        ...prevReviews,
        [productId]: response.data.content,
      }));
      setReviewPages((prevPages) => ({
        ...prevPages,
        [productId]: response.data.totalPages,
      }));
      setCurrentReviewPage((prevPages) => ({
        ...prevPages,
        [productId]: page,
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const toggleRowExpansion = (productId) => {
    const isRowExpanded = expandedRows.includes(productId);
    if (isRowExpanded) {
      setExpandedRows(expandedRows.filter((id) => id !== productId));
    } else {
      setExpandedRows([...expandedRows, productId]);
      if (!reviews[productId]) {
        fetchReviews(productId); // 리뷰 데이터를 가져옴
      }
    }
  };

  const handleReviewPageChange = (productId, direction) => {
    const currentPage = currentReviewPage[productId] || 0;
    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;

    if (newPage >= 0 && newPage < reviewPages[productId]) {
      fetchReviews(productId, newPage, 5);
    }
  };

  useEffect(() => {
    if (searchTriggered) {
      fetchProducts(
        currentPage,
        pageSize,
        searchTerm,
        searchField,
        startDate,
        endDate
      );
    } else {
      fetchProducts(currentPage, pageSize);
    }
  }, [currentPage, pageSize, searchTriggered]);

  const handleDelete = async (no) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/admin/product/${no}`);
        alert("상품이 삭제되었습니다.");
        fetchProducts(
          currentPage,
          pageSize,
          searchTerm,
          searchField,
          startDate,
          endDate
        );
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleDetail = (no) => {
    navigate(`/admin/product/detail/${no}`);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    setSearchTriggered(true);
    fetchProducts(0, pageSize, searchTerm, searchField, startDate, endDate);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSearchField("name");
    setStartDate("");
    setEndDate("");
    setCurrentPage(0);
    setSearchTriggered(false);
    fetchProducts(0, pageSize);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const calculateSellingPrice = (price, discountRate) => {
    if (discountRate === 0) {
      return "X";
    }
    return (price * (1 - discountRate / 100)).toFixed(2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const renderSearchField = () => {
    if (searchField === "date") {
      return (
        <div style={{ display: "inline-block" }}>
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
            style={{ padding: "5px", marginRight: "10px" }}
          />
        </div>
      );
    } else if (searchField === "category") {
      return (
        <select
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        >
          <option value="">카테고리 선택</option>
          <option value="상의">상의</option>
          <option value="하의">하의</option>
          <option value="기타">기타</option>
        </select>
      );
    } else {
      return (
        <input
          type="text"
          placeholder={`검색어를 입력하세요 (${searchField})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "5px", width: "300px", marginRight: "10px" }}
        />
      );
    }
  };

  return (
    <>
      <Link to="/admin/product/insert">상품 추가</Link>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "inline-block", marginRight: "10px" }}>
          검색 :
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="name">이름</option>
            <option value="date">날짜</option>
            <option value="category">카테고리</option>
          </select>
        </label>

        {renderSearchField()}

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

      <table border={1}>
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>가격</th>
            <th>할인가격</th>
            <th>내용</th>
            <th>날짜</th>
            <th>카테고리</th>
            <th>이미지</th>
            <th>재고</th>
            <th>평점 / 리뷰</th>
            <th>판매량</th>
            <th>상세보기</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((item) => (
              <>
                <tr key={item.no}>
                  <td>{item.no}</td>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    {calculateSellingPrice(item.price, item.discountRate)}
                  </td>
                  <td>{item.contents}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.category}</td>
                  <td>
                    <img
                      src={item.pic}
                      alt={item.name}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </td>
                  <td>{item.stock}</td>
                  <td>
                    <span
                      onClick={() => toggleRowExpansion(item.no)}
                      style={{ cursor: "pointer", color: "blue" }}
                    >
                      {`${item.score} / ${item.reviewCount || 0}건`}
                    </span>
                  </td>
                  <td>{item.count}</td>
                  <td>
                    <span
                      onClick={() => handleDetail(item.no)}
                      style={{ cursor: "pointer", color: "blue" }}
                    >
                      상세보기
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(item.no)}>삭제</button>
                  </td>
                </tr>
                {expandedRows.includes(item.no) && (
                  <>
                    <tr>
                      <td colSpan="13">
                        <ul>
                          {reviews[item.no] && reviews[item.no].length > 0 ? (
                            reviews[item.no].map((review) => (
                              <li key={review.no}>
                                <p>
                                  <strong>유저 아이디: {review.userid}</strong>
                                </p>
                                <p>내용: {review.contents}</p>
                                <p>평점: {review.score}</p>
                                <p>이미지: {review.pic}</p>
                              </li>
                            ))
                          ) : (
                            <p>No reviews available</p>
                          )}
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="13" style={{ textAlign: "center" }}>
                        <button
                          onClick={() =>
                            handleReviewPageChange(item.no, "prev")
                          }
                          disabled={currentReviewPage[item.no] === 0}
                        >
                          이전
                        </button>
                        <span style={{ margin: "0 10px" }}>
                          {currentReviewPage[item.no] + 1} /{" "}
                          {reviewPages[item.no]}
                        </span>
                        <button
                          onClick={() =>
                            handleReviewPageChange(item.no, "next")
                          }
                          disabled={
                            currentReviewPage[item.no] + 1 >=
                            reviewPages[item.no]
                          }
                        >
                          다음
                        </button>
                      </td>
                    </tr>
                  </>
                )}
              </>
            ))
          ) : (
            <tr>
              <td colSpan="13" style={{ textAlign: "center", padding: "20px" }}>
                결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
    </>
  );
}
