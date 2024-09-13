import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-modal";

export default function ItemManage() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지를 저장할 상태
  const [pageSize, setPageSize] = useState(5); // 페이지 크기를 저장할 상태
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수를 저장할 상태
  const navigate = useNavigate();

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteItemModalOpen, SetIsDeleteItemModalOpen] = useState(false);

  const fetchItems = async (page = 0, size = 10) => {
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
    fetchItems(currentPage, pageSize);
  }, [currentPage]);

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage); // 페이지 상태 업데이트
    }
  };

  const openDeleteItemModal = (itemData) => {
    setItemToDelete(itemData);
    SetIsDeleteItemModalOpen(true);
  }

  const deleteItem = (itemNo) => {
    axios
      .delete(`/admin/item/${itemNo}`)
      .then(
        setItems((prevItems) => prevItems.filter(item => item.no !== itemNo))  // 삭제된 항목만 제외하고 상태 업데이트
      )
      .then(
        SetIsDeleteItemModalOpen(false)
      )
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <table border={1}>
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
                <img src={item.pic} alt={`${item.name} 이미지`} style={{ maxHeight: "200px", maxWidth: "150px" }} /><br/>
                {item.name} ({item.no}번)<br/>
                <button className="delete-button" onClick={() => openDeleteItemModal(item)}>아이템 삭제</button>
              </td>
              <td>
                <img src={item.productPic} alt={`${item.productName} 이미지`} style={{ maxHeight: "200px", maxWidth: "150px" }} /><br/>
                {item.productName}<br/>
                <button className="update-button" onClick={() => navigate(`/admin/product/update/${item.productNo}`)}>상세보기</button>            
              </td>
              <td>
              {item.styleInfos && item.styleInfos.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {item.styleInfos.map((styleInfo) => (
                  <div key={styleInfo.no} style={{ backgroundColor:"#e7e7e7", padding: "20px", margin: "20px", width: "200px" }}>
                    <img src={styleInfo.style.pic} alt={`${styleInfo.no} 이미지`} style={{ maxHeight: "100px", maxWidth: "150px" }} /><br/>
                    styleItem PK: {styleInfo.no}<br/>
                    style PK: {styleInfo.style.no}<br/>
                    [{styleInfo.showTitle}]<br/>
                    {styleInfo.actorInfo.actor}
                    ({styleInfo.actorInfo.character})<br/>
                    <button className="update-button" onClick={() => navigate(`/admin/fashion/character/${styleInfo.actorInfo.no}`, { state: styleInfo.actorInfo })}>스타일 편집</button>
                  </div>
                ))}
              </div>
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
      <Modal
        isOpen={isDeleteItemModalOpen}
        onRequestClose={() => SetIsDeleteItemModalOpen(false)}
        contentLabel="아이템 삭제 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "500px",
            height: "400px",
            margin: "auto",
          },
        }}
      >
        {isDeleteItemModalOpen && (
          <>
            <h2>이 아이템을 삭제할까요?</h2>
            <h3>{itemToDelete.name}</h3>
            <img src={itemToDelete.pic} alt={`${itemToDelete.name} 이미지`} style={{ maxHeight: "100px", maxWidth: "150px" }} />
            <h4>❗연결된 모든 스타일에서도 해당 아이템 정보가 삭제됩니다❗</h4>
            <button className="delete-button" onClick={() => deleteItem(itemToDelete.no)}>삭제</button>
            &nbsp;&nbsp;
            <button className="cancel-button" onClick={() => SetIsDeleteItemModalOpen(false)}>취소</button>
          </>
        )}
      </Modal>
    </>
  );
}
