import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../Style/Scrap.module.css";

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
  const no = sessionStorage.getItem("id");

  // 스크랩한 정보 가져오기
  const getScrapList = () => {
    axios
      .get(`/api/myScrapPage/${no}`, {
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
      .delete(`/api/main/scrap/${scrapNo}/${no}`)
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
    <div className={styles.scrapContainer}>
      <h2 className={styles.title}>마이스크랩</h2>
      {scrapList.length > 0 ? (
        <div className={styles.scrapGrid}>
          {scrapList.map((sl) => (
            <div key={sl.no} className={styles.scrapItem}>
              <Link
                to={`/user/main/sub/${sl.showNo}`}
                className={styles.scrapLink}
              >
                <img src={sl.pic} alt={sl.name} className={styles.scrapImage} />
                {sl.name}
              </Link>
              <button onClick={() => handleScrapCancel(sl.no)} className="btn2">
                스크랩 취소
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.emptyMessage}>스크랩한 배역이 없습니다.</p>
      )}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={styles.paginationButton}
          >
            이전
          </button>
          <span className={styles.paginationText}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages}
            className={styles.paginationButton}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
