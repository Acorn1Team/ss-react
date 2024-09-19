import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import styles from "../Style/ProductList.module.css"; // 기존 스타일
import checkboxStyles from "./ProductListCheckbox.module.css"; // 체크박스 스타일 임포트

export default function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("latest"); // 기본 정렬 옵션: 최신순
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(9); // 페이지당 상품 수
  const [totalPages, setTotalPages] = useState(1);
  const [selectCategory, setSelectCategory] = useState("전체");
  const [excludeSoldOut, setExcludeSoldOut] = useState(false); // 품절 상품 제외 여부

  const categories = ["전체", "상의", "하의", "신발", "기타"];

  // 할인가격 계산 함수
  const calculateSellingPrice = (price, discountRate) => {
    return price - (price * discountRate) / 100;
  };

  // 품절 상품 존재 여부 확인 함수
  const hasSoldOutProducts = products.some((product) => product.stock === 0);

  // 데이터 새로고침: 카테고리 및 정렬 기준에 따라
  const refresh = async (selectedCategory, sortOption) => {
    const endpoint =
      selectedCategory && selectedCategory !== "전체"
        ? `/list/category/${selectedCategory}`
        : "/list"; // "전체"일 때는 기본 전체 상품 목록 호출

    try {
      const res = await axios.get(endpoint);
      // 판매 가능한 상품만 필터링
      let filteredProducts = res.data.content.filter(
        (product) => product.available === true // available이 true인 상품만 필터링
      );

      // 정렬 기준 적용
      let sortedProducts = sortProducts(filteredProducts, sortOption);

      if (excludeSoldOut) {
        sortedProducts = sortedProducts.filter((product) => product.stock > 0); // 품절 상품 제외
      }
      setProducts(sortedProducts);
      setTotalPages(Math.ceil(sortedProducts.length / pageSize)); // 페이지 수 계산
    } catch (error) {
      console.log(error);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (newCategory) => {
    setSelectCategory(newCategory); // 선택한 카테고리 업데이트
    setCurrentPage(0); // 페이지 초기화
    refresh(newCategory, "latest"); // 최신순으로 상품 목록 새로고침
  };

  // 정렬 함수 추가
  const sortProducts = (products, option) => {
    let sorted = [...products];
    switch (option) {
      case "latest":
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
        break;
      case "sales":
        sorted.sort((a, b) => b.count - a.count); // 판매순
        break;
      case "priceHigh":
        sorted.sort((a, b) => b.price - a.price); // 가격 높은 순
        break;
      case "priceLow":
        sorted.sort((a, b) => a.price - b.price); // 가격 낮은 순
        break;
      case "rating":
        sorted.sort((a, b) => b.score - a.score); // 평점순
        break;
      default:
        break;
    }
    return sorted;
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option); // 사용자가 선택한 정렬 옵션 설정
    refresh(selectCategory, option); // 정렬 옵션을 변경했을 때 새로고침
  };

  // 품절 상품 제외 체크박스 핸들러
  const handleExcludeSoldOutChange = (e) => {
    setExcludeSoldOut(e.target.checked); // 품절 상품 제외 여부 설정
  };

  useEffect(() => {
    refresh(selectCategory, sortOption);
  }, [excludeSoldOut, selectCategory, sortOption]);

  // 현재 페이지에 맞는 제품 목록을 자르기
  const paginatedProducts = products.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // 컴포넌트가 마운트될 때 처음으로 최신순으로 "전체" 카테고리를 새로고침
  useEffect(() => {
    refresh("전체", "latest"); // 기본값: "전체" 카테고리, "최신순"
  }, []);

  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label id={styles.sortOptions} className={styles.sortOptions}>
          <select
            id={styles.sortSelect}
            className={styles.sortSelect}
            value={sortOption} // 현재 선택된 정렬 옵션
            onChange={handleSortChange}
          >
            <option value="latest">최신순</option>
            <option value="sales">판매순</option>
            <option value="priceHigh">가격 높은 순</option>
            <option value="priceLow">가격 낮은 순</option>
            <option value="rating">평점순</option>
          </select>
        </label>


       {/* 체크박스가 항상 표시되도록 하고, 체크 상태에 따라 체크 표시를 보여줌 */}
       <div className={styles.excludeSoldOutContainer}>
  <div className={checkboxStyles.cntr}>
    {/* 기본 체크박스를 숨기기 위한 클래스 적용 */}
    <input
      className={checkboxStyles.input} // input 클래스 사용
      id="cbx"
      type="checkbox"
      checked={excludeSoldOut}
      onChange={handleExcludeSoldOutChange}
    />
    <label className={checkboxStyles.cbx} htmlFor="cbx"></label> {/* 커스텀 체크박스 */}
  </div>
  <label className={styles.excludeSoldOutLabel} htmlFor="cbx">
    품절 상품 제외
  </label>
</div>



      </div>

      <div className={checkboxStyles["radio-input"]}>
        {categories.map((cate, index) => (
          <React.Fragment key={index}>
            <input
              type="radio"
              id={`category-${index}`}
              value={cate}
              checked={selectCategory === cate}
              onChange={() => handleCategoryChange(cate)}
            />
            <label htmlFor={`category-${index}`}>{cate}</label>
          </React.Fragment>
        ))}
      </div>

      <div className={styles.productList}>
        {paginatedProducts.map((product) => (
          <div
            key={product.no}
            className={`${styles.productItem} ${
              product.stock === 0 ? styles.soldOutOverlay : ""
            }`}
          >
            {product.stock === 0 && (
              <div className={styles.soldOutMessage}>품절된 상품입니다.</div>
            )}
            <Link to={`/user/shop/productlist/detail/${product.no}`}>
              <div className={styles.productImage3}>
                <img src={product.pic} alt={`${product.name} 사진`} />
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productPrice}>
                  {product.discountRate > 0 ? (
                    <>
                      <span style={{ textDecoration: "line-through" }}>
                        {product.price.toLocaleString()}원
                      </span>
                      &nbsp;
                      <span style={{ color: "#df919e", fontWeight: "bold" }}>
                        {calculateSellingPrice(
                          product.price,
                          product.discountRate
                        ).toLocaleString()}
                        원 ({product.discountRate}% 할인)
                      </span>
                    </>
                  ) : (
                    <>{product.price.toLocaleString()}원</>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            이전
          </button>
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
