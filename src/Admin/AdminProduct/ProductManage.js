import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductManage.css"; // CSS 파일 추가

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
  const [pageSize, setPageSize] = useState(8);
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
      const response = await axios.get("/admin/product", {
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
      <table border={1}>
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>가격</th>
            <th>할인가격</th>
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
                    {reviewPages > 1 && (
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
                    )}
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

      {/* 버튼을 중앙에 배치하기 위해 추가한 div */}
      <div class="button-container">
        <button
          class="button"
          onClick={() => navigate("/admin/product/insert")}
        >
          <div class="dots_border"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="sparkle"
          >
            <path
              class="path"
              stroke-linejoin="round"
              stroke-linecap="round"
              stroke="black"
              fill="black"
              d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
            ></path>
            <path
              class="path"
              stroke-linejoin="round"
              stroke-linecap="round"
              stroke="black"
              fill="black"
              d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
            ></path>
            <path
              class="path"
              stroke-linejoin="round"
              stroke-linecap="round"
              stroke="black"
              fill="black"
              d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
            ></path>
          </svg>
          <span class="text_button">상품 추가하기</span>
        </button>
      </div>

      <br />
      <br />
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
    </>
  );
}
