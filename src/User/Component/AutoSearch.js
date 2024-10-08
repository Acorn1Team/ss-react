import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Style/HeaderForm.module.css";
import "../Style/All.css";

function AutoSearch({ onSearch }) {
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
            `/api/user/search/${category}?term=${inputValue}`
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
  }, [inputValue, category, setFilteredItems]);

  useEffect(() => {
    // 페이지 이동 시 입력값 초기화
    setInputValue("");
    setShowDropdown(false);
  }, [navigate]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = (item) => {
    setInputValue(item.name || item.title || item);
    setShowDropdown(false);

    // 자동완성 항목을 클릭했을 때 바로 검색 실행
    const encodedInputValue = encodeURIComponent(
      item.name || item.title || item
    );
    const encodedCategory = encodeURIComponent(category);
    navigate(
      `/user/search?category=${encodedCategory}&name=${encodedInputValue}`
    );
    setInputValue(""); // 검색 후 입력창 초기화
    if (onSearch) {
      onSearch();
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const encodedInputValue = encodeURIComponent(inputValue);
    const encodedCategory = encodeURIComponent(category);
    navigate(
      `/user/search?category=${encodedCategory}&name=${encodedInputValue}&page=0&size=5`
    );
  };

  const EnterSearch = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <form className={styles.searchForm}>
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
        onKeyDown={EnterSearch}
      />

      <input
        onClick={handleSearch}
        onKeyDown={EnterSearch}
        type="button"
        value="검색"
        className={`btn4 ${styles.searchButton}`}
      ></input>

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
