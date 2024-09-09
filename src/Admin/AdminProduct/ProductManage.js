import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal"; // react-modal 추가

Modal.setAppElement("#root"); // 접근성 설정

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
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [selectedProductNo, setSelectedProductNo] = useState(null); // 품절 처리할 상품 번호
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
          sort: "no,DESC",
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

  const openModal = (productNo) => {
    setSelectedProductNo(productNo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProductNo(null);
  };

  const handleSoldOutConfirm = async () => {
    if (selectedProductNo !== null) {
      try {
        await axios.put(`/admin/product/soldout/${selectedProductNo}`);
        fetchProducts(currentPage, pageSize);
        closeModal(); // 모달 닫기
      } catch (error) {
        console.error("Error updating product to sold out:", error);
        closeModal(); // 에러 발생 시에도 모달 닫기
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
    if (discountRate === 0) return null;
    return Math.round(price * (1 - discountRate / 100));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
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
      <style>
        {`.product-row {
  display: flex;
  justify-content: space-between;
  align-items: stretch; /* 세로 길이를 동일하게 맞추기 */
}

.product-card {
  width: 60%; /* 제품 카드의 너비 줄이기 */
  margin: 0 auto 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 400px; /* 고정 높이 설정 */
  overflow-y: auto; /* 콘텐츠가 넘칠 경우 스크롤 */
}

.product-card img {
  margin: 10px 0;
}

.reviews-container {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  width: 35%;
  margin-left: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 400px; /* 고정 높이 설정 */
  overflow-y: auto; /* 콘텐츠가 넘칠 경우 스크롤 */
}

.button-container {
  text-align: center;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  cursor: pointer;
}

button:hover {
  background-color: blue;
}
`}
      </style>

      {/* 품절 처리 확인 모달 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="품절 처리 확인"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
        }}
      >
        <h2>품절 처리</h2>
        <p>이 상품을 품절 처리하시겠습니까?</p>
        <button onClick={handleSoldOutConfirm}>확인</button>
        <button onClick={closeModal}>취소</button>
      </Modal>

      <div className="button-container">
        <button
          className="button"
          onClick={() => navigate("/admin/product/insert")}
        >
          상품 추가하기
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "inline-block", marginRight: "10px" }}>
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
      <div className="product-container">
        {products.length > 0 ? (
          products.map((item) => (
            <div key={item.no} className="product-row">
              <div className="product-card">
                <div>
                  <h3>
                    {item.no}. {item.name}
                  </h3>
                </div>
                <div>
                  <strong>가격: </strong>
                  {item.discountRate > 0 ? (
                    <>
                      <span style={{ textDecoration: "line-through" }}>
                        {item.price.toLocaleString("ko-KR")}원
                      </span>
                      &nbsp;
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        {calculateSellingPrice(
                          item.price,
                          item.discountRate
                        ).toLocaleString("ko-KR")}
                        원 ({item.discountRate} % 할인)
                      </span>
                    </>
                  ) : (
                    <>{item.price.toLocaleString("ko-KR")}원</>
                  )}
                </div>
                <div>
                  <img
                    src={item.pic}
                    alt={item.name}
                    style={{ height: "100px" }}
                  />
                </div>
                {item.reviewCount > 0 && (
                  <div>
                    <strong>평점: </strong>
                    <span
                      onClick={() => toggleRowExpansion(item.no)}
                      style={{ cursor: "pointer", color: "blue" }}
                    >
                      {item.score}점 (리뷰 총 {item.reviewCount || 0}건)
                    </span>
                  </div>
                )}
                <div>
                  <strong>재고:</strong> {item.stock}
                  &nbsp;
                  <button
                    onClick={() => openModal(item.no)}
                    disabled={item.stock === 0}
                  >
                    품절 처리하기
                  </button>
                </div>
                <div>
                  <strong>판매량:</strong> {item.count}건
                </div>
                <div>
                  <strong>등록일:</strong> {formatDate(item.date)}
                </div>
                <button
                  onClick={() => navigate(`/admin/product/update/${item.no}`)}
                >
                  수정하기
                </button>
              </div>

              {/* 옆에 리뷰 표시 */}
              {expandedRows.includes(item.no) && (
                <div className="reviews-container">
                  <div>
                    {reviews[item.no] && reviews[item.no].length > 0 ? (
                      reviews[item.no].map((review) => (
                        <div key={review.no}>
                          <strong>{review.userid}</strong>
                          <br />
                          평점: {review.score}점<br />
                          {review.contents}
                          <br />
                          <img
                            style={{ height: "50px" }}
                            src={review.pic}
                            alt={`${review.userid}의 후기 사진`}
                          />
                          <hr />
                        </div>
                      ))
                    ) : (
                      <p>No reviews available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            결과가 없습니다.
          </div>
        )}
      </div>

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
