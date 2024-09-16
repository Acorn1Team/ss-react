import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../Style/ProductForm.css";

Modal.setAppElement("#root"); // 접근성 설정

export default function ProductInsert() {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const [state, setState] = useState({
    name: "", // 상품명
    price: 0, // 가격
    contents: "", // 상품 설명
    category: "", // 카테고리
    pic: null, // 이미지 파일
    stock: 0, // 재고
    discountRate: 0, // 할인율
  });

  const [errors, setErrors] = useState({}); // 에러 메시지 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  const [modalMessage, setModalMessage] = useState(""); // 모달 메시지 상태

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 숫자 필드의 값을 숫자로 변환하여 처리
    const parsedValue = ["price", "stock", "discountRate"].includes(name)
      ? parseInt(value) || 0
      : value;

    setState((prevState) => ({
      ...prevState,
      [name]: parsedValue,
    }));
  };

  // 이미지 파일 선택 처리
  const handleFileChange = (e) => {
    const { files } = e.target;
    setState((prevState) => ({
      ...prevState,
      pic: files[0], // 첫 번째 파일을 상태에 저장
    }));
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};
    if (!state.name) newErrors.name = "상품명을 입력하세요.";
    if (!state.price || state.price <= 0)
      newErrors.price = "유효한 가격을 입력하세요.";
    if (!state.contents) newErrors.contents = "상품 설명을 입력하세요.";
    if (!state.category) newErrors.category = "카테고리를 선택하세요.";
    if (!state.stock || state.stock < 0)
      newErrors.stock = "유효한 재고를 입력하세요.";
    if (state.discountRate < 0 || state.discountRate > 100) {
      newErrors.discountRate = "할인율은 0과 100 사이여야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // 에러가 없으면 true 반환
  };

  // 모달 열기
  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/admin/product"); // 모달 닫고 상품 목록 페이지로 이동
  };

  // 저장 버튼 클릭 시 실행되는 함수
  const handleSave = () => {
    // 유효성 검사
    if (!validate()) {
      return; // 유효성 검사가 통과되지 않으면 종료
    }

    const formData = new FormData();
    const { pic, ...otherData } = state;
    formData.append("productDto", JSON.stringify({ ...otherData }));

    // 파일이 있는 경우 파일을 추가
    if (pic) {
      formData.append("pic", pic);
    }

    // 서버에 데이터 전송
    axios
      .post("/admin/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // FormData로 전송
        },
      })
      .then((res) => {
        if (res.data.isSuccess) {
          openModal("상품이 성공적으로 등록되었습니다.");
        } else {
          openModal("상품 등록에 실패했습니다: " + res.data.message);
        }
      })
      .catch((error) => {
        if (error.response) {
          openModal("오류 발생: " + error.response.data);
        } else {
          console.log(error);
        }
      });
  };

  return (
    <div className="form-container">
      <h2 className="form-title">상품 추가</h2>
      <div className="form-group">
        <input
          onChange={handleChange}
          type="text"
          name="name"
          placeholder="상품명을 입력하세요"
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>
      <br />
      <div className="form-group">
        <input
          onChange={handleChange}
          type="text"
          name="price"
          placeholder="가격을 입력하세요"
        />
        {errors.price && <p className="error-message">{errors.price}</p>}
      </div>
      <br />
      <div className="form-group">
        <textarea
          onChange={handleChange}
          name="contents"
          placeholder="상품 설명을 입력하세요"
        />
        {errors.contents && <p className="error-message">{errors.contents}</p>}
      </div>
      <br />
      <div className="form-group">
        <select onChange={handleChange} name="category">
          <option value="">카테고리를 선택해주세요</option>
          <option value="상의">상의</option>
          <option value="하의">하의</option>
          <option value="신발">신발</option>
          <option value="기타">기타</option>
        </select>
        {errors.category && <p className="error-message">{errors.category}</p>}
      </div>
      <br />
      <div className="form-group">
        이미지:{" "}
        <input
          onChange={handleFileChange}
          type="file"
          name="pic"
          accept="image/*"
        />
      </div>
      <br />
      <div className="form-group">
        <input
          onChange={handleChange}
          type="text"
          name="stock"
          placeholder="재고를 입력하세요"
        />
        {errors.stock && <p className="error-message">{errors.stock}</p>}
      </div>
      <br />
      <div className="form-group">
        <input
          onChange={handleChange}
          type="text"
          name="discountRate"
          placeholder="할인율을 입력하세요"
        />
        {errors.discountRate && (
          <p className="error-message">{errors.discountRate}</p>
        )}
      </div>
      <br />
      <button
        className="update-button"
        onClick={handleSave} // 버튼이 클릭될 때마다 유효성 검사 수행
      >
        추가
      </button>

      {/* 모달 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="상품 추가 모달"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center"
          },
        }}
      >
        <h3>{modalMessage}</h3>
        <button className="confirm-button" onClick={closeModal}>확인</button>
      </Modal>
    </div>
  );
}
