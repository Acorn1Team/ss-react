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
            <th>아이템 정보</th>
            <th>연결 상품 정보</th>
            <th>연결 스타일 정보</th>
          </tr>
        </thead>
        <tbody>
        {items.length > 0 ? (
          items.map((item) => (
            <tr key={item.no}>
              <td>
                {item.no}번,&nbsp;
                <Link to={`/admin/help`}>
                  {item.name}
                </Link><br/>
                <img src={item.pic} alt={`${item.name} 이미지`} style={{ maxHeight: "100px", maxWidth: "30px" }} />
              </td>
              <td>
                {item.productNo}번, &nbsp;
                {item.productName}<br/>
                <img src={item.productPic} alt={`${item.productName} 이미지`} style={{ maxHeight: "100px", maxWidth: "30px" }} />
               
              </td>
              <td>
                {item.styleInfos && item.styleInfos.length > 0 ? (
                  item.styleInfos.map((styleInfo) => (
                    <div key={styleInfo.no}>
                      {styleInfo.no},&nbsp;
                      <img src={styleInfo.pic} alt={`${styleInfo.no} 이미지`} style={{ maxHeight: "100px", maxWidth: "30px" }} />
                      {styleInfo.style.no},&nbsp;
                      {styleInfo.characterName},&nbsp;
                      {styleInfo.actorName},&nbsp;
                      {styleInfo.showTitle}
                    </div>
                  ))
                ) : (
                  <div>정보 없음</div>
                )}
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
