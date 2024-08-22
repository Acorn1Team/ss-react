import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Notice() {
  const [noticeData, setNoticeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const getNoticeList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/user/notice`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      });
      setNoticeData(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    getNoticeList();
  }, [currentPage]);

  return (
    <div>
      {loading && <p>로딩 중...</p>}
      {!loading &&
        noticeData.map((nd) => (
          <div key={nd.no}>
            {nd.no}&emsp;{nd.category}
            <br />
            <Link to={`/user/mypage/notice/${nd.no}`}>{nd.title}</Link>
            <br />
            {nd.date}
            <hr />
          </div>
        ))}

      {totalPages > 1 && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            이전
          </button>
          <span style={{ margin: "0 10px" }}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages || loading}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
