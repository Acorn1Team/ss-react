import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Style/HeaderForm.module.css";

function AutoSearch() {
  const [inputValue, setInputValue] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [category, setCategory] = useState("actor");
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (inputValue) {
        try {
          const response = await axios.get(
            `http://localhost:8080/user/search/${category}?term=${inputValue}`
          );
          if (!isCancelled) {
            // 취소된 경우 상태 업데이트하지 않음
            if (Array.isArray(response.data)) {
              setFilteredItems(response.data);
            } else {
              console.error("Unexpected response data format");
              setFilteredItems([]);
            }
            setShowDropdown(true);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error("Error fetching data:", error);
            setFilteredItems([]);
          }
        }
      } else {
        setShowDropdown(false);
      }
    };

    fetchData();

    return () => {
      isCancelled = true; // 이전 요청 취소
    };
  }, [inputValue, category]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = (item) => {
    setInputValue(item.name || item.title || item);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const encodedInputValue = encodeURIComponent(inputValue);
    const encodedCategory = encodeURIComponent(category);
    navigate(
      `/user/search?category=${encodedCategory}&name=${encodedInputValue}`
    );
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSearch}>
      <select
        className={styles.searchSelect}
        onChange={(e) => setCategory(e.target.value)}
        value={category}
      >
        <option value="actor">배우</option>
        <option value="show">작품</option>
        <option value="product">상품</option>
        <option value="user">사용자</option>
      </select>
      <input
        type="text"
        className={styles.searchInput}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Search..."
      />
      <button type="submit" className={styles.searchButton}>
        조회
      </button>

      {showDropdown && (
        <div className={styles.autoSearchContainer}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                className={styles.autoSearchItem}
                onMouseDown={() => handleClick(item)}
              >
                {item.name || item.title || item}
              </div>
            ))
          ) : (
            <div className={styles.autoSearchItem}>검색 결과가 없습니다</div>
          )}
        </div>
      )}
    </form>
  );
}

export default AutoSearch;
