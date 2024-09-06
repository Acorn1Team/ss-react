import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductUpdateForm.css"; // 스타일링 추가

export default function ProductUpdateForm() {
  const { no } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    name: "",
    price: "",
    contents: "",
    category: "상의", // 기본값을 "상의"로 설정
    pic: null,
    stock: "",
    discountRate: "",
  });

  const [errors, setErrors] = useState({
    stock: "",
    discountRate: "",
  });

  const isFormValid = () => {
    return !errors.stock && !errors.discountRate;
  };

  useEffect(() => {
    axios
      .get("/admin/product/" + no)
      .then((res) => {
        setState(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [no]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setState({
      ...state,
      [name]: value,
    });

    // 유효성 검사 수행
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    if (name === "stock") {
      if (value < 0) {
        newErrors.stock = "재고는 0 이상이어야 합니다.";
      } else {
        newErrors.stock = "";
      }
    }

    if (name === "discountRate") {
      if (value < 0 || value > 100) {
        newErrors.discountRate = "할인율은 0에서 100 사이여야 합니다.";
      } else {
        newErrors.discountRate = "";
      }
    }

    setErrors(newErrors);
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    setState((prevState) => ({
      ...prevState,
      pic: files[0], // 이미지 파일 객체를 pic 상태에 저장
    }));
  };

  const handleSave = () => {
    if (!isFormValid()) {
      return;
    }

    const formData = new FormData();

    // 상품 데이터를 JSON 문자열로 변환하여 FormData에 추가
    formData.append(
      "productDto",
      JSON.stringify({
        ...state,
        pic: state.pic ? null : state.pic, // pic 필드가 없거나 이미 경로라면 null로 설정
      })
    );

    // 선택된 이미지 파일이 있는 경우 FormData에 추가
    if (state.pic instanceof File) {
      formData.append("pic", state.pic);
    }

    axios
      .put("/admin/product/" + no, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.isSuccess) {
          navigate("/admin/product");
        } else {
          alert("수정에 실패했습니다: " + res.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        alert(
          "오류 발생: " +
            (error.response ? error.response.data : "알 수 없는 오류")
        );
      });
  };

  return (
    <div className="form-container">
      <h2 className="form-title">상품 정보 수정</h2>
      <div className="form-group">
        <label>이름 :</label>
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>가격 :</label>
        <input
          type="text"
          name="price"
          value={state.price}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>콘텐츠 :</label>
        <input
          type="text"
          name="contents"
          value={state.contents}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>카테고리 :</label>
        <select
          name="category"
          value={state.category}
          onChange={handleChange}
          className="form-control"
        >
          <option value="상의">상의</option>
          <option value="하의">하의</option>
          <option value="신발">신발</option>
          <option value="기타">기타</option>
        </select>
      </div>
      <div className="form-group">
        <label>이미지 :</label>
        <input type="file" name="pic" onChange={handleFileChange} />
      </div>
      <div className="form-group">
        <label>재고 :</label>
        <input
          type="number"
          name="stock"
          value={state.stock}
          onChange={handleChange}
          className="form-control"
        />
        {errors.stock && <p className="error-message">{errors.stock}</p>}
      </div>
      <div className="form-group">
        <label>할인율 :</label>
        <input
          type="number"
          name="discountRate"
          value={state.discountRate}
          onChange={handleChange}
          className="form-control"
          min="0"
          max="100"
        />
        {errors.discountRate && (
          <p className="error-message">{errors.discountRate}</p>
        )}
      </div>

      <button
        className="form-button"
        onClick={handleSave}
        disabled={!isFormValid()}
      >
        수정 확인
      </button>
    </div>
  );
}
