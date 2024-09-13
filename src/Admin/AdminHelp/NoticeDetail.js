import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal"; // react-modal 추가
import styles from "./NoticeDetail.module.css"; // CSS 모듈 임포트

Modal.setAppElement("#root"); // 접근성 설정

export default function NoticeDetail() {
  const { no } = useParams(); // URL 파라미터에서 no 값 추출
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  const [modalType, setModalType] = useState(""); // "수정" 또는 "삭제" 모달을 구분

  // 수정할 정보 state로 관리
  const [state, setState] = useState({
    category: "",
    title: "",
    contents: "",
  });

  useEffect(() => {
    axios
      .get("/admin/help/notice/" + no)
      .then((res) => {
        setState(res.data);
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
        if (res.data.isSuccess) navigate("/admin/help");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = () => {
    axios
      .delete("/admin/help/notice/" + no)
      .then((res) => {
        if (res.data.isSuccess) navigate("/admin/help");
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
      <div className={styles.container} style={{ textAlign: "center" }}>
        <button
          className="cancel-button"
          onClick={() => navigate(`/admin/help`)}
        >
          목록보기
        </button>
        <div style={{ marginTop: "20px" }}>
          <div>
            제목
            <input
              onChange={handleChange}
              type="text"
              name="title"
              value={state.title}
              style={{ display: "block", margin: "10px auto", width: "50%" }}
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            카테고리
            <select
              onChange={handleChange}
              name="category"
              value={state.category}
              style={{ display: "block", margin: "10px auto", width: "50%" }}
            >
              <option value="주문">주문</option>
              <option value="결제">결제</option>
              <option value="반품/환불">반품/환불</option>
              <option value="배송">배송</option>
              <option value="프로모션/쿠폰">프로모션/쿠폰</option>
              <option value="상품문의">상품문의</option>
              <option value="커뮤니티">커뮤니티</option>
            </select>
          </div>
          내용
          <textarea
            style={{
              width: "200px !important", // 가로 100%로 설정
              height: "300px", // 세로 300px로 설정
              padding: "10px", // 내부 여백 10px
              boxSizing: "border-box", // 패딩과 경계 포함
              display: "block", // 블록 디스플레이로 설정
              margin: "10px auto", // 중앙 정렬
            }}
            name="contents"
            value={state.contents}
            onChange={handleChange}
          />
          <div style={{ marginTop: "20px" }}>
            <button className="delete-button" onClick={() => openModal("삭제")}>
              공지 삭제하기
            </button>
            <button className="update-button" onClick={() => openModal("수정")}>
              수정 완료
            </button>
          </div>
        </div>
      </div>
      {/* react-modal 모달 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="확인 모달"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h2 style={{ fontSize: "20px" }}>{modalType} 확인</h2>
        <p style={{ fontSize: "16px" }}>{modalType}하시겠습니까?</p>
        <div>
          <button
            className="delete-button"
            onClick={handleConfirm}
            style={{
              fontSize: "16px",
              padding: "10px 20px",
              marginRight: "10px",
            }}
          >
            {modalType}
          </button>
          <button
            className="cancel-button"
            onClick={closeModal}
            style={{ fontSize: "16px", padding: "10px 20px" }}
          >
            취소
          </button>
        </div>
      </Modal>
    </>
  );
}
