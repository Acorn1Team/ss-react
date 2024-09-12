import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ItemManage() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지를 저장할 상태
  const [pageSize, setPageSize] = useState(5); // 페이지 크기를 저장할 상태
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수를 저장할 상태
  const navigate = useNavigate();

  // 서버에서 공지사항 목록을 가져오는 함수
  const fetchNotices = async (page = 0, size = 10) => {
    try {
      const response = await axios.get(`/admin/item`, {
        params: {
          page,
          size
        },
      });
      setItems(response.data.content); // 아이템 목록
      setTotalPages(response.data.totalPages); // 전체 페이지 수
      setCurrentPage(response.data.number); // 현재 페이지
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchNotices(currentPage, pageSize);
  }, [currentPage]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // 페이지 상태 업데이트
    }
  };

  return (
    <>
      <table border={1} style={{ fontSize: "12px" }}>
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>사진</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.no}>
                <td>{item.no}</td>
                <td> 
                  <Link to={`/admin/help`}>
                    {item.name}
                  </Link>
                </td>
                <td>
                  <img src={item.pic} alt={`${item.name} 이미지`} style={{maxHeight:"100px", maxWidth:"30px"}}/>
                </td>
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
      {totalPages > 1 && (
      <div id="pagination">
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
    </>
  );
}
