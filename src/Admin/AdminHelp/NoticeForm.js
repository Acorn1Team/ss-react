import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Modal from "react-modal";

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  width: calc(50% - 5px);
  padding: 10px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5a31b4;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 10px;
`;

export default function NoticeForm() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 초기 상태값 설정
  const [state, setState] = useState({
    title: "",
    category: "",
    contents: "",
  });

  // 에러 메시지 상태값
  const [errorMessage, setErrorMessage] = useState("");

  // 입력 필드 값 변경 시 상태 업데이트
  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
    setErrorMessage(""); // 입력 시 에러 메시지 초기화
  };

  // 추가 버튼 클릭 시 실행되는 함수
  const handleSave = () => {
    // 폼 유효성 검사
    if (!state.title || !state.category || !state.contents) {
      setErrorMessage("모든 필드를 입력해 주세요.");
      return;
    }

    // 서버에 데이터 전송
    axios
      .post("/admin/help/notice", state)
      .then((res) => {
        if (res.data.isSuccess) {
          setIsModalOpen(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <FormContainer>
      <h2>공지 추가</h2>
      <div>
        제목{" "}
        <InputField
          onChange={handleChange}
          type="text"
          name="title"
          value={state.title}
        />
      </div>
      <div>
        카테고리
        <select onChange={handleChange} name="category" value={state.category}>
          <option value="">선택해주세요</option>
          <option value="주문">주문</option>
          <option value="결제">결제</option>
          <option value="반품/환불">반품/환불</option>
          <option value="배송">배송</option>
          <option value="프로모션/쿠폰">프로모션/쿠폰</option>
          <option value="상품문의">상품문의</option>
          <option value="커뮤니티">커뮤니티</option>
        </select>
      </div>
      <div>
        내용{" "}
        <Textarea
          onChange={handleChange}
          name="contents"
          value={state.contents}
        />
      </div>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <ButtonContainer>
        <Button onClick={handleSave}>추가</Button>
        <Button
          onClick={() => navigate(-1)}
          style={{ backgroundColor: "gray" }}
        >
          뒤로가기
        </Button>
      </ButtonContainer>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="공지 등록 완료 확인"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "300px",
            height: "180px",
            margin: "auto",
          },
        }}
      >
        <>
          <br />
          <h3>공지가 등록되었습니다!</h3>
          <button onClick={() => navigate("/admin/help")}>
            목록으로 돌아가기
          </button>
        </>
      </Modal>
    </FormContainer>
  );
}
