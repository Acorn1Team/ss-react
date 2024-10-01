import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import styles from "../Style/PromotionPopup.module.css";

export default function PromotionPopup() {
  const navigate = useNavigate();
  const [locationCategory, setLocationCategory] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [path, setPath] = useState("/user/shop/productlist");
  const [pic, setPic] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false); // 오류 모달 상태
  const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태

  const changeInputValue = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/admin/promotion/autocomplete/${locationCategory}/${inputValue}`
        );
        setFilteredItems(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFilteredItems([]);
      }
    };
    if (locationCategory && inputValue && locationCategory !== "productlist") {
      fetchData();
    }
  }, [locationCategory, inputValue]);

  // selectPath 메소드 수정
  const selectPath = (item) => {
    const newPath =
      locationCategory === "product"
        ? `/user/shop/productlist/detail/${item.no}`
        : locationCategory === "productlist"
        ? `/user/shop/productlist`
        : `/user/main/sub/${item.no}`;
    setPath(newPath);
    setShowDropdown(false);
    setInputValue(item.name || item.title);
  };

  const changePopupFile = (e) => {
    setPic(e.target.files[0]);
  };

  // validateForm 메소드 수정
  const validateForm = () => {
    if (!pic) {
      setErrorMessage("파일을 선택해 주세요.");
      return false;
    }
    if (!locationCategory) {
      setErrorMessage("유도 경로를 선택해 주세요.");
      return false;
    }
    if (locationCategory !== "productlist" && !inputValue) {
      setErrorMessage(" 입력 필드를 선택해 주세요.");
      return false;
    }
    return true;
  };

  const addPopup = () => {
    if (!validateForm()) {
      setErrorModalOpen(true); // 오류 발생 시 오류 모달 열기
      return;
    }

    const formData = new FormData();
    formData.append("path", path);
    formData.append("pic", pic);

    axios
      .post("/admin/popup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setIsModalOpen(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>팝업 등록</h2>
      <div className={styles.formGroup}>
        <input
          type="file"
          onChange={changePopupFile}
          className={styles.inputFile}
        />
      </div>
      <form className={styles.formGroup}>
        <select
          onChange={(e) => setLocationCategory(e.target.value)}
          value={locationCategory}
          className={styles.select}
        >
          <option value="">유도 경로 선택</option>
          <option value="productlist">상품 목록 페이지</option>
          <option value="product">상품 상세 페이지</option>
          <option value="show">작품 등장인물 페이지</option>
        </select>

        {/* productlist 선택 시 input 태그를 숨기기 */}
        {locationCategory !== "productlist" && (
          <input
            placeholder="어디로?"
            type="text"
            value={inputValue}
            onChange={changeInputValue}
            onBlur={() => setShowDropdown(false)}
            onFocus={() => setShowDropdown(true)}
            className={styles.inputText}
          />
        )}

        {showDropdown && locationCategory !== "productlist" && (
          <div className={styles.autoSearchContainer}>
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className={styles.autoSearchItem}
                onMouseDown={() => selectPath(item)}
              >
                {item.name || item.title}
              </div>
            ))}
          </div>
        )}
      </form>
      <button onClick={addPopup} className={styles.button}>
        등록
      </button>

      {/* 성공 모달 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="팝업 등록 완료 확인"
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
          <h3>팝업이 등록되었습니다!</h3><br/>
          <button onClick={() => navigate("/admin/promotion")}>
            목록으로 돌아가기
          </button>
        </>
      </Modal>

      {/* 오류 모달 */}
      <Modal
        isOpen={errorModalOpen}
        onRequestClose={() => setErrorModalOpen(false)}
        contentLabel="오류 확인"
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
          <h3>{errorMessage}</h3>
          <button onClick={() => setErrorModalOpen(false)}>확인</button>
        </>
      </Modal>
    </div>
  );
}
