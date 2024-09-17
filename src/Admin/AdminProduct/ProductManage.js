import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal"; // react-modal 추가
import "../Style/admin.css";

Modal.setAppElement("#root"); // 접근성 설정

export default function ProductManage() {
  const [products, setProducts] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]); // 확장된 행을 저장할 상태
  const [reviews, setReviews] = useState({}); // 각 상품의 리뷰를 저장할 상태
  const [reviewPages, setReviewPages] = useState({}); // 각 상품의 리뷰 페이지 상태
  const [currentReviewPage, setCurrentReviewPage] = useState({}); // 현재 리뷰 페이지 상태
  const [searchTerm, setSearchTerm] = useState(""); // 이름 검색 상태
  const [searchField, setSearchField] = useState("name"); // 검색 필드 상태
  const [startDate, setStartDate] = useState(""); // 시작 날짜 상태
  const [endDate, setEndDate] = useState(""); // 종료 날짜 상태
  const [category, setCategory] = useState(""); // 카테고리 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const navigate = useNavigate();

  const [isSoldOutModalOpen, setIsSoldOutModalOpen] = useState(false); // 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedProductNo, setSelectedProductNo] = useState(null); // 품절 처리할 상품 번호
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async (
    page = 0,
    size = 10,
    searchTerm = "",
    searchField = "",
    startDate = "",
    endDate = "",
    category = ""
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
          category, // 카테고리 필터 추가
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

  const openSoldoutModal = (productNo) => {
    setSelectedProductNo(productNo);
    setIsSoldOutModalOpen(true);
  };

  const closeSoldoutModal = () => {
    setIsSoldOutModalOpen(false);
    setSelectedProductNo(null);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleSoldOutConfirm = async () => {
    if (selectedProductNo !== null) {
      try {
        await axios.put(`/admin/product/soldout/${selectedProductNo}`);
        fetchProducts(currentPage, pageSize);
        closeSoldoutModal(); // 모달 닫기
      } catch (error) {
        console.error("Error updating product to sold out:", error);
        closeSoldoutModal(); // 에러 발생 시에도 모달 닫기
      }
    }
  };

  const handleDelete = async (no) => {
    try {
      await axios.delete(`/admin/product/${no}`);
      setIsDeleteModalOpen(false);
      setIsResultModalOpen(true);
    } catch (error) {
      console.log("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleteModalOpen(false);
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
        endDate,
        category // 카테고리 필터 추가
      );
    } else {
      fetchProducts(currentPage, pageSize);
    }
  }, [currentPage, pageSize, searchTriggered]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, startDate, endDate, category]);

  const handleSearch = () => {
    setCurrentPage(0);
    setSearchTriggered(true);
    fetchProducts(
      0,
      pageSize,
      searchTerm,
      searchField,
      startDate,
      endDate,
      category
    );
  };

  const handleReset = () => {
    setSearchTerm("");
    setSearchField("name");
    setStartDate("");
    setEndDate("");
    setCategory(""); // 카테고리 필터 초기화
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

  // 텍스트바 크기 조정을 위한 함수
  const renderSearchField = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginTop: "10px" }}
        >
          {" "}
          {/* 여기에서 marginTop 추가 */}
          <input
            type="text"
            placeholder="이름 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "5px",
              width: "150px",
              marginRight: "10px",
              marginTop: "20px",
            }} // 여기에 marginTop 추가
          />
          <input
            type="date"
            placeholder="시작 날짜"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "5px",
              marginRight: "10px",
              width: "150px",
              marginTop: "10px",
            }} // 여기에 marginTop 추가
          />
          <input
            type="date"
            placeholder="종료 날짜"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "5px",
              marginRight: "10px",
              width: "150px",
              marginTop: "10px",
            }} // 여기에 marginTop 추가
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "5px",
              marginRight: "10px",
              width: "150px",
              marginTop: "20px",
            }} // 여기에 marginTop 추가
          >
            <option value="">카테고리 선택</option>
            <option value="상의">상의</option>
            <option value="하의">하의</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div id="admin-body">
      <style>
        {`
          .product-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            justify-items: center;
            margin-top: 20px;
          }

          .product-row {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
          }

          .product-card {
            width: 250px;
            height: 500px;
            margin: 0 auto 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin: 20px;
            overflow-y: auto;
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
            height: 400px;
            overflow-y: auto;
          }
        `}
      </style>

      <Modal
        isOpen={isSoldOutModalOpen}
        onRequestClose={closeSoldoutModal}
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
        <div id="admin-body">
          <h2>품절 처리</h2>
          <p>이 상품을 품절 처리하시겠습니까?</p>
          <button className="confirm-button" onClick={handleSoldOutConfirm}>
            확인
          </button>
          <button className="cancel-button" onClick={closeSoldoutModal}>
            취소
          </button>
        </div>
      </Modal>

      <button
        className="add-button"
        onClick={() => navigate("/admin/product/insert")}
      >
        상품 추가하기
      </button>

      <button
        className="view-all-button"
        onClick={handleReset}
        style={{ padding: "5px 10px" }}
      >
        전체보기
      </button>

      <div style={{ marginBottom: "10px" }}>{renderSearchField()}</div>

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
                  <img
                    src={item.pic}
                    alt={item.name}
                    style={{ height: "100px" }}
                  />
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
                  <strong>판매량:</strong> {item.count}건
                </div>
                <div>
                  {item.reviewCount > 0 ? (
                    <>
                      <strong>평점: </strong>
                      <span
                        onClick={() => toggleRowExpansion(item.no)}
                        style={{ cursor: "pointer", color: "blue" }}
                      >
                        {item.score}점 (리뷰 총 {item.reviewCount || 0}건)
                      </span>
                    </>
                  ) : (
                    <strong>리뷰 없음</strong>
                  )}
                </div>
                {item.available ? (
                  <>
                    <div>
                      <strong>재고:</strong>&nbsp;
                      {item.stock !== 0 ? (
                        <>
                          {item.stock}
                          &nbsp;
                          <button
                            className="btn4Small"
                            onClick={() => openSoldoutModal(item.no)}
                          >
                            품절 처리하기
                          </button>
                        </>
                      ) : (
                        <>품절</>
                      )}
                    </div>
                    <div>
                      <strong>등록일:</strong> {formatDate(item.date)}
                    </div>
                    <div>
                      <button
                        className="btn3"
                        onClick={() => openDeleteModal(item)}
                      >
                        판매 종료
                      </button>
                      <button
                        className="btn1"
                        onClick={() =>
                          navigate(`/admin/product/update/${item.no}`)
                        }
                      >
                        수정하기
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2>판매 종료된 상품</h2>
                    <h2></h2>
                  </>
                )}
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

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="상품 삭제 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            height: "200px",
            margin: "auto",
          },
        }}
      >
        {isDeleteModalOpen && (
          <>
            <p>
              <b>{productToDelete.name}</b> 판매를 종료하시겠습니까?
            </p>
            <button onClick={() => handleDelete(productToDelete.no)}>
              삭제
            </button>
            &nbsp;&nbsp;
            <button onClick={closeDeleteModal}>취소</button>
          </>
        )}
      </Modal>

      <Modal
        isOpen={isResultModalOpen}
        onRequestClose={() => setIsResultModalOpen(false)}
        contentLabel="판매종료 처리 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "300px",
            height: "180px",
            margin: "auto",
          },
        }}
      >
        <>
          <br />
          <h3>판매 종료 처리가 완료되었습니다.</h3>
          <button onClick={() => navigate("/admin/product")}>
            목록으로 돌아가기
          </button>
        </>
      </Modal>
    </div>
  );
}
