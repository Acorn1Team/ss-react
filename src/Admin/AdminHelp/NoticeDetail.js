import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NoticeDetail() {
  const { no } = useParams(); // URL 파라미터에서 no 값 추출
  const [categoryFilter, setCategoryFilter] = useState(""); // 카테고리 필터링 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  const [modalType, setModalType] = useState(""); // "수정" 또는 "삭제" 모달을 구분

  // 수정할 정보 state로 관리
  const [state, setState] = useState({
    category: "",
    title: "",
    contents: "",
  });

  const [notices, setNotices] = useState([]); // 필터링된 공지사항 리스트

  useEffect(() => {
    axios
      .get("/admin/help/notice/" + no)
      .then((res) => {
        setState(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // 공지사항 리스트를 가져오는 API 호출
    axios
      .get("/admin/help/notices")
      .then((res) => {
        setNotices(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [no]);

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleSave = () => {
    axios
      .put("/admin/help/notice/" + no, state)
      .then((res) => {
        // 수정 후 목록보기
        if (res.data.isSuccess) navigate("/admin/help/notices");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = () => {
    axios
      .delete("/admin/help/notice/" + no)
      .then((res) => {
        // 삭제 후 목록 보기
        if (res.data.isSuccess) navigate("/admin/help/notices");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const filteredNotices = notices.filter(
    (notice) => categoryFilter === "" || notice.category === categoryFilter
  );

  // 모달 열기
  const openModal = (type) => {
    setModalType(type); // "수정" 또는 "삭제" 타입 지정
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 모달 확인 시 동작
  const handleConfirm = () => {
    if (modalType === "수정") {
      handleSave(); // 수정 실행
    } else if (modalType === "삭제") {
      handleDelete(); // 삭제 실행
    }
    closeModal(); // 모달 닫기
  };

  return (
    <>
      <h2>공지 수정</h2>
      <button onClick={() => navigate(`/admin/help/notices`)}>목록보기</button>
      <div>
        제목
        <input
          onChange={handleChange}
          type="text"
          name="title"
          value={state.title}
        />
      </div>
      <div>
        카테고리
        <select onChange={handleChange} name="category" value={state.category}>
          <option value="주문">주문</option>
          <option value="결제">결제</option>
          <option value="반품/환불">반품/환불</option>
          <option value="배송">배송</option>
          <option value="프로모션/쿠폰">프로모션/쿠폰</option>
          <option value="상품문의">상품문의</option>
        </select>
      </div>
      <div>
        내용
        <textarea
          onChange={handleChange}
          name="contents"
          value={state.contents}
        />
      </div>
      <button onClick={() => openModal("수정")}>수정</button>
      <button onClick={() => openModal("삭제")}>삭제</button>

      {/* 모달 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <p>{modalType}하시겠습니까?</p>
            <div className="modal-buttons">
              <button onClick={handleConfirm}>{modalType}</button>
              <button onClick={closeModal}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
