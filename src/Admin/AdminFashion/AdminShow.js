import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ShowList() {
  const [showData, setShowData] = useState([]);
  const [currentShowPage, setCurrentShowPage] = useState(0);
  const [showPageSize, setShowPageSize] = useState(10);
  const [totalShowPages, setTotalShowPages] = useState(1);

  const getShowData = () => {
    axios
      .get(`/api/main/showDataAll`, {
        params: {
          page: currentPage,
          size: showPageSize,
        },
      })
      .then((res) => {
        setShowData(res.data.content);
        setTotalShowPages(res.data.totalPages);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalShowPages) {
      setCurrentShowPage(newPage);
    }
  };

  useEffect(() => {
    getShowData();
  }, [currentShowPage]);

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
      {totalShowPages > 1 && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => handlePageChange(currentShowPage - 1)}
            disabled={currentShowPage === 0}
          >
            이전
          </button>
          <span style={{ margin: "0 10px" }}>
            {currentShowPage + 1} / {totalShowPages}
          </span>
          <button
            onClick={() => handlePageChange(currentShowPage + 1)}
            disabled={currentShowPage + 1 >= totalShowPages}
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}
