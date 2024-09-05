import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Style/Notice.module.css";

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  useEffect(() => {
    getNoticeList();
  }, [currentPage]);

  return (
    <div className={styles.container}>
      {loading && <p>로딩 중...</p>}
      {!loading &&
        noticeData.map((nd) => (
          <div key={nd.no} className={styles.noticeItem}>
            <div className={styles.noticeCategory}>
              {nd.no}&emsp;{nd.category}
            </div>
            <Link
              to={`/user/mypage/notice/${nd.no}`}
              className={styles.noticeTitle}
            >
              {nd.title}
            </Link>
            <div className={styles.noticeDate}>{formatDate(nd.date)}</div>
          </div>
        ))}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            이전
          </button>
          <span>
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
