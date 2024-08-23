import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductManage() {
  const [products, setProducts] = useState([]); // 상품 목록을 저장할 상태
  const [searchTerm, setSearchTerm] = useState(""); // 검색어를 저장할 상태
  const [searchField, setSearchField] = useState("name"); // 검색할 필드를 저장할 상태
  const [startDate, setStartDate] = useState(""); // 시작 날짜 상태
  const [endDate, setEndDate] = useState(""); // 종료 날짜 상태
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지를 저장할 상태
  const [pageSize, setPageSize] = useState(10); // 페이지 크기를 저장할 상태
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수를 저장할 상태
  const [searchTriggered, setSearchTriggered] = useState(false); // 검색 버튼 클릭 여부를 저장할 상태
  const navigate = useNavigate(); // 상세보기 페이지로 이동하기 위한 네비게이터

  // 서버에서 상품 목록을 가져오는 함수
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
      setProducts(response.data.content); // 상품 목록을 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수를 상태에 저장
      setCurrentPage(response.data.number); // 현재 페이지를 상태에 저장
    } catch (error) {
      console.error("Error fetching products:", error);
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

  // 상품을 삭제하는 함수
  const handleDelete = async (no) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      // 삭제 전 사용자에게 확인
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
        ); // 삭제 후 목록을 새로고침
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("삭제 중 오류가 발생했습니다."); // 오류 발생 시 사용자에게 알림
      }
    }
  };

  // 상품의 상세보기 페이지로 이동하는 함수
  const handleDetail = (no) => {
    navigate(`/admin/product/detail/${no}`);
  };

  // 검색 버튼 클릭 시 필터링을 수행하는 함수
  const handleSearch = () => {
    setCurrentPage(0); // 검색 후 페이지를 첫 페이지로 초기화
    setSearchTriggered(true); // 검색 상태로 설정
    fetchProducts(0, pageSize, searchTerm, searchField, startDate, endDate); // 검색 조건으로 상품 목록을 가져오기
  };

  // 전체보기 버튼 클릭 시 필터링을 초기화하는 함수
  const handleReset = () => {
    setSearchTerm(""); // 검색어 초기화
    setSearchField("name"); // 검색 필드를 기본값으로 초기화
    setStartDate(""); // 시작 날짜 초기화
    setEndDate(""); // 종료 날짜 초기화
    setCurrentPage(0); // 페이지를 첫 페이지로 초기화
    setSearchTriggered(false); // 검색 상태를 초기화
    fetchProducts(0, pageSize); // 전체 목록으로 초기화
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // 페이지 상태 업데이트
    }
  };

  return (
    <>
      {/* 상품 추가 페이지로 이동하는 링크 */}
      <Link to="/admin/product/insert">상품 추가</Link>

      {/* 검색 필드와 검색어 입력 및 버튼들 */}
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

        {searchField === "date" ? (
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
        ) : (
          <input
            type="text"
            placeholder={`검색어를 입력하세요 (${searchField})`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* 상품 목록을 테이블로 표시 */}
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
            <th>할인률</th>
            <th>평점</th>
            <th>상세보기</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((item) => (
              <tr key={item.no}>
                <td>{item.no}</td>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.price - (item.price * item.discountRate) / 100}</td>
                <td>{item.contents}</td>
                <td>{item.date}</td>
                <td>{item.category}</td>
                <td>
                  <img
                    src={item.pic}
                    alt={item.name}
                    style={{ width: "100px", height: "100px" }}
                  />
                </td>
                <td>{item.stock}</td>
                <td>{item.discountRate}</td>
                <td>{item.score}</td>
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
            ))
          ) : (
            <tr>
              <td colSpan="12" style={{ textAlign: "center", padding: "20px" }}>
                결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
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
