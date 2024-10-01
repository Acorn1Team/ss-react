import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../Style/ProductForm.css";
import Modal from "react-modal";
import "../Style/admin.css";
export default function ProductUpdateForm() {
  const { no } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    name: "",
    price: "",
    contents: "",
    category: "기타", // 기본값을 "기타"로 설정
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
      .get("/api/admin/product/" + no)
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
      .put("/api/admin/product/" + no, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.isSuccess) {
          navigate("/admin/product");
        } else {
          console.log("수정에 실패했습니다: " + res.data.message);
        }
      })
      .catch((error) => {
        console.log(
          "오류 발생: " +
            (error.response ? error.response.data : "알 수 없는 오류")
        );
      });
  };


  return (
    <div className="form-container">
      <button
        className="cancel-button"
        onClick={() => {navigate(-1)}}
      >
        뒤로
      </button>
      <div style={{textAlign:'center'}}>
        <img src={state.pic} alt={state.name} style={{width:'30%'}}/><br/>
      </div>
      <h2 className="form-title">상품 정보 수정</h2>
      <div className="form-group">
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          name="price"
          value={state.price}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          name="contents"
          value={state.contents}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
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
        수정할 이미지: <input type="file" name="pic" onChange={handleFileChange} />
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
      <div id="admin-body">
        <button
          className="update-button"
          onClick={handleSave}
          disabled={!isFormValid()}
        >
          수정 완료
        </button>
      </div>
    </div>
  );
}
