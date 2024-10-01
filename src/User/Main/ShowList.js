import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ShowList() {
  const [showData, setShowData] = useState([]);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(10);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  const getShowData = () => {
    axios
      .get(`/api/main/showDataAll`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setShowData(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    getShowData();
  }, [currentPage]);

  return (
    <>
      <div id="mainPostsSL">
        {showData.map((s) => (
          <Link to={`/user/main/sub/${s.no}`} key={s.no}>
            <div className="mainPostsBoxSL">
              <img src={s.pic} alt={s.title} />
              <br />
              {s.title}
            </div>
          </Link>
        ))}
      </div>
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
