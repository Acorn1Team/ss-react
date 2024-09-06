import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductForm.css";

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

  // 저장 버튼 클릭 시 실행되는 함수
  const handleSave = () => {
    const formData = new FormData();

    // 오늘 날짜를 생성하여 productDto에 추가
    const today = new Date().toISOString(); // ISO 형식으로 변환
    const { pic, ...otherData } = state;
    formData.append(
      "productDto",
      JSON.stringify({ ...otherData, date: today })
    );

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
          alert("상품이 성공적으로 추가되었습니다.");
          navigate("/admin/product"); // 성공 시 상품 목록 페이지로 이동
        } else {
          alert("상품 추가에 실패했습니다: " + res.data.message);
        }
      })
      .catch((error) => {
        if (error.response) {
          alert("오류 발생: " + error.response.data);
        } else {
          console.log(error);
        }
      });
  };

  return (
    <div className="form-container">
      <h2 className="form-title">상품 추가</h2>
      <div className="form-group">
        <label>상품명:</label>
        <input
          onChange={handleChange}
          type="text"
          name="name"
          placeholder="상품명을 입력하세요"
        />
      </div>
      <br />
      <div className="form-group">
        <label>가격:</label>
        <input
          onChange={handleChange}
          type="text"
          name="price"
          placeholder="가격을 입력하세요"
        />
      </div>
      <br />
      <div className="form-group">
        <label>상품 설명:</label>
        <textarea
          onChange={handleChange}
          name="contents"
          placeholder="상품 설명을 입력하세요"
        />
      </div>
      <br />
      <div className="form-group">
        <label>카테고리:</label>
        <select onChange={handleChange} name="category">
          <option value="">선택해주세요</option>
          <option value="상의">상의</option>
          <option value="하의">하의</option>
          <option value="신발">신발</option>
          <option value="기타">기타</option>
        </select>
      </div>
      <br />
      <div className="form-group">
        <label>이미지:</label>
        <input
          onChange={handleFileChange}
          type="file"
          name="pic"
          accept="image/*"
        />
      </div>
      <br />
      <div className="form-group">
        <label>재고:</label>
        <input
          onChange={handleChange}
          type="text"
          name="stock"
          placeholder="재고를 입력하세요"
        />
      </div>
      <br />
      <div className="form-group">
        <label>할인율:</label>
        <input
          onChange={handleChange}
          type="text"
          name="discountRate"
          placeholder="할인율을 입력하세요"
        />
      </div>
      <br />
      <button className="update-button" onClick={handleSave}>추가</button>
    </div>
  );
}
