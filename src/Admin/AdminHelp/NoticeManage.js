import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function NoticeManage() {
  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(10);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getNoticeList();
  }, [currentPage]);

  const [notices, setNotices] = useState([]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getNoticeList = () => {
    axios
      .get("/admin/help/notice", {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((response) => {
        setNotices(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <Link to="/admin/help/notices/new">공지 추가</Link>
      <br />
      <h1>공지 목록</h1>
      <table border="1">
        <thead>
          <tr>
            <th>번호</th>
            <th>분류</th>
            <th>제목</th>
            <th>등록일시</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => (
            <tr key={notice.no}>
              <td>{notice.no}</td>
              <td>{notice.category}</td>
              <td>
                <Link to={`/admin/help/notices/${notice.no}`}>
                  {notice.title}
                </Link>
              </td>
              <td>{notice.date}</td>
            </tr>
          ))}
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
            disabled={currentPage + 1 >= totalPages}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
