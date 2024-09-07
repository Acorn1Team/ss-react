import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import styles from "../Style/PromotionPopup.module.css";

export default function PromotionPopup() {
  const navigate = useNavigate();
  const [locationCategory, setLocationCategory] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [path, setPath] = useState("");
  const [pic, setPic] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const changeInputValue = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/admin/promotion/autocomplete/${locationCategory}/${inputValue}`
        );
        setFilteredItems(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFilteredItems([]);
      }
    };
    if (locationCategory && inputValue) {
      fetchData();
    }
  }, [locationCategory, inputValue]);

  const selectPath = (item) => {
    setPath(`${locationCategory}/${item.no}`);
    setShowDropdown(false);
    setInputValue(item.name || item.title);
  };

  const changePopupFile = (e) => {
    setPic(e.target.files[0]);
  };

  const addPopup = () => {
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
        alert("추가 성공");
        navigate("/admin/promotion");
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
          <option value="product">상품 페이지</option>
          <option value="show">작품 등장인물 페이지</option>
          <option value="character">캐릭터 페이지</option>
        </select>
        <input
          placeholder="어디로?"
          type="text"
          value={inputValue}
          onChange={changeInputValue}
          onBlur={() => setShowDropdown(false)}
          onFocus={() => setShowDropdown(true)}
          className={styles.inputText}
        />
        {showDropdown && (
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
    </div>
  );
}
