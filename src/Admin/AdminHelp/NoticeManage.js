import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function NoticeManage() {
  const [notices, setNotices] = useState([]); // 공지사항 목록을 저장할 상태
  const [selectedCategory, setSelectedCategory] = useState(""); // 선택된 카테고리를 저장할 상태
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지를 저장할 상태
  const [pageSize, setPageSize] = useState(10); // 페이지 크기를 저장할 상태
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수를 저장할 상태
  const [searchTriggered, setSearchTriggered] = useState(false); // 검색 버튼 클릭 여부를 저장할 상태

  // 서버에서 공지사항 목록을 가져오는 함수
  const fetchNotices = async (page = 0, size = 10, category = "") => {
    try {
      const response = await axios.get(`/admin/help/notice`, {
        params: {
          page,
          size,
          category,
        },
      });
      setNotices(response.data.content); // 공지사항 목록을 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수를 상태에 저장
      setCurrentPage(response.data.number); // 현재 페이지를 상태에 저장
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  useEffect(() => {
    fetchNotices(currentPage, pageSize, selectedCategory);
  }, [currentPage, searchTriggered]);

  // 카테고리 선택 시 필터링을 수행하는 함수
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 초기화
    setSearchTriggered((prev) => !prev); // 검색 상태를 트리거
  };

  // 전체보기 버튼 클릭 시 필터링을 초기화하는 함수
  const handleReset = () => {
    setSelectedCategory(""); // 카테고리 초기화
    setCurrentPage(0); // 페이지를 첫 페이지로 초기화
    setSearchTriggered((prev) => !prev); // 검색 상태를 트리거
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // 페이지 상태 업데이트
    }
  };

  // 날짜 형식을 변환하는 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <>
      <br />
      <h1>공지 목록</h1>
      <Link to="/admin/help/notices/new">공지 추가하기</Link>

      {/* 카테고리 선택 및 전체보기 버튼 */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="category">카테고리:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="">전체</option>
          <option value="주문">주문</option>
          <option value="결제">결제</option>
          <option value="반품/환불">반품/환불</option>
          <option value="배송">배송</option>
          <option value="프로모션/쿠폰">프로모션/쿠폰</option>
          <option value="상품문의">상품문의</option>
        </select>
      </div>

      {/* 공지사항 목록을 테이블로 표시 */}
      <table border={1}>
        <thead>
          <tr>
            <th>번호</th>
            <th>분류</th>
            <th>제목</th>
            <th>등록일시</th>
          </tr>
        </thead>
        <tbody>
          {notices.length > 0 ? (
            notices.map((notice) => (
              <tr key={notice.no}>
                <td>{notice.no}</td>
                <td>{notice.category}</td>
                <td>
                  <Link to={`/admin/help/notices/${notice.no}`}>
                    {notice.title}
                  </Link>
                </td>
                <td>{formatDate(notice.date)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
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
