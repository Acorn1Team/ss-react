import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Scrap() {
  // 스크랩 리스트 정보 저장용
  const [scrapList, setScrapList] = useState([]);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState(0);

  // 페이지 크기
  const [pageSize, setPageSize] = useState(5);

  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(1);

  // 로그인 정보라고 가정
  const no = 3;

  // 스크랩한 정보 가져오기
  const getScrapList = () => {
    axios
      .get(`/myScrapPage/${no}`, {
        params: {
          page: currentPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setScrapList(res.data.content);
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

  // 스크랩 취소 함수
  const handleScrapCancel = (scrapNo) => {
    axios
      .delete(`/main/scrap/${scrapNo}/${no}`)
      .then((res) => {
        if (res.data.result === true) {
          // 삭제 성공시 리스트 다시 불러오기
          getScrapList();
        }
      })
      .catch((err) => {
        console.log("스크랩 취소 실패:", err);
      });
  };

  useEffect(() => {
    getScrapList();
  }, [currentPage]);

  return (
    <div>
      {scrapList.map((sl) => (
        <div key={sl.no}>
          <Link to={`/user/main/sub/${sl.no}`}>
            {sl.name}
            <img src={sl.pic} alt={sl.name} />
          </Link>
          <button onClick={() => handleScrapCancel(sl.no)}>스크랩 취소</button>
        </div>
      ))}
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
    </div>
  );
}
